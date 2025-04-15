import React, { useState, useEffect } from "react";
import axios from "axios";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, XCircle, Trash2, Clock, Check, ClipboardList } from "lucide-react";

function Notifications() {
    const currentUser = useSelector(state => state.auth.user.data);
    const IsLoggedIn = useSelector(state => state.auth.user.isLoggedIn);
    const navigate = useNavigate();
    
    const [requests, setRequests] = useState([]);
    const [updatedRequests, setUpdatedRequests] = useState([]);
    const [projects, setProjects] = useState([]);
    const [ownRequests, setOwnRequests] = useState([]);
    const [taskNotifications, setTaskNotifications] = useState([]);
    const [taskDetails, setTaskDetails] = useState({});

const loadProjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/user/projects",
        {
          withCredentials: true,
        }
      );
      setProjects(response.data);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

    useEffect(() => {
        if (!IsLoggedIn) {
            navigate("/login");
            return;
    }
    loadProjects();
    }, [IsLoggedIn, navigate]);

    // Listen for requests to user's projects
    useEffect(() => {
        if (projects.length > 0 && currentUser?.id) {
            const projectIds = projects.map(project => project.projectId);
            
            if (projectIds.length === 0) {
                setRequests([]);
                return;
            }

            const requestsRef = collection(db, "ProjectJoinRequests");
            const q = query(requestsRef, 
                where("projectId", "in", projectIds),
                where("status", "==", "PENDING")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newRequests = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setRequests(newRequests);
            });

            return () => unsubscribe();
        } else {
            setRequests([]);
        }
    }, [projects, currentUser]);

    // Listen for own requests
    useEffect(() => {
        if (currentUser?.id) {
            const requestsRef = collection(db, "ProjectJoinRequests");
            const q = query(requestsRef, 
                where("userId", "==", currentUser.id),
                where("status", "==", "PENDING")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
                }));
                setOwnRequests(newRequests);
            });

            return () => unsubscribe();
        } else {
            setOwnRequests([]);
        }
    }, [currentUser?.id]);

    // Listen for updated requests (accepted/rejected)
    useEffect(() => {
        if (currentUser?.id) {
            const requestsRef = collection(db, "ProjectJoinRequests");
            const q = query(requestsRef,
                where("userId", "==", currentUser.id),
                where("status", "in", ["ACCEPTED", "REJECTED"])
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
                }));
                setUpdatedRequests(newRequests);
            });

            return () => unsubscribe();
        } else {
            setUpdatedRequests([]);
        }
    }, [currentUser?.id]);

    // Listen for new tasks assigned to the current user
    useEffect(() => {
        if (currentUser?.id) {
            const tasksRef = collection(db, "Tasks");
            const q = query(tasksRef, 
                where("assignedTo", "==", Number(currentUser.id)),
                where("status", "==", "REQUESTED")
            );

            const unsubscribe = onSnapshot(q, async (snapshot) => {
                const newTasks = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTaskNotifications(newTasks);

                // Fetch additional details for each task
                const details = {};
                for (const task of newTasks) {
                    try {
                        // Fetch project details
                        const projectResponse = await axios.get(
                            `http://localhost:8080/api/project/${task.projectId}`,
                            { withCredentials: true }
                        );
                        
                        // Fetch assigner details
                        const assignerResponse = await axios.get(
                            `http://localhost:8080/api/user/${task.assignedBy}`,
                            { withCredentials: true }
                        );

                        details[task.id] = {
                            projectName: projectResponse.data.name,
                            assignerLogin: assignerResponse.data.login
                        };
                    } catch (error) {
                        console.error("Error fetching task details:", error);
                        details[task.id] = {
                            projectName: "Unknown Project",
                            assignerLogin: "Unknown User"
                        };
                    }
                }
                setTaskDetails(details);
            });

            return () => unsubscribe();
        }
    }, [currentUser?.id]);

    const handleRequestAction = async (requestId, userId, projectId, status) => {
        try {
            await axios.put(
                "http://localhost:8080/api/notification/update-request",
                {
                    projectId,
                    userId,
                    status
                },
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Error updating request status:", error);
            alert("Failed to update request status");
        }
    };

    const handleDeleteRequest = async (projectId) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/notification/own-request/${projectId}`,
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Error deleting request:", error);
            alert("Failed to delete join request");
        }
    };

    const handleSeenRequest = async (userId, projectId) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/notification/seen-request/${userId}/${projectId}`,
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Error marking request as seen:", error);
            alert("Failed to mark request as seen");
        }
    };

    const handleTaskSeen = async (taskId) => {
        try {
            await axios.put(
                `http://localhost:8080/api/task/status`,
                {
                    id: taskId,
                    status: "PENDING"
                },
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Error updating task status:", error);
            alert("Failed to update task status");
        }
    };

    if (!IsLoggedIn || !currentUser) {
        return null;
    }

  return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950 text-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 mb-8">
                    <Bell className="w-8 h-8 text-purple-400" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Notifications
                    </h1>
                </div>
                
                {/* Task Notifications Section */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-blue-400" />
                        Task Assignments
                    </h2>
                    {taskNotifications.length === 0 ? (
                        <p className="text-gray-400">No new task assignments</p>
                    ) : (
                        <div className="space-y-4">
                            {taskNotifications.map((task) => (
                                <div 
                                    key={task.id} 
                                    className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-blue-500/50 transition-all"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-blue-300">New Task Assigned</p>
                                            <p className="text-gray-300 mt-1">{task.details}</p>
                                            <div className="text-xs text-gray-400 mt-2 space-y-1">
                                                <p>Project: {taskDetails[task.id]?.projectName || "Loading..."}</p>
                                                <p>Assigned by: {taskDetails[task.id]?.assignerLogin || "Loading..."}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    handleTaskSeen(task.id);
                                                    navigate(`/project/${task.projectId}/collaborate`);
                                                }}
                                                className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg transition-all"
                                            >
                                                <Check className="w-4 h-4" />
                                                View Task
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* My Join Requests Section */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        My Join Requests
                    </h2>
                    {ownRequests.length === 0 ? (
                        <p className="text-gray-400">No pending join requests</p>
                    ) : (
                        <div className="space-y-4">
                            {ownRequests.map((request) => (
                                <div key={request.id} className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-purple-500/50 transition-all">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-purple-300">Project ID: {request.projectId}</p>
                                            <p className="text-gray-400">Status: {request.status}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteRequest(request.projectId)}
                                            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pending Join Requests Section */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-yellow-400" />
                        Pending Join Requests
                    </h2>
                    {requests.length === 0 ? (
                        <p className="text-gray-400">No pending join requests</p>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div key={request.id} className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-purple-500/50 transition-all">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-purple-300">User ID: {request.userId}</p>
                                            <p className="text-gray-400">Project ID: {request.projectId}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleRequestAction(request.id, request.userId, request.projectId, "ACCEPTED")}
                                                className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-4 py-2 rounded-lg transition-all"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleRequestAction(request.id, request.userId, request.projectId, "REJECTED")}
                                                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-all"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
   </div>

                {/* Updated Requests Section */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Request Updates
                    </h2>
                    {updatedRequests.length === 0 ? (
                        <p className="text-gray-400">No request updates</p>
                    ) : (
                        <div className="space-y-4">
                            {updatedRequests.map((request) => (
                                <div 
                                    key={request.id} 
                                    className={`bg-white/5 backdrop-blur-sm p-4 rounded-lg border transition-all ${
                                        request.status === "ACCEPTED" 
                                            ? "border-green-500/30 hover:border-green-500/50" 
                                            : "border-red-500/30 hover:border-red-500/50"
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-purple-300">Project ID: {request.projectId}</p>
                                            <p className={`font-medium ${
                                                request.status === "ACCEPTED" ? "text-green-400" : "text-red-400"
                                            }`}>
                                                Status: {request.status}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleSeenRequest(request.userId, request.projectId)}
                                            className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg transition-all"
                                        >
                                            <Check className="w-4 h-4" />
                                            OK
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Notifications;