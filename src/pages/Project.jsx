import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CreateProject from "../components/CreateProject";
import SearchProject from "../components/SearchProject";
import DeleteProject from "../components/DeleteProject";
import { Search, Plus, Briefcase, Code2, Loader2 } from 'lucide-react';

function Project() {
  const [projects, setProjects] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreatedProjects();
  }, []);

  const loadCreatedProjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/project/createdProjects",
        { withCredentials: true }
      );
      setProjects(response.data);
      setError(null);
    } catch (error) {
      console.error("Error loading projects:", error);
      setError(error.response?.data || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [...prev, newProject]);
  };

  const handleProjectDeleted = (projectId) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
    setSearchResults((prev) =>
      prev.filter((project) => project.id !== projectId)
    );
  };

  const handleProjectsFound = (foundProjects) => {
    setSearchResults(foundProjects);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181818]">
        <div className="text-xl font-medium text-gray-600 flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center space-x-3">
          <Briefcase className="w-8 h-8 text-indigo-500" />
          <h1 className="text-3xl text-gray-300 font-bold">Projects</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <SearchProject onProjectsFound={handleProjectsFound} />
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                  <Search className="w-5 h-5 mr-2 text-blue-500" />
                  Search Results
                </h2>
                <div className="space-y-4">
                  {searchResults.map((project) => (
                    <Link
                      key={project.projectId}
                      to={`/project/${project.projectId}`}
                      className="block bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="font-semibold text-lg text-gray-900">{project.projectName}</h3>
                      <p className="text-gray-600 mt-2">{project.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.techStack?.map((tech) => (
                          <span
                            key={tech}
                            className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium border border-blue-100"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <CreateProject onProjectCreated={handleProjectCreated} />

            {/* Created Projects */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                <Code2 className="w-5 h-5 mr-2 text-purple-500" />
                My Created Projects
              </h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.projectId}
                    className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors group"
                  >
                    <Link
                      to={`/project/${project.projectId}`}
                      className="block"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {project.projectName}
                          </h3>
                          <p className="text-gray-600 mt-2">
                            {project.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.techStack?.map((tech) => (
                          <span
                            key={tech}
                            className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-medium border border-purple-100"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </Link>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DeleteProject
                        projectId={project.id}
                        onProjectDeleted={handleProjectDeleted}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Project;