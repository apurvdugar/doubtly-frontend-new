import React, { useState, useRef, useEffect } from 'react';
import { Card, Text, Button, Box, Flex, Avatar, Separator, TextArea } from '@radix-ui/themes';
import { ThumbsUp, MessageCircle, Clock, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import SideBar from '../components/SideBar';

function SolutionPage() {
  const { doubtId } = useParams();
  const navigate = useNavigate();
  const solutionRef = useRef(null);
  
  const [doubt, setDoubt] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [upvoting, setUpvoting] = useState(null);

  useEffect(() => {
    fetchDoubtDetails();
    fetchSolutions();
  }, [doubtId]);

  const fetchDoubtDetails = async () => {
    if (!doubtId) {
      setError("Invalid doubt ID");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing");
        return;
      }
      
      const response = await axios.get(
        `https://doubtly-backend.onrender.com/api/doubt/show/id/${doubtId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      if (!response.data.result) {
        setError("No doubt data received");
        return;
      }
      
      setDoubt(response.data.result);
      setError(null);
    } catch (error) {
      setError("Failed to load doubt details");
      toast.error("Failed to load doubt details");
    }
  };

  const fetchSolutions = async () => {
    if (!doubtId) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://doubtly-backend.onrender.com/api/solution/show/${doubtId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      const solutionsData = response.data.result || [];
      const formattedSolutions = solutionsData.map(solution => ({
        ...solution,
        id: solution.id,
        upvotes: solution.upvotes,
        isUpvoted: solution.isUpvoted
      }));
      
      setSolutions(formattedSolutions);
      setError(null);
    } catch (error) {
      setError("Failed to load solutions");
      toast.error("Failed to load solutions");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSolutionUpvote = async (solution) => {
    if (upvoting === solution.id) return;
    
    setUpvoting(solution.id);
    
    const isCurrentlyUpvoted = solution.isUpvoted;
    const newUpvotes = isCurrentlyUpvoted ? solution.upvotes - 1 : solution.upvotes + 1;
    
    setSolutions(prev => 
      prev.map(s => 
        s.id === solution.id 
          ? { ...s, isUpvoted: !isCurrentlyUpvoted, upvotes: newUpvotes } 
          : s
      )
    );
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      await axios.put(
        `https://doubtly-backend.onrender.com/api/solution/updateUpvotes/${solution.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      toast.success(isCurrentlyUpvoted ? "Upvote removed" : "Solution upvoted!");
    } catch (error) {
      setSolutions(prev => 
        prev.map(s => 
          s.id === solution.id 
            ? { ...s, isUpvoted: isCurrentlyUpvoted, upvotes: solution.upvotes } 
            : s
        )
      );
      
      if (error.message === "Authentication required") {
        toast.error("Please log in to upvote");
      } else {
        toast.error("Failed to update upvote");
      }
    } finally {
      setUpvoting(null);
    }
  };

  const handleSubmitSolution = async () => {
    const solutionText = solutionRef.current?.value?.trim();
    if (!solutionText) {
      toast.error("Please enter a solution");
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://doubtly-backend.onrender.com/api/solution/add/${doubtId}`,
        { solution: solutionText },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success("Solution posted successfully!");
        solutionRef.current.value = "";
        fetchSolutions();
      }
    } catch (error) {
      toast.error("Failed to post solution");
    } finally {
      setSubmitting(false);
    }
  };

  const currentDoubt = doubt || {
    _id: doubtId,
    title: "Error loading doubt",
    username: "Unknown",
    description: "Could not load doubt details",
    answerCount: 0,
    upvotes: 0,
    timeAgo: "Unknown",
  };

  if (!loading && !doubt && !error) {
    return (
      <>
        <NavBar doubtly={false} searchBar={true} notification={true} profile={true}/>
        <SideBar />
        <main className="pt-16 pl-72 pr-8 min-h-screen bg-primary">
          <div className="container py-6">
            <Card className="w-full bg-white p-6 rounded-lg shadow-xl">
              <Flex justify="between" align="center" mb="4">
                <Text size="6" weight="bold">Error</Text>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(-1)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </Button>
              </Flex>
              <Text size="3" color="red" mb="4">Failed to load doubt data</Text>
              <Flex gap="3" justify="end">
                <Button variant="soft" onClick={() => navigate(-1)}>Go Back</Button>
                <Button color="blue" onClick={() => {
                  setLoading(true);
                  fetchDoubtDetails();
                }}>Retry</Button>
              </Flex>
            </Card>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar doubtly={false} searchBar={false} notification={true} profile={true}/>
      <SideBar />
      <main className="pt-16 pl-72 pr-8 min-h-screen bg-primary flex flex-col dark:bg-[#121212]">
        <div className="container w-[70%] py-6 space-y-8 flex-grow">
          
          <div>
            <div className="space-y-3 dark:bg-[#121212]">
              <div>
                <Text size="6" weight="bold" className="text-gray-900 dark:text-white">
                  {currentDoubt.title || 'Untitled Doubt'}
                </Text>
                <br />
                <Text className="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {currentDoubt.description || 'No description available'}
                </Text>
              </div>
              <div className="flex items-center justify-end gap-1">
                <Text size="3">Posted by </Text>
                <Text size="3" weight="bold" className="dark:text-white">{currentDoubt.username || 'Unknown'}</Text>
              </div>

              <Flex gap="6" className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Flex align="center" gap="2" className="text-gray-500 dark:text-gray-400">
                  <MessageCircle size={16} />
                  <Text size="2">{currentDoubt.answerCount ?? 0} Solutions</Text>
                </Flex>
                <Flex align="center" gap="2" className="text-gray-500 dark:text-gray-400">
                  <ThumbsUp size={16} />
                  <Text size="2">{currentDoubt.upvotes ?? 0} Upvotes</Text>
                </Flex>
                <Flex align="center" gap="2" className="text-gray-500 dark:text-gray-400">
                  <Clock size={16} />
                  <Text size="2">{currentDoubt.timeAgo || 'Recently'}</Text>
                </Flex>
              </Flex>
            </div>
          </div>

          <div className="space-y-4">
            <Text size="5" weight="bold" className="dark:text-white">Solutions ({solutions.length})</Text>
            
            {solutions.length === 0 ? (
              <Card className="bg-white/50 p-8 text-center dark:bg-[#1C1C1E]">
                <Text size="3" color="gray" className="mb-2 dark:text-gray-300">No solutions yet</Text>
                <br />
                <Text size="2" color="gray" className="dark:text-gray-400">Be the first one to help solve this doubt!</Text>
              </Card>
            ) : (
              <div className="space-y-4">
                {solutions.map((solution) => (
                  <Card key={solution.id} className="bg-white/50 hover:bg-white/80 transition-colors p-6 dark:bg-[#1C1C1E]">
                    <Flex direction="column" gap="4">
                      <Text className="text-gray-700 dark:text-gray-300">{solution.solution}</Text>
                      <Flex align="center" justify="between">
                        <Flex align="center" gap="1">
                          <Avatar 
                            size="2"
                            src={solution.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(solution.username || 'User')}`}
                            fallback={solution.user?.name?.[0] || 'U'}
                            className="border-2 border-white dark:border-gray-700"
                          />
                          <div>
                            <Text weight="bold" size="2" className="dark:text-white">{solution.username || 'Anonymous'}</Text>
                            <Text size="1" color="gray" className="dark:text-gray-400">{solution.timeAgo}</Text>
                          </div>
                        </Flex>
                        <span
                          className={`flex items-center gap-1 hover:text-blue-500 cursor-pointer transition-colors ${
                            upvoting === solution.id ? "opacity-50" : ""
                          } ${solution.isUpvoted ? "text-blue-500" : ""}`}
                          onClick={() => handleSolutionUpvote(solution)}
                          title={solution.isUpvoted ? "Remove upvote" : "Upvote this solution"}
                        >
                          <ThumbsUp 
                            className={`h-4 w-4 ${upvoting === solution.id ? "animate-pulse" : ""}`}
                            fill={solution.isUpvoted ? "currentColor" : "none"}
                          />
                          <Text size="2">{solution.upvotes}</Text>
                        </span>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className='mt-24 p-8'></div>
          <Card className="bg-white/50 hover:bg-white/80 p-6 dark:bg-[#1C1C1E]">
            <div className='p-6'>
              <h3 className="mb-4 font-bold text-xl dark:text-white">Post Your Solution</h3>
              <textarea 
                placeholder="Share your solution or approach..."
                ref={solutionRef}
                className="min-h-[300px] min-w-full mb-4 resize-none p-2 start-0 bg-white/50 border-[1px] border-gray-300 dark:bg-[#1C1C1E] dark:text-white dark:placeholder:text-gray-400"
              />
              <Flex gap="3" justify="end">
                <Button variant="soft" onClick={() => navigate(-1)} disabled={submitting} className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">Cancel</Button>
                <Button color="blue" onClick={handleSubmitSolution} disabled={submitting}>
                  {submitting ? (
                    <Flex align="center" gap="2">
                      <span className="animate-spin">⏳</span> 
                      <span>Posting...</span>
                    </Flex>
                  ) : (
                    'Post Solution'
                  )}
                </Button>
              </Flex>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}

export default SolutionPage; 