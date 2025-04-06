import React from 'react';
import { Card, Box, Text, Flex } from "@radix-ui/themes";
import UserCard from './UserCard';
import useLeaderboard from '../../hooks/useLeaderboard';

export default function TopPerformer() {
    const { leaderboardData, loading, error } = useLeaderboard();
    
    const topUsers = loading ? [] : leaderboardData.slice(0, 3);

    const getRankIcon = (rank) => {
        if (rank === 1) return <span className="text-yellow-400">🏆</span>;
        if (rank === 2) return <span className="text-gray-400">🥈</span>;
        if (rank === 3) return <span className="text-amber-600">🥉</span>;
        return rank;
    };

    if (loading) {
        return (
            <div className="max-w-[1200px] mx-auto p-5 text-center">
                <Text size="8" weight="bold" className="text-gray-800 dark:text-white">Leaderboard</Text>
                <div className="mt-10">Loading leaderboard data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-[1200px] mx-auto p-5 text-center">
                <Text size="8" weight="bold" className="text-gray-800 dark:text-white">Leaderboard</Text>
                <div className="mt-10 text-red-500">Error loading leaderboard: {error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto p-5">
        <div className="text-center mb-10">
            <Text size="8" weight="bold" className="text-gray-800 dark:text-white">Leaderboard</Text>
        </div>

        <Flex gap="6" justify="center" align="end" wrap="wrap" className="mb-10">
            {topUsers.filter(user => user.rank === 2).map(user => (
                <UserCard key={user.id} user={user} className="w-[250px] md:w-[280px] bg-gray-200 dark:bg-gray-800 shadow-md" />
            ))}

            {topUsers.filter(user => user.rank === 1).map(user => (
                <UserCard key={user.id} user={user} className="w-[300px] md:w-[320px]  bg-gray-200 dark:bg-gray-800 shadow-lg scale-110" />
            ))}

            {topUsers.filter(user => user.rank === 3).map(user => (
                <UserCard key={user.id} user={user} className="w-[250px] md:w-[280px] bg-gray-200 dark:bg-gray-800 shadow-md" />
            ))}
        </Flex>
        </div>
    );
}