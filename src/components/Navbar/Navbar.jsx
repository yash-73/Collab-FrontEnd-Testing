import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { logout, login } from "../../store/AuthSlice";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Home, FolderGit2, UserCircle, Bell, LogOut, LogIn } from 'lucide-react';
import { useLocation } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLoggedIn(user?.isLoggedIn || false);
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
      path: `/profile/${user?.data?.id}`,
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
      return response.data;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return { authenticated: false };
    }
  };

  const getUser = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/user/dto", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Skip auth check if already logged in
      if (user?.isLoggedIn) return;

      const authData = await isAuthenticated();
      if (authData?.authenticated) {
        const userData = await getUser();
        if (userData) {
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
          dispatch(login(userState));
        }
      } else if (location.pathname !== '/login') {
        navigate("/login");
      }
    };

    checkAuth();
  }, [dispatch, navigate, user?.isLoggedIn, location.pathname]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axios.get(
        "http://localhost:8080/api/auth/logout",
        {
          withCredentials: true,
        }
      );
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Listen for unread notifications only if user is logged in
  useEffect(() => {
    if (!user?.data?.id) return;

    const requestsRef = collection(db, "ProjectJoinRequests");
    const requestsQuery = query(requestsRef, 
      where("status", "==", "PENDING")
    );

    const tasksRef = collection(db, "Tasks");
    const tasksQuery = query(tasksRef, 
      where("assignedTo", "==", Number(user.data.id)),
      where("status", "==", "REQUESTED")
    );

    const requestsUnsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const hasRequests = snapshot.docs.some(doc => {
        const data = doc.data();
        return data.userId === user.data.id || 
               (data.projectId && user.data.projects?.includes(data.projectId));
      });
      setHasUnreadNotifications(hasRequests);
    });

    const tasksUnsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const hasTasks = !snapshot.empty;
      setHasUnreadNotifications(prev => prev || hasTasks);
    });

    return () => {
      requestsUnsubscribe();
      tasksUnsubscribe();
    };
  }, [user?.data?.id]);

  const handleNotificationsClick = () => {
    setHasUnreadNotifications(false);
  };

  return (
    <nav className="z-50 px-4 py-3">
      <div className="backdrop-blur-xl shadow-xl max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-900/90 to-purple-900/90 rounded-2xl shadow-lg border border-white/10 flex justify-between items-center px-6 py-3">
          <Link to="/" className="flex items-center space-x-2">
            <FolderGit2 className="w-8 h-8 text-indigo-400" />
            <span className="text-2xl font-bold text-white">
              DevSync
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            {isLoggedIn ? (
              <>
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={item.name === "Notifications" ? handleNotificationsClick : undefined}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 relative ${
                      location.pathname === item.path
                        ? 'bg-indigo-500/50 text-white'
                        : 'text-gray-300 hover:bg-indigo-500/30 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                    {item.name === "Notifications" && hasUnreadNotifications && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-indigo-900/90"></span>
                    )}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200"
              >
                <LogIn className="w-5 h-5" />
                <span className="font-medium">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;