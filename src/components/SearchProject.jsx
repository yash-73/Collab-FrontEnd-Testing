import React, { useState } from "react";
import axios from "axios";
import techstack from "./TechStack/Techstack";

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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        Search Projects by Tech Stack
      </h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tech Stack
          </label>
          <div className="mt-1 flex space-x-2">
            <input
              type="text"
              value={searchTech}
              onChange={handleTechInputChange}
              placeholder="Search technology..."
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          {showSuggestions && techSuggestions.length > 0 && (
            <div className="mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {techSuggestions.map((tech) => (
                <div
                  key={tech}
                  onClick={() => {
                    setSearchTech(tech);
                    setShowSuggestions(false);
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
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
              className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
            >
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => handleRemoveTech(tech)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Search Projects
        </button>
      </form>
    </div>
  );
}

export default SearchProject;
