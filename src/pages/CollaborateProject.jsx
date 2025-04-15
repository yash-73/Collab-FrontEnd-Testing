import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import ProjectHeader from "../components/collaboration/ProjectHeader";
import TaskList from "../components/collaboration/TaskList";
import TaskFilters from "../components/collaboration/TaskFilters";

function CollaborateProject() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [creator, setCreator] = useState(null);
    const [taskPrUrls, setTaskPrUrls] = useState({});
    const [loadingStates, setLoadingStates] = useState({});
    const [showCompletedOnly, setShowCompletedOnly] = useState(false);
    const [showAllTasks, setShowAllTasks] = useState(false);

    const currentUser = useSelector(state => state.auth.user.data);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                setLoading(true);
                const projectResponse = await axios.get(
                    `http://localhost:8080/api/project/${projectId}`,
                    { withCredentials: true }
                );
                setProject(projectResponse.data);

                if (projectResponse.data.creatorId) {
                    const creatorResponse = await axios.get(
                        `http://localhost:8080/api/user/${projectResponse.data.creatorId}`,
                        { withCredentials: true }
                    );
                    setCreator(creatorResponse.data);
                }

                const membersResponse = await axios.get(
                    `http://localhost:8080/api/project/${projectId}/members`,
                    { withCredentials: true }
                );
                setMembers(membersResponse.data);
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

    useEffect(() => {
        if (!projectId || !currentUser?.id || !project) {
            setTasks([]);
            return;
        }

        const numericProjectId = typeof projectId === 'string' ? parseInt(projectId) : projectId;
        const numericUserId = typeof currentUser.id === 'string' ? parseInt(currentUser.id) : currentUser.id;

        const tasksRef = collection(db, "Tasks");
        let q;
        
        if (currentUser.id === project?.creatorId) {
            q = query(tasksRef, where("projectId", "==", numericProjectId));
        } else {
            q = query(tasksRef, 
                where("assignedTo", "==", numericUserId),
                where("projectId", "==", numericProjectId)
            );
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newTasks = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    assignedTo: Number(data.assignedTo),
                    projectId: Number(data.projectId)
                };
            });
            setTasks(newTasks);
        }, (error) => {
            console.error("Error fetching tasks:", error);
            setTasks([]);
        });

        return () => unsubscribe();
    }, [projectId, currentUser?.id, project?.creatorId]);

    const handleTaskStatusUpdate = async (taskId, newStatus) => {
        try {
            setLoadingStates(prev => ({ ...prev, [taskId]: true }));
            const task = tasks.find(t => t.id === taskId);
            if (!task) {
                throw new Error("Task not found");
            }

            await axios.put(
                "http://localhost:8080/api/task/status",
                { 
                    id: taskId,
                    status: newStatus,
                    assignedTo: Number(task.assignedTo),
                    projectId: Number(task.projectId),
                    details: task.details
                },
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Error updating task status:", error);
            setError(error.response?.data?.message || "Failed to update task status");
        } finally {
            setLoadingStates(prev => ({ ...prev, [taskId]: false }));
        }
    };

    const handleTaskCompletion = async (taskId, prUrl) => {
        try {
            setLoadingStates(prev => ({ ...prev, [taskId]: true }));
            const task = tasks.find(t => t.id === taskId);
            if (!task) {
                throw new Error("Task not found");
            }

            console.log(prUrl);

            const response = await axios.put(
                'http://localhost:8080/api/task/status',
                {
                    id: taskId,
                    status: 'REQUEST_COMPLETE',
                    assignedTo: Number(task.assignedTo),
                    projectId: Number(task.projectId),
                    details: task.details,
                    pullRequestUrl: prUrl
                },
                { withCredentials: true }
            );
            setTaskPrUrls(prev => ({ ...prev, [taskId]: '' }));
        } catch (error) {
            console.error('Error updating task completion:', error);
            setError(error.response?.data?.message || 'Failed to update task completion');
        } finally {
            setLoadingStates(prev => ({ ...prev, [taskId]: false }));
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            setLoadingStates(prev => ({ ...prev, [taskId]: true }));
            const task = tasks.find(t => t.id === taskId);
            if (!task) {
                throw new Error("Task not found");
            }

            if (currentUser.id !== project.creatorId && currentUser.id !== task.assignedTo) {
                throw new Error("You are not authorized to delete this task");
            }

            await axios.delete(
                'http://localhost:8080/api/task/delete',
                {
                    data: { taskId: taskId },
                    withCredentials: true
                }
            );
            
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
            setError(error.response?.data?.message || "Failed to delete task");
        } finally {
            setLoadingStates(prev => ({ ...prev, [taskId]: false }));
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (showCompletedOnly) {
            return task.status === "COMPLETED";
        }
        if (showAllTasks) {
            return true;
        }
        return true;
    });

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
                        <h1 className="text-3xl font-bold text-white">{project?.name}</h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => navigate(`/project/${projectId}/collaborate/message`)}
                                className="px-4 py-2 bg-indigo-500/80 hover:bg-indigo-600/80 text-white rounded-lg transition-colors duration-200 backdrop-blur-sm flex items-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                                <span>Messages</span>
                            </button>
                            {isCreator && (
                                <button
                                    onClick={() => navigate(`/project/${projectId}/edit`)}
                                    className="px-4 py-2 bg-indigo-500/80 hover:bg-indigo-600/80 text-white rounded-lg transition-colors duration-200 backdrop-blur-sm"
                                >
                                    Edit Project
                                </button>
                            )}
                        </div>
                    </div>
                    <ProjectHeader
                        project={project}
                        creator={creator}
                        isCreator={isCreator}
                        projectId={projectId}
                        members={members}
                    />

                    <TaskFilters
                        isCreator={isCreator}
                        showAllTasks={showAllTasks}
                        setShowAllTasks={setShowAllTasks}
                        showCompletedOnly={showCompletedOnly}
                        setShowCompletedOnly={setShowCompletedOnly}
                        filteredTasksCount={filteredTasks.length}
                    />

                    <TaskList
                        filteredTasks={filteredTasks}
                        currentUser={currentUser}
                        isCreator={isCreator}
                        loadingStates={loadingStates}
                        taskPrUrls={taskPrUrls}
                        setTaskPrUrls={setTaskPrUrls}
                        handleTaskStatusUpdate={handleTaskStatusUpdate}
                        handleTaskCompletion={handleTaskCompletion}
                        handleDeleteTask={handleDeleteTask}
                    />
                </div>
            </div>
        </div>
    );
}

export default CollaborateProject;