import { Button } from "@radix-ui/themes";
import React from "react";
import { Link } from "react-router-dom";


function NavBar() {
  return (
    <>
     <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-50 flex items-center justify-center">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 ">
            <span className="font-bold text-3xl">Doubtly</span>
          </div>
          <div className="flex items-center gap-1">
            <Link to="/login"><button className="font-medium hover:bg-blue-100 py-2 px-4 border rounded-lg">Log in</button></Link>
            <Link to="/signup"><Button size="3" color="blue">Sign up</Button></Link>
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
