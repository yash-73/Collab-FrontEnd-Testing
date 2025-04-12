import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

function CollaborateProject() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({
        assignedTo: "",
        task: "",
    });
    const [taskError, setTaskError] = useState(null);

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

                setError(null);
            } catch (error) {
                console.error("Error fetching project data:", error);
                setError(error.response?.data || "Failed to load project data");
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId]);

    // Set up Firebase listener for tasks
    useEffect(() => {
        if (!projectId || !currentUser?.id || !project?.creatorId) {
            setTasks([]);
            return;
        }

        const tasksRef = collection(db, "Tasks");
        const q = query(tasksRef, 
            where("projectId", "==", projectId),
            where("assignedTo", "in", [currentUser.id, project.creatorId])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTasks(newTasks);
            console.log("Current tasks:", newTasks);
        }, (error) => {
            console.error("Error fetching tasks:", error);
            setTasks([]);
        });

        return () => unsubscribe();
    }, [projectId, currentUser?.id, project?.creatorId]);

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            setTaskError(null);
            const taskToAssign = {
                ...newTask,
                projectId: projectId,
                status: "REQUESTED",
                id: `${newTask.assignedTo}_${newTask.task}_${projectId}`
            };

            const response = await axios.post(
                "http://localhost:8080/api/task/assign",
                taskToAssign,
                { withCredentials: true }
            );

            setNewTask({ assignedTo: "", task: "" });
        } catch (error) {
            console.error("Error assigning task:", error);
            setTaskError(error.response?.data || "Failed to assign task");
        }
    };

    const handleTaskStatusUpdate = async (taskId, newStatus) => {
        try {
            const response = await axios.put(
                "http://localhost:8080/api/task/status",
                { id: taskId, status: newStatus },
                { withCredentials: true }
            );

            // If task is rejected or request is rejected, delete it
            if (newStatus === "REJECTED" || newStatus === "REQUEST_REJECTED") {
                await axios.delete(
                    `http://localhost:8080/api/task/${taskId}`,
                    { withCredentials: true }
                );
            }
        } catch (error) {
            console.error("Error updating task status:", error);
            setTaskError(error.response?.data || "Failed to update task status");
        }
    };

    const handleTaskCompletion = async (taskId, newStatus) => {
        try {
            const response = await axios.put(
                "http://localhost:8080/api/task/completion",
                { id: taskId, status: newStatus },
                { withCredentials: true }
            );

            if (newStatus === "REQUEST_REJECTED") {
                await axios.delete(
                    `http://localhost:8080/api/task/${taskId}`,
                    { withCredentials: true }
                );
            }
        } catch (error) {
            console.error("Error updating task completion:", error);
            setTaskError(error.response?.data || "Failed to update task completion");
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
                    {typeof error === "object" ? error.message || "An error occurred" : error}
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

    return (
        <div className="min-h-screen w-full p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-3xl font-bold mb-4">{project.projectName}</h1>
                    
                    {/* Task Assignment Form */}
                    {currentUser.id === project.creatorId && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Assign New Task</h2>
                            <form onSubmit={handleAssignTask} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assign To</label>
                                    <select
                                        value={newTask.assignedTo}
                                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select a member</option>
                                        {members.map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Task Description</label>
                                    <input
                                        type="text"
                                        value={newTask.task}
                                        onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                >
                                    Assign Task
                                </button>
                            </form>
                            {taskError && (
                                <p className="mt-2 text-red-500">{taskError}</p>
                            )}
                        </div>
                    )}

                    {/* Tasks List */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
                        {tasks.length === 0 ? (
                            <p className="text-gray-500">No tasks available</p>
                        ) : (
                            <div className="space-y-4">
                                {tasks.map(task => (
                                    <div key={task.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{task.task}</p>
                                                <p className="text-sm text-gray-500">
                                                    Assigned to: {members.find(m => m.id === task.assignedTo)?.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Status: {task.status}
                                                </p>
                                            </div>
                                            <div className="space-x-2">
                                                {/* Task Status Controls */}
                                                {task.assignedTo === currentUser.id && task.status === "REQUESTED" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleTaskStatusUpdate(task.id, "PENDING")}
                                                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleTaskStatusUpdate(task.id, "REJECTED")}
                                                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {task.assignedTo === currentUser.id && task.status === "PENDING" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleTaskStatusUpdate(task.id, "REQUEST_COMPLETE")}
                                                            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
                                                        >
                                                            Mark Complete
                                                        </button>
                                                        <button
                                                            onClick={() => handleTaskStatusUpdate(task.id, "REJECTED")}
                                                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {currentUser.id === project.creatorId && task.status === "REQUEST_COMPLETE" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleTaskCompletion(task.id, "COMPLETED")}
                                                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm"
                                                        >
                                                            Accept Completion
                                                        </button>
                                                        <button
                                                            onClick={() => handleTaskCompletion(task.id, "REQUEST_REJECTED")}
                                                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                                                        >
                                                            Reject Completion
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