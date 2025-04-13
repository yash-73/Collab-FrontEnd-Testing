import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from 'react-redux';
import { Github, Users, Code2, FileText, AlertCircle } from 'lucide-react';
import UpdateProject from "../components/UpdateProject";

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

  const handleProjectUpdated = (updatedProject) => {
    setProject(updatedProject);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-white">
          <div className="animate-pulse flex items-center space-x-2">
            <div className="h-4 w-4 bg-indigo-500 rounded-full animate-bounce"></div>
            <span>Loading project...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-200 bg-red-500/20 px-6 py-4 rounded-lg border border-red-500/30 backdrop-blur-sm">
          {typeof error === "object" ? error.message || "An error occurred" : error}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-200 bg-red-500/20 px-6 py-4 rounded-lg border border-red-500/30 backdrop-blur-sm">
          Project not found
        </div>
      </div>
    );
  }

  const isCreator = currentUser && project.creatorId === currentUser.id;

  return (
    <div className="min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white/10 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-white/20">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">{project.projectName}</h1>
              <p className="text-gray-300 text-sm">Project ID: {project.id}</p>
            </div>
            {isCreator && (
              <UpdateProject project={project} onProjectUpdated={handleProjectUpdated} />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-xl font-semibold text-white">Description</h2>
                </div>
                <p className="text-gray-300 leading-relaxed">{project.description}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-xl font-semibold text-white">Tech Stack</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.techStack?.map((tech) => (
                    <span
                      key={tech}
                      className="bg-indigo-500/20 text-indigo-200 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* GitHub Repository */}
              {(isMember || isCreator) && project.githubRepository && (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center space-x-2 mb-4">
                    <Github className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-xl font-semibold text-white">GitHub Repository</h2>
                  </div>
                  <a
                    href={project.githubRepository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-indigo-300 hover:text-white transition-colors group"
                  >
                    <Github className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="truncate">{project.githubRepository}</span>
                  </a>
                </div>
              )}

              {/* Project Details */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-xl font-semibold text-white">Project Details</h2>
                </div>
                <div className="space-y-2 text-gray-300">
                  {Object.entries(project).map(([key, value]) => {
                    if (key === 'id' || key === 'projectName' || key === 'description' || 
                        key === 'techStack' || key === 'githubRepository' || key === 'creatorId') {
                      return null;
                    }
                    return (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="font-medium text-gray-400">{key}</span>
                        <span className="text-white">{String(value)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div className="mt-8">
            <div className="flex items-center space-x-2 mb-6">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold text-white">Project Members</h2>
            </div>

            {!isMember && !joinRequestSent && !isCreator && (
              <div className="mb-6">
                <button
                  onClick={handleJoinRequest}
                  className="bg-indigo-500/80 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition-colors backdrop-blur-sm flex items-center space-x-2"
                >
                  <span>Request to Join Project</span>
                </button>
                {joinRequestError && (
                  <p className="text-red-200 mt-2 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{joinRequestError}</span>
                  </p>
                )}
              </div>
            )}

            {joinRequestSent && (
              <div className="mb-6">
                <p className="text-green-200 flex items-center space-x-2">
                  <span>Join request sent successfully!</span>
                </p>
              </div>
            )}

            {isMember && (
              <div className="mb-6">
                <button
                  onClick={() => navigate(`/project/${projectId}/collaborate`)}
                  className="bg-indigo-500/80 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition-colors backdrop-blur-sm flex items-center space-x-2"
                >
                  <span>Collaborate</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div 
                  key={member.id} 
                  className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer border border-white/10 group"
                  onClick={() => navigate(`/profile/${member.id}`)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/20 group-hover:border-indigo-500/50 transition-colors"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20 group-hover:border-indigo-500/50 transition-colors">
                        <span className="text-white text-xl font-medium">{member.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{member.name}</h3>
                      <p className="text-sm text-gray-300">@{member.login}</p>
                    </div>
                  </div>
                  {member.techStack && member.techStack.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {member.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="bg-indigo-500/20 text-indigo-200 px-2 py-1 rounded-full text-xs font-medium border border-indigo-500/30"
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
  );
}

export default CustomProject;
