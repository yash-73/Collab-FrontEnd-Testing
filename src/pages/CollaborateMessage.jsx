import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import MessageList from '../components/collaboration/MessageList';

function CollaborateMessage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentUser = useSelector(state => state.auth.user.data);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `http://localhost:8080/api/project/${projectId}`,
                    { withCredentials: true }
                );
                setProject(response.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching project data:", error);
                setError(error.response?.data?.message || "Failed to load project data");
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId]);

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

    return (
        <div className="min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white/10 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-white/20">
                    <div className="flex justify-between items-center mb-8">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-white">{project.projectName}</h1>
                            <p className="text-gray-300">Project Messages</p>
                        </div>
                    </div>

                    <div className="h-[calc(100vh-300px)] bg-white/5 rounded-xl border border-white/10">
                        <MessageList projectId={projectId} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CollaborateMessage; 