import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import ProfileHeader from "../components/profile/ProfileHeader";
import EmailUpdate from "../components/profile/EmailUpdate";
import RolesManagement from "../components/profile/RolesManagement";
import TechStackManagement from "../components/profile/TechStackManagement";
import ProjectList from "../components/profile/ProjectList";

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projects, setProjects] = useState([]);
    const [joinedProjects, setJoinedProjects] = useState([]);
    const [techStack, setTechStack] = useState(new Set());
    const [roles, setRoles] = useState(new Set());
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        loadProfile();
        loadProjects();
        loadJoinedProjects();
        loadTechStack();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/user/profile", {
                withCredentials: true,
            });
            setProfile(response.data);
            const roleNames = response.data.roles?.map((role) => role.roleName) || [];
            setRoles(new Set(roleNames));
        } catch (error) {
            setError("Failed to load profile");
            console.error("Error loading profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadTechStack = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/user/tech", {
                withCredentials: true,
            });
            setTechStack(new Set(response.data));
        } catch (error) {
            console.error("Error loading tech stack:", error);
        }
    };

    const loadProjects = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/user/projects", {
                withCredentials: true,
            });
            setProjects(response.data);
        } catch (error) {
            console.error("Error loading projects:", error);
        }
    };

    const loadJoinedProjects = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/user/joined-projects", {
                withCredentials: true,
            });
            setJoinedProjects(response.data);
        } catch (error) {
            console.error("Error loading joined projects:", error);
        }
    };

    const handleEmailUpdate = (newEmail) => {
        setProfile({ ...profile, email: newEmail });
    };

    const handleRolesUpdate = (newRoles) => {
        // Check if newRoles is an array of role objects or just role names
        const roleNames = Array.isArray(newRoles) 
            ? newRoles.map(role => typeof role === 'object' ? role.roleName : role)
            : [];
        setRoles(new Set(roleNames));
    };

    const handleTechStackUpdate = (newTechStack) => {
        setTechStack(new Set(newTechStack));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#181818]">
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
            <div className="min-h-screen flex items-center justify-center bg-[#181818]">
                <div className="text-xl text-red-500 bg-red-50 px-6 py-4 rounded-lg border border-red-200">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#181818] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <ProfileHeader profile={profile} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        <EmailUpdate profile={profile} onEmailUpdate={handleEmailUpdate} />
                        <RolesManagement roles={roles} onRolesUpdate={handleRolesUpdate} />
                        <TechStackManagement techStack={techStack} onTechStackUpdate={handleTechStackUpdate} />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        <ProjectList 
                            projects={projects} 
                            title="My Created Projects" 
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
        </div>
    );
} 