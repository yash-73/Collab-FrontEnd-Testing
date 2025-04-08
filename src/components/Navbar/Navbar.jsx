import { Link } from "react-router-dom";
// import {useState} from 'react'
import { FaGithub } from "react-icons/fa";

import { useSelector } from "react-redux";
import { logout, login } from "../../store/AuthSlice";
import { useEffect, useState } from "react";

function Navbar() {

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const user = useSelector((state) => state.auth.user);

useEffect(() => {
  
  if(user.isLoggedIn){
    setIsLoggedIn(true)
  }
}, [user])  


  console.log(isLoggedIn);

  const navItems = [
    {
      name: "Home",
      path: "/",
      isLoggedIn: true,
    },
    {
      name: "Projects",
      path: "/projects",
      isLoggedIn: true,
    },
    {
      name: "Login",
      path: "/login",
      isLoggedIn: !isLoggedIn,
    },
    {
      name: "Logout",
      path: "/logout",
      isLoggedIn: isLoggedIn,
    },
  ];

  return (
    <div className="w-[80%] rounded-2xl shadow-md shadow-gray-900 bg-gray-300 flex justify-between items-center p-4 m-4">
      <h1 className="text-black text-xl font-semibold">Name</h1>

      <ul className=" flex flex-row ">
        {navItems.map((item, index) =>
          item.isLoggedIn ? (
            <li
              className="mx-4 px-4 text-black text-xl font-semibold border-[1px] border-gray-300 rounded-lg p-2 hover:bg-blue-600 hover:text-gray-200 transition-all duration-300"
              key={index}
            >
              <Link to={item.path}>{item.name}</Link>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}

export default Navbar;
