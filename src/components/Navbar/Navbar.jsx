import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { logout, login } from "../../store/AuthSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Home, FolderGit2, UserCircle, Bell, LogOut, LogIn } from 'lucide-react';

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
      icon: <Home className="w-5 h-5" />,
      isLoggedIn: true,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: <FolderGit2 className="w-5 h-5" />,
      isLoggedIn: true,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <UserCircle className="w-5 h-5" />,
      isLoggedIn: true,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: <Bell className="w-5 h-5" />,
      isLoggedIn: true,
    }
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
      } else {
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
    <nav className="sticky top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 flex justify-between items-center px-6 py-3">
          <Link to="/" className="flex items-center space-x-2">
            <FolderGit2 className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              DevSync
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            {navItems.map((item, index) =>
              item.isLoggedIn ? (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              ) : null
            )}
            {!isLoggedIn ? (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <LogIn className="w-5 h-5" />
                <span className="font-medium">Login</span>
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;