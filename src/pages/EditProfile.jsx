import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User2, Mail, Code2, Briefcase, Github } from "lucide-react";
import TechStackManagement from "../components/profile/TechStackManagement";
import RolesManagement from "../components/profile/RolesManagement";
import ProjectList from "../components/profile/ProjectList";
import EmailUpdate from "../components/profile/EmailUpdate";

export default function EditProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [createdProjects, setCreatedProjects] = useState([]);
    const [joinedProjects, setJoinedProjects] = useState([]);
    const [techStack, setTechStack] = useState(new Set());
    const [roles, setRoles] = useState([]);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (!user?.isLoggedIn) {
            navigate('/login');
            return;
        }
        loadProfile();
        loadProjects();
    }, [user, navigate]);

    useEffect(() => {
        if (profile?.email) {
            setEmail(profile.email);
        }
    }, [profile?.email]);

    const loadProfile = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/user/${user.data.id}`,
                { withCredentials: true }
            );
            setProfile(response.data);
            setTechStack(new Set(response.data.techStack || []));
            setRoles(new Set(response.data.roles || []));
        } catch (error) {
            console.error("Error loading profile:", error);
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const loadProjects = async () => {
        try {
            const [createdResponse, joinedResponse] = await Promise.all([
                axios.get("http://localhost:8080/api/user/projects", {
                    withCredentials: true,
                }),
                axios.get("http://localhost:8080/api/user/joined-projects", {
                    withCredentials: true,
                })
            ]);
            setCreatedProjects(createdResponse.data);
            setJoinedProjects(joinedResponse.data);
        } catch (error) {
            console.error("Error loading projects:", error);
        }
    };

    const handleEmailUpdate = (newEmail) => {
        setProfile((prev) => ({ ...prev, email: newEmail }));
    };

    const handleTechStackUpdate = (newTechStack) => {
        setTechStack(new Set(newTechStack));
    };

    const handleRolesUpdate = (newRoles) => {
        setRoles(new Set(newRoles));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl font-medium text-white">
                    <div className="animate-pulse flex items-center space-x-2">
                        <div className="h-4 w-4 bg-indigo-500 rounded-full animate-bounce"></div>
                        <span>Loading profile...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-200 bg-red-500/20 px-6 py-4 rounded-lg border border-red-500/30 backdrop-blur-sm">
                    {error}
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-200 bg-red-500/20 px-6 py-4 rounded-lg border border-red-500/30 backdrop-blur-sm">
                    Profile not found
                </div>
            </div>
        );
    }

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
                        <button
                            onClick={() => navigate(`/profile/${user.data.id}`)}
                            className="bg-indigo-500/80 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
                        >
                            Back to Profile
                        </button>
                    </div>
                </div>

                {/* Email Update */}
                <EmailUpdate email={profile.email} onUpdate={handleEmailUpdate} />

                {/* Tech Stack Management */}
                <TechStackManagement techStack={Array.from(techStack)} onUpdate={handleTechStackUpdate} />

                {/* Roles Management */}
                <RolesManagement roles={roles} onUpdate={handleRolesUpdate} />

                {/* Projects */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ProjectList 
                        projects={createdProjects}
                        title="Created Projects"
                        type="created"
                    />
                    <ProjectList 
                        projects={joinedProjects}
                        title="Joined Projects"
                        type="joined"
                    />
                </div>
            </div>
        </div>
    );
} 