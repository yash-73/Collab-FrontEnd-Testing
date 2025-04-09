import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function CustomProject() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // TODO: Add API endpoint to fetch single project
        const response = await axios.get(
          `http://localhost:8080/api/project/${projectId}`,
          { withCredentials: true }
        );
        setProject(response.data);
        console.log(response.data);
        setError(null);

      } catch (error) {
        console.error("Error fetching project:", error);
        setError(error.response?.data || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">
          {typeof error === "object"
            ? error.message || "An error occurred"
            : error}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Project not found</div>
      </div>
    );
  }

  // Helper function to safely render nested objects
  const renderNestedObject = (obj) => {
    if (typeof obj !== "object" || obj === null) {
      return String(obj);
    }
    return Object.entries(obj).map(([key, value]) => (
      <div key={key} className="mb-2">
        <span className="font-semibold">{key}: </span>
        {typeof value === "object" ? renderNestedObject(value) : String(value)}
      </div>
    ));
  };

  return (
    <div className="min-h-screen w-full p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-4">{project.projectName}</h1>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-600">{project.description}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack?.map((tech) => (
                  <span
                    key={tech}
                    className="bg-gray-200 px-3 py-1 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Project Details</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                {renderNestedObject(project)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomProject;
