import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

function Layout() {
  return (
    <div className='bg-[#181818] flex flex-col items-center justify-start h-[100vh]'>
      <Navbar />
      <div className=" bg-[#181818]  w-full  flex flex-col justify-center items-center">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
