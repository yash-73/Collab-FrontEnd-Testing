import React, { useState } from "react";
import axios from "axios";
import techstack from "./TechStack/Techstack";
import { Search, Plus, X, Code2 } from 'lucide-react';

function SearchProject({ onProjectsFound }) {
  const [searchTech, setSearchTech] = useState("");
  const [techSuggestions, setTechSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTech, setSelectedTech] = useState(new Set());
  const [error, setError] = useState(null);

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
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
        <Search className="w-5 h-5 mr-2 text-blue-500" />
        Search Projects by Tech Stack
      </h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleSearch} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tech Stack
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={searchTech}
              onChange={handleTechInputChange}
              placeholder="Search technology..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          {showSuggestions && techSuggestions.length > 0 && (
            <div className="mt-2 bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {techSuggestions.map((tech) => (
                <div
                  key={tech}
                  onClick={() => {
                    setSearchTech(tech);
                    setShowSuggestions(false);
                  }}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
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
              className="group bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2"
            >
              <Code2 className="w-4 h-4" />
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => handleRemoveTech(tech)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
        >
          <Search className="w-5 h-5" />
          <span>Search Projects</span>
        </button>
      </form>
    </div>
  );
}

export default SearchProject;