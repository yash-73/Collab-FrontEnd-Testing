import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { User2, Mail, Code2, Briefcase, Github } from "lucide-react";

export default function Profile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [createdProjects, setCreatedProjects] = useState([]);
    const [joinedProjects, setJoinedProjects] = useState([]);
    const currentUser = useSelector((state) => state.auth.user);

    useEffect(() => {
        if (userId) {
            console.log("Loading profile for userId:", userId);
            loadProfile();
        }
    }, [userId]);

    const loadProfile = async () => {
        try {
            console.log("Making API call to fetch profile");
            const response = await axios.get(`http://localhost:8080/api/user/${parseInt(userId)}`, {
                withCredentials: true,
            });
            console.log("Profile response:", response.data);
            
            if (response.data) {
                setProfile(response.data);
                loadProjects(response.data.id);
            } else {
                setError("No profile data received");
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const loadProjects = async (id) => {
        try {
            console.log("Loading projects for user ID:", id);
            const [createdResponse, joinedResponse] = await Promise.all([
                axios.get(`http://localhost:8080/api/user/${id}/projects`, {
                    withCredentials: true,
                }),
                axios.get(`http://localhost:8080/api/user/${id}/joined-projects`, {
                    withCredentials: true,
                })
            ]);
            console.log("Created projects:", createdResponse.data);
            console.log("Joined projects:", joinedResponse.data);
            
            setCreatedProjects(createdResponse.data || []);
            setJoinedProjects(joinedResponse.data || []);
        } catch (error) {
            console.error("Error loading projects:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center  ">
                <div className="text-xl font-medium text-gray-600">
                    <div className="animate-pulse flex items-center space-x-2">
                        <div className="h-4 w-4 bg-blue-500 rounded-full animate-bounce"></div>
                        <span>Loading profile...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center  ">
                <div className="text-xl text-red-500 bg-red-50 px-6 py-4 rounded-lg border border-red-200">
                    {error}
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center ">
                <div className="text-xl text-red-500 bg-red-50 px-6 py-4 rounded-lg border border-red-200">
                    Profile not found
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.isLoggedIn && currentUser?.data?.id === profile?.id;

    return (
        <div className="min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="bg-white/10 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-white/20">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-6">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/20">
                                {profile.avatarUrl ? (
                                    <img 
                                        src={profile.avatarUrl} 
                                        alt={profile.name} 
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User2 className="w-12 h-12 text-gray-300" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                                <p className="text-gray-300 mt-1">@{profile.login}</p>
                                <div className="flex items-center mt-2 text-gray-300">
                                    <Mail className="w-4 h-4 mr-2" />
                                    <span>{profile.email}</span>
                                </div>
                            </div>
                        </div>
                        {isOwnProfile && (
                            <button
                                onClick={() => navigate('/edit-profile')}
                                className="bg-indigo-500/80 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="bg-white/10 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-white/20">
                    <h2 className="text-xl font-semibold text-white flex items-center mb-6">
                        <Code2 className="w-5 h-5 mr-2 text-indigo-400" />
                        Tech Stack
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {Array.from(profile.techStack || []).map((tech) => (
                            <span
                                key={tech}
                                className="bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full text-sm font-medium border border-indigo-500/30"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Projects */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Created Projects */}
                    {createdProjects.length > 0 && (
                    <div className="bg-white/10 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-white/20">
                        <h2 className="text-xl font-semibold text-white flex items-center mb-6">
                            <Briefcase className="w-5 h-5 mr-2 text-indigo-400" />
                            Created Projects
                        </h2>
                        <div className="space-y-4">
                            {createdProjects.map((project) => (
                                <div
                                    key={project.projectId}
                                    className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                                    onClick={() => navigate(`/project/${project.projectId}`)}
                                >
                                    <h3 className="font-semibold text-lg text-white">
                                        {project.projectName}
                                    </h3>
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
                                    {project.githubRepository && (
                                        <a
                                            href={project.githubRepository}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 flex items-center text-indigo-300 hover:text-white"
                                        >
                                            <Github className="w-4 h-4 mr-2" />
                                            View on GitHub
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>)}

                    {/* Joined Projects */}
                    <div className="bg-white/10 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-white/20">
                        <h2 className="text-xl font-semibold text-white flex items-center mb-6">
                            <Briefcase className="w-5 h-5 mr-2 text-indigo-400" />
                            Joined Projects
                        </h2>
                        <div className="space-y-4">
                            {joinedProjects.map((project) => (
                                <div
                                    key={project.projectId}
                                    className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                                    onClick={() => navigate(`/project/${project.projectId}`)}
                                >
                                    <h3 className="font-semibold text-lg text-white">
                                        {project.projectName}
                                    </h3>
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
                                    {project.githubRepository && (
                                        <a
                                            href={project.githubRepository}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 flex items-center text-indigo-300 hover:text-white"
                                        >
                                            <Github className="w-4 h-4 mr-2" />
                                            View on GitHub
                                        </a>
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