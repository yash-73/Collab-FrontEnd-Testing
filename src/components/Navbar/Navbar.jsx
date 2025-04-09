import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { logout, login } from "../../store/AuthSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";


function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  

  useEffect(() => {
    const isUserLoggedIn = user.isLoggedIn;
    setIsLoggedIn(isUserLoggedIn);
    console.log("Check user login status", user.isLoggedIn);
  }, [user]);

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
      name: "Profile",
      path: "/profile",
      icon: <FaUserCircle />,
      isLoggedIn: true,
    },
  ];

  const isAuthenticated = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/auth/authenticated",
        {
          withCredentials: true,
        }
      );
      console.log("Auth response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  const getUser = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/user/dto", {
        withCredentials: true,
      });
      console.log("User response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const authData = await isAuthenticated();
      if (authData && authData.authenticated) {
        const userData = await getUser();
        if (userData) {
          // Map UserDTO to Redux store format
          const userState = {
            isLoggedIn: true,
            data: {
              id: userData.id,
              name: userData.name,
              login: userData.login,
              email: userData.email,
              avatar: userData.avatarUrl,
              githubId: userData.githubId,
              roles: userData.roles || new Set(),
              techStack: userData.techStack || new Set(),
            },
          };

          console.log("Dispatching login with:", userState);
          dispatch(login(userState));
        }
      }
      else{
        navigate("/login");
      }
    };

    checkAuth();
  }, [dispatch, navigate]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        "http://localhost:8080/api/auth/logout",
        {
          withCredentials: true,
        }
      );
      console.log("Logout response:", response.data);
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="w-[80%] rounded-2xl shadow-md shadow-gray-900 bg-gray-300 flex justify-between items-center p-4 m-4">
      <h1 className="text-black text-xl font-semibold">DevSync</h1>

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
        {!isLoggedIn && (
          <Link
            className="mx-4 px-4 text-black text-xl font-semibold border-[1px] border-gray-300  rounded-lg p-2 hover:bg-blue-600 bg-blue-400  transition-all duration-300"
            to="/login"
          >
            Login
          </Link>
        )}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="mx-4 px-4 text-black text-xl font-semibold border-[1px] border-gray-300 bg-red-500 rounded-lg p-2 hover:bg-red-600 hover:text-gray-200 transition-all duration-300"
          >
            Logout
          </button>
        )}
      </ul>
    </div>
  );
}

export default Navbar;
