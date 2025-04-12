import React, { useState } from "react";
import axios from "axios";
import techstack from "./TechStack/Techstack";
import { Plus, X, Code2 } from 'lucide-react';

function CreateProject({ onProjectCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    techStack: new Set(),
  });
  const [newTech, setNewTech] = useState("");
  const [techSuggestions, setTechSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTechInputChange = (e) => {
    const value = e.target.value;
    setNewTech(value);
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
    if (newTech && techstack.includes(newTech.toUpperCase())) {
      setFormData((prev) => ({
        ...prev,
        techStack: new Set([...prev.techStack, newTech.toUpperCase()]),
      }));
      setNewTech("");
      setShowSuggestions(false);
    }
  };

  const handleRemoveTech = (tech) => {
    setFormData((prev) => ({
      ...prev,
      techStack: new Set([...prev.techStack].filter((t) => t !== tech)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const projectDTO = {
        projectName: formData.name,
        description: formData.description,
        techStack: Array.from(formData.techStack),
      };

      const response = await axios.post(
        "http://localhost:8080/api/project/create",
        projectDTO,
        { withCredentials: true }
      );

      if (onProjectCreated) {
        onProjectCreated(response.data);
      }

      setFormData({
        name: "",
        description: "",
        techStack: new Set(),
      });
      setError(null);
    } catch (error) {
      console.error("Error creating project:", error);
      setError(error.response?.data || "Failed to create project");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
        <Plus className="w-5 h-5 mr-2 text-green-500" />
        Create New Project
      </h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            rows="3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tech Stack
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={newTech}
              onChange={handleTechInputChange}
              placeholder="Search technology..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
                    setNewTech(tech);
                    setShowSuggestions(false);
                  }}
                  className="px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors"
                >
                  {tech}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.from(formData.techStack).map((tech) => (
            <div
              key={tech}
              className="group bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2"
            >
              <Code2 className="w-4 h-4" />
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => handleRemoveTech(tech)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Project</span>
        </button>
      </form>
    </div>
  );
}

export default CreateProject;