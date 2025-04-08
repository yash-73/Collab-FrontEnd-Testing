import { useState } from "react";
import { useSelector } from "react-redux";

function Home() {
  const [showData, setShowData] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const handleClick = () => {
    setShowData(!showData);
    console.log("User data:", user);
  };

  return (
    <div className="min-h-screen w-full  flex flex-col items-center justify-center bg-gray-600 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome to GitHub Dashboard
        </h1>

        <button
          onClick={handleClick}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors mb-4"
        >
          {showData ? "Hide User Data" : "Show User Data"}
        </button>

        {showData && user?.data && (
          <div className="bg-gray-800 w-full text-white p-4 rounded-md space-y-2">
            {user.data.avatar && (
              <div className="flex justify-center mb-4">
                <img
                  src={user.data.avatar}
                  alt="avatar"
                  className="w-20 h-20 rounded-full border-2 border-white"
                />
              </div>
            )}
            <div className="space-y-1">
              <p className="text-gray-300">
                Name:{" "}
                <span className="text-white font-semibold">
                  {user.data.name}
                </span>
              </p>
              <p className="text-gray-300">
                Username:{" "}
                <span className="text-white font-semibold">
                  {user.data.username}
                </span>
              </p>
              <p className="text-gray-300">
                Email:{" "}
                <span className="text-white font-semibold">
                  {user.data.email}
                </span>
              </p>
              <p className="text-gray-300">
                GitHub ID:{" "}
                <span className="text-white font-semibold">
                  {user.data.githubId}
                </span>
              </p>
            </div>
          </div>
        )}

        {showData && !user?.data && (
          <div className="text-red-500 text-center">
            No user data available. Please log in.
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
