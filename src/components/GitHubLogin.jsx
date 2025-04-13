import React from "react";
import { Github } from "lucide-react";

const GitHubLogin = () => {
  const handleLogin = () => {
    // Add redirect_uri parameter to redirect back to React app
    const redirectUri = encodeURIComponent("http://localhost:5173");
    window.location.href = `http://localhost:8080/oauth2/authorization/github?redirect_uri=${redirectUri}`;
  };

  return (
    <div className=" flex items-center justify-center p-5 ">
      <div className="w-full max-w-md">
        <div className="bg-white/10 rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-white/20">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-white/10 p-4 rounded-full border border-white/20">
                <Github className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                Welcome to CollabPlatform
              </h1>
              <p className="text-gray-300 text-lg">
                Connect with GitHub to get started
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <ul className="space-y-3 text-left text-gray-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span>Access your repositories</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span>Manage pull requests</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    <span>Track your contributions</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleLogin}
                className="cursor-pointer w-full bg-indigo-500/80 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                <Github className="w-5 h-5" />
                <span>Continue with GitHub</span>
              </button>
            </div>

            <p className="text-sm text-gray-400">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubLogin;
