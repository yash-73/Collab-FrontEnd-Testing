import React, { useState } from "react";
import axios from "axios";
import techstack from "./TechStack/Techstack";
import { Search, Plus, X, Code2, User } from 'lucide-react';
import { useSelector } from "react-redux";

function SearchProject({ onProjectsFound }) {
  const [searchTech, setSearchTech] = useState("");
  const [techSuggestions, setTechSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTech, setSelectedTech] = useState(new Set());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = useSelector(state => state.auth.user.data);

  const handleTechInputChange = (e) => {
    const value = e.target.value;
    setSearchTech(value);
    if (value.length > 0) {
      const filtered = techstack.filter((tech) =>
        tech.toLowerCase().includes(value.toLowerCase())
      );
      setTechSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setTechSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddTech = (e) => {
    e.preventDefault();
    if (searchTech && techstack.includes(searchTech.toUpperCase())) {
      setSelectedTech((prev) => new Set([...prev, searchTech.toUpperCase()]));
      setSearchTech("");
      setShowSuggestions(false);
    }
  };

  const handleRemoveTech = (tech) => {
    setSelectedTech((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tech);
      return newSet;
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/project/search",
        Array.from(selectedTech),
        { withCredentials: true }
      );

      if (onProjectsFound) {
        onProjectsFound(response.data);
      }
      setError(null);
    } catch (error) {
      console.error("Error searching projects:", error);
      setError(error.response?.data || "Failed to search projects");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByUserTechStack = async () => {
    if (!user?.techStack || user.techStack.size === 0) {
      setError("No tech stack found in your profile");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/project/search",
        Array.from(user.techStack),
        { withCredentials: true }
      );

      if (onProjectsFound) {
        onProjectsFound(response.data);
      }
      setError(null);
    } catch (error) {
      console.error("Error searching projects:", error);
      setError(error.response?.data || "Failed to search projects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 rounded-2xl shadow-lg border border-white/20 p-8 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white flex items-center mb-6">
        <Search className="w-5 h-5 mr-2 text-indigo-400" />
        Search Projects by Tech Stack
      </h2>
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-lg mb-6 backdrop-blur-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSearch} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tech Stack
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={searchTech}
              onChange={handleTechInputChange}
              placeholder="Search technology..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-white placeholder-gray-400"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="bg-indigo-500/80 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 backdrop-blur-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {showSuggestions && techSuggestions.length > 0 && (
            <div className="mt-2 bg-white/10 border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto backdrop-blur-sm">
              {techSuggestions.map((tech) => (
                <div
                  key={tech}
                  onClick={() => {
                    setSearchTech(tech);
                    setShowSuggestions(false);
                  }}
                  className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-white"
                >
                  {tech}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from(selectedTech).map((tech) => (
            <div
              key={tech}
              className="group bg-indigo-500/20 text-indigo-200 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 border border-indigo-500/30"
            >
              <Code2 className="w-4 h-4" />
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => handleRemoveTech(tech)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading || selectedTech.size === 0}
            className="flex-1 bg-indigo-500/80 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center space-x-2 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Search Projects</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSearchByUserTechStack}
            disabled={loading || !user?.techStack || user.techStack.size === 0}
            className="flex-1 bg-purple-500/80 text-white px-6 py-3 rounded-lg hover:bg-purple-500 transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center space-x-2 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <User className="w-5 h-5" />
                <span>Search by My Tech Stack</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchProject;