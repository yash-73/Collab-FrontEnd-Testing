import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CreateProject from "../components/CreateProject";
import SearchProject from "../components/SearchProject";
import DeleteProject from "../components/DeleteProject";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl text-gray-300 font-bold">Projects</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <SearchProject onProjectsFound={handleProjectsFound} />
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                <div className="space-y-4">
                  {searchResults.map((project) => (
                    <Link
                      key={project.projectId}
                      to={`/project/${project.projectId}`}
                      className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold">{project.projectName}</h3>
                      <p className="text-gray-600 text-sm">
                        {project.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {project.techStack?.map((tech) => (
                          <span
                            key={tech}
                            className="bg-gray-200 px-2 py-1 rounded-full text-xs"
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
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                My Created Projects
              </h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.projectId}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <Link
                      to={`/project/${project.projectId}`}
                      className="block"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">
                            {project.projectName}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {project.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {project.techStack?.map((tech) => (
                          <span
                            key={tech}
                            className="bg-gray-200 px-2 py-1 rounded-full text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </Link>
                    <div className="mt-2">
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
