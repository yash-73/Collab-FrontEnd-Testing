import { useState, useEffect } from "react";
import axios from "axios";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Notifications() {
    const currentUser = useSelector(state => state.auth.user.data);
    const IsLoggedIn = useSelector(state => state.auth.user.isLoggedIn);
    const navigate = useNavigate();
    
    const [requests, setRequests] = useState([])
    const [updatedRequests, setUpdatedRequests] = useState([])
    const [projects, setProjects] = useState([])
    const [ownRequests, setOwnRequests] = useState([]);

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

    if (!IsLoggedIn || !currentUser) {
        return null;
    }

    return (
        <div className="min-h-screen w-full p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Notifications</h1>
                
                {/* My Join Requests Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">My Join Requests</h2>
                    {ownRequests.length === 0 ? (
                        <p className="text-gray-500">No pending join requests</p>
                    ) : (
                        <div className="space-y-4">
                            {ownRequests.map((request) => (
                                <div key={request.id} className="bg-white p-4 rounded-lg shadow-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">Project ID: {request.projectId}</p>
                                            <p className="text-gray-600">Status: {request.status}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteRequest(request.projectId)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                        >
                                            Delete Request
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pending Join Requests Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Pending Join Requests</h2>
                    {requests.length === 0 ? (
                        <p className="text-gray-500">No pending join requests</p>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div key={request.id} className="bg-white p-4 rounded-lg shadow-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">User ID: {request.userId}</p>
                                            <p className="text-gray-600">Project ID: {request.projectId}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleRequestAction(request.id, request.userId, request.projectId, "ACCEPTED")}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleRequestAction(request.id, request.userId, request.projectId, "REJECTED")}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                            >
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
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Request Updates</h2>
                    {updatedRequests.length === 0 ? (
                        <p className="text-gray-500">No request updates</p>
                    ) : (
                        <div className="space-y-4">
                            {updatedRequests.map((request) => (
                                <div 
                                    key={request.id} 
                                    className={`bg-white p-4 rounded-lg shadow-md ${
                                        request.status === "ACCEPTED" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">Project ID: {request.projectId}</p>
                                            <p className={`font-medium ${
                                                request.status === "ACCEPTED" ? "text-green-600" : "text-red-600"
                                            }`}>
                                                Status: {request.status}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleSeenRequest(request.userId, request.projectId)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                        >
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
