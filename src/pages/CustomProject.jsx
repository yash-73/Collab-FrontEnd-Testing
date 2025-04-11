import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from 'react-redux';

function CustomProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [joinRequestSent, setJoinRequestSent] = useState(false);
  const [joinRequestError, setJoinRequestError] = useState(null);
  
  const currentUser = useSelector(state => state.auth.user.data);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project details
        const projectResponse = await axios.get(
          `http://localhost:8080/api/project/${projectId}`,
          { withCredentials: true }
        );
        setProject(projectResponse.data);

        // Fetch project members
        const membersResponse = await axios.get(
          `http://localhost:8080/api/project/${projectId}/members`,
          { withCredentials: true }
        );
        setMembers(membersResponse.data);

        // Check if current user is a member using Redux store data
        if (currentUser) {
          setIsMember(membersResponse.data.some(member => member.id === currentUser.id));
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching project data:", error);
        setError(error.response?.data || "Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, currentUser]);

  const handleJoinRequest = async () => {
    try {
      setJoinRequestError(null);
      const response = await axios.post(
        'http://localhost:8080/api/notification/join-request',
        { projectId: parseInt(projectId) },
        { withCredentials: true }
      );
      setJoinRequestSent(true);
    } catch (error) {
      console.error("Error sending join request:", error);
      setJoinRequestError(error.response?.data || "Failed to send join request");
    }
  };

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

            <div>
              <h2 className="text-xl font-semibold mb-2">Project Members</h2>
              {!isMember && !joinRequestSent && (
                <div className="mb-4">
                  <button
                    onClick={handleJoinRequest}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Request to Join Project
                  </button>
                  {joinRequestError && (
                    <p className="text-red-500 mt-2">{joinRequestError}</p>
                  )}
                </div>
              )}
              {joinRequestSent && (
                <div className="mb-4">
                  <p className="text-green-500">Join request sent successfully!</p>
                </div>
              )}
              {isMember && (
                <div className="mb-4">
                  <button
                    onClick={() => navigate(`/project/${projectId}/collaborate`)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Collaborate
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                  <div key={member.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      {member.avatarUrl && (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-gray-500">{member.login}</p>
                      </div>
                    </div>
                    {member.techStack && member.techStack.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {member.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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

export default CustomProject;
