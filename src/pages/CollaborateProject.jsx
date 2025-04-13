import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import TaskAssignment from "../components/task/TaskAssignment";
import { CheckCircle2, AlertCircle, Clock, XCircle, Loader2, PlusCircle } from 'lucide-react';

function CollaborateProject() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [creator, setCreator] = useState(null);

    const currentUser = useSelector(state => state.auth.user.data);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                console.log("Fetching project data for ID:", projectId);
                // Fetch project details
                const projectResponse = await axios.get(
                    `http://localhost:8080/api/project/${projectId}`,
                    { withCredentials: true }
                );
                console.log("Project response:", projectResponse.data);
                setProject(projectResponse.data);

                // Fetch creator details
                if (projectResponse.data.creatorId) {
                    console.log("Attempting to fetch creator with ID:", projectResponse.data.creatorId);
                    const creatorResponse = await axios.get(
                        `http://localhost:8080/api/user/${projectResponse.data.creatorId}`,
                        { withCredentials: true }
                    );
                    console.log("Creator API Response:", {
                        status: creatorResponse.status,
                        statusText: creatorResponse.statusText,
                        data: creatorResponse.data,
                        headers: creatorResponse.headers
                    });
                    setCreator(creatorResponse.data);
                } else {
                    console.log("No creatorId found in project:", projectResponse.data);
                }

                // Fetch project members
                const membersResponse = await axios.get(
                    `http://localhost:8080/api/project/${projectId}/members`,
                    { withCredentials: true }
                );
                console.log("Members response:", membersResponse.data);
                setMembers(membersResponse.data);

                setError(null);
            } catch (error) {
                console.error("Error fetching project data:", error);
                console.error("Error response:", error.response?.data);
                setError(error.response?.data || "Failed to load project data");
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId]);

    // Set up Firebase listener for tasks
    useEffect(() => {
        if (!projectId || !currentUser?.id || !project) {
            console.log("Missing required data:", { projectId, currentUserId: currentUser?.id, project });
            setTasks([]);
            return;
        }

        // Convert projectId to number if it's a string
        const numericProjectId = typeof projectId === 'string' ? parseInt(projectId) : projectId;
        console.log("Query parameters:", {
            projectId: numericProjectId,
            currentUserId: currentUser.id,
            projectIdType: typeof numericProjectId,
            currentUserIdType: typeof currentUser.id
        });

        const tasksRef = collection(db, "Tasks");
        let q;
        
        if (currentUser.id === project?.creatorId) {
            // Creator can see all tasks
            q = query(tasksRef, where("projectId", "==", numericProjectId));
        } else {
            // Regular members can only see their assigned tasks
            q = query(tasksRef, 
                where("id", ">=", `${currentUser.id}_`),
                where("id", "<=", `${currentUser.id}_\uf8ff`),
                where("projectId", "==", numericProjectId)
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("Received snapshot:", snapshot);
            console.log("Number of tasks:", snapshot.docs.length);
            
            const newTasks = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log("Task data:", data);
                return {
                    id: doc.id,
                    ...data,
                };
            });
            
            console.log("Mapped tasks:", newTasks);
            setTasks(newTasks);
        }, (error) => {
            console.error("Error fetching tasks:", error);
            setTasks([]);
        });

        return () => unsubscribe();
    }, [projectId, currentUser?.id, project?.creatorId]);

    const handleTaskStatusUpdate = async (taskId, newStatus) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) {
                throw new Error("Task not found");
            }

            await axios.put(
                "http://localhost:8080/api/task/status",
                { 
                    id: task.id,
                    status: newStatus,
                    projectId: task.projectId,
                    assignedTo: task.assignedTo,
                    details: task.details
                },
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Error updating task status:", error);
            setError(error.response?.data || "Failed to update task status");
        }
    };

    const handleTaskCompletion = async (taskId, newStatus) => {
        try {
            const response = await axios.put(
                'http://localhost:8080/api/task/completion',
                {
                    id: taskId,
                    status: newStatus,
                    projectId: projectId
                },
                { withCredentials: true }
            );
            console.log('Task completion updated:', response.data);
            // Refresh tasks after update
            const tasksRef = collection(db, "Tasks");
            const q = query(tasksRef, where("projectId", "==", projectId));
            const querySnapshot = await getDocs(q);
            const updatedTasks = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(updatedTasks);
        } catch (error) {
            console.error('Error updating task completion:', error);
            setError(error.response?.data || 'Failed to update task completion');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/task/${taskId}`,
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Error deleting task:", error);
            setError(error.response?.data || "Failed to delete task");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'REQUESTED':
                return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
            case 'PENDING':
                return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
            case 'REQUEST_COMPLETE':
                return 'bg-purple-500/20 text-purple-200 border-purple-500/30';
            case 'COMPLETED':
                return 'bg-green-500/20 text-green-200 border-green-500/30';
            case 'REJECTED':
            case 'REQUEST_REJECTED':
                return 'bg-red-500/20 text-red-200 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'REQUESTED':
                return <Clock className="w-4 h-4" />;
            case 'PENDING':
                return <Loader2 className="w-4 h-4 animate-spin" />;
            case 'REQUEST_COMPLETE':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'COMPLETED':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'REJECTED':
            case 'REQUEST_REJECTED':
                return <XCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
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

    const isCreator = currentUser?.id === project?.creatorId;

    return (
        <div className="min-h-screen w-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="bg-white/10 min-h-screen rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-white/20">
                    <div className="flex justify-between items-center mb-8">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-white">{project.projectName}</h1>
                            <p className="text-gray-300">Created by: {creator?.login || 'Unknown'}</p>
                        </div>
                        <TaskAssignment 
                            projectId={projectId}
                            members={members}
                            isCreator={isCreator}
                        />
                    </div>
                    
                    {/* Tasks List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <PlusCircle className="w-5 h-5 text-indigo-400" />
                                <h2 className="text-xl font-semibold text-white">Tasks</h2>
                            </div>
                            <span className="text-gray-300 text-sm">
                                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                            </span>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                                <p className="text-gray-300">No tasks available</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tasks.map(task => (
                                    <div 
                                        key={task.id} 
                                        className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-3">
                                                <p className="font-medium text-white">{task.details}</p>
                                                <div className="flex items-center space-x-4">
                                                    <p className="text-sm text-gray-300">
                                                        Assigned to: {currentUser.login}
                                                    </p>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                                        <span className="mr-1">{getStatusIcon(task.status)}</span>
                                                        {task.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-x-2">
                                                {/* Task Status Controls */}
                                                {task.assignedTo === currentUser.id && task.status === "REQUESTED" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleTaskStatusUpdate(task.id, "PENDING")}
                                                            className="bg-indigo-500/80 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm flex items-center space-x-2"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            <span>Accept</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleTaskStatusUpdate(task.id, "REJECTED")}
                                                            className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm flex items-center space-x-2"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            <span>Reject</span>
                                                        </button>
                                                    </>
                                                )}
                                                {task.assignedTo === currentUser.id && task.status === "PENDING" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleTaskStatusUpdate(task.id, "REQUEST_COMPLETE")}
                                                            className="bg-indigo-500/80 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm flex items-center space-x-2"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            <span>Mark Complete</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleTaskStatusUpdate(task.id, "REJECTED")}
                                                            className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm flex items-center space-x-2"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            <span>Reject</span>
                                                        </button>
                                                    </>
                                                )}
                                                {/* Show completion buttons only to creator for REQUEST_COMPLETE tasks */}
                                                {isCreator && task.status === "REQUEST_COMPLETE" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleTaskCompletion(task.id, "COMPLETED")}
                                                            className="bg-green-500/80 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm flex items-center space-x-2"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            <span>Accept Completion</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleTaskCompletion(task.id, "REQUEST_REJECTED")}
                                                            className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm flex items-center space-x-2"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            <span>Reject Completion</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CollaborateProject;