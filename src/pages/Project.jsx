import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CreateProject from "../components/CreateProject";
import SearchProject from "../components/SearchProject";
import DeleteProject from "../components/DeleteProject";
import { Search, Plus, Briefcase, Code2, Loader2, X } from 'lucide-react';

function Project() {
  const [projects, setProjects] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-xl font-medium text-gray-600 flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Briefcase className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl text-white font-bold">Projects</h1>
          </div>
          <button
            onClick={() => setShowCreateProject(!showCreateProject)}
            className="bg-indigo-500/80 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors backdrop-blur-sm"
          >
            <Plus className="w-5 h-5" />
            <span>{showCreateProject ? 'Cancel' : 'Create Project'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <SearchProject onProjectsFound={handleProjectsFound} />
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white/10 rounded-2xl shadow-lg border border-white/20 p-8 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white flex items-center mb-6">
                  <Search className="w-5 h-5 mr-2 text-indigo-400" />
                  Search Results
                </h2>
                <div className="space-y-4">
                  {searchResults.map((project) => (
                    <Link
                      key={project.projectId}
                      to={`/project/${project.projectId}`}
                      className="block bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <h3 className="font-semibold text-lg text-white">{project.projectName}</h3>
                      <p className="text-gray-300 mt-2">{project.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.techStack?.map((tech) => (
                          <span
                            key={tech}
                            className="bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full text-sm font-medium border border-indigo-500/30"
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
            {showCreateProject && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white/10 rounded-lg p-6 w-full max-w-2xl border border-white/20 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Create New Project</h2>
                    <button
                      onClick={() => setShowCreateProject(false)}
                      className="text-gray-300 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <CreateProject 
                    onProjectCreated={(newProject) => {
                      handleProjectCreated(newProject);
                      setShowCreateProject(false);
                    }} 
                  />
                </div>
              </div>
            )}

            {/* Created Projects */}
            <div className="bg-white/10 rounded-2xl shadow-lg border border-white/20 p-8 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white flex items-center mb-6">
                <Code2 className="w-5 h-5 mr-2 text-indigo-400" />
                My Created Projects
              </h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.projectId}
                    className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors border border-white/10 group"
                  >
                    <Link
                      to={`/project/${project.projectId}`}
                      className="block"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-white">
                            {project.projectName}
                          </h3>
                          <p className="text-gray-300 mt-2">
                            {project.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.techStack?.map((tech) => (
                          <span
                            key={tech}
                            className="bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full text-sm font-medium border border-indigo-500/30"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </Link>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DeleteProject
                        projectId={project.projectId}
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