import React, { useState } from "react";
import axios from "axios";
import techstack from "./TechStack/Techstack";

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

      // Reset form
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows="3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tech Stack
          </label>
          <div className="mt-1 flex space-x-2">
            <input
              type="text"
              value={newTech}
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
                    setNewTech(tech);
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
          {Array.from(formData.techStack).map((tech) => (
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
          Create Project
        </button>
      </form>
    </div>
  );
}

export default CreateProject;
