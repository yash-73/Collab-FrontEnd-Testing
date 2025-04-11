import { useState, useEffect } from "react";
import axios from "axios";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Notifications() {
    const currentUser = useSelector(state => state.auth.user.data);
    const IsLoggedIn = useSelector(state => state.auth.user.isLoggedIn);
    const navigate = useNavigate();
    
    const [requests, setRequests] = useState([])
    const [updatedRequests, setUpdatedRequests] = useState([])
    const [projects, setProjects] = useState([])
    
    const loadProjects = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/api/user/projects",
                {
                    withCredentials: true,
                }
            );
            setProjects(response.data);
            console.log(response.data);
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

    useEffect(() => {
        if (projects.length > 0 && currentUser?.id) {
            // Create document IDs in the format userId_projectId
            const requestDocIds = projects.map(project => 
                `${currentUser.id}_${project.projectId}`
            );
            
            // Only proceed if we have document IDs to query
            if (requestDocIds.length === 0) {
                setRequests([]);
                return;
            }

            const requestsRef = collection(db, "ProjectJoinRequests");
            const q = query(requestsRef, 
                where("__name__", "in", requestDocIds),
                where("status", "==", "PENDING")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newRequest = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setRequests(newRequest);
                console.log("New requests:", newRequest);
            });

            return () => unsubscribe();
        } else {
            setRequests([]);
        }
    }, [projects, currentUser]);

    useEffect(() => {
        if (currentUser?.id && projects.length > 0) {
            // Create document IDs for the current user's requests
            const requestDocIds = projects.map(project => 
                `${currentUser.id}_${project.projectId}`
            );
            
            // Only proceed if we have document IDs to query
            if (requestDocIds.length === 0) {
                setUpdatedRequests([]);
                return;
            }

            const requestsRef = collection(db, "ProjectJoinRequests");
            const q = query(requestsRef,
                where("__name__", "in", requestDocIds),
                where("status", "in", ["ACCEPTED", "REJECTED"])
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newRequest = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setUpdatedRequests(newRequest);
                console.log("Updated requests:", newRequest);
            });

            return () => unsubscribe();
        } else {
            setUpdatedRequests([]);
        }
    }, [projects, currentUser]);

    const handleRequestAction = async (requestId, status) => {
        try {
            const requestRef = doc(db, "ProjectJoinRequests", requestId);
            await updateDoc(requestRef, {
                status: status
            });
        } catch (error) {
            console.error("Error updating request status:", error);
        }
    };

    if (!IsLoggedIn || !currentUser) {
        return null; // or a loading spinner
    }

    return (
        <div className="min-h-screen w-full p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Notifications</h1>
                
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
                                                onClick={() => handleRequestAction(request.id, "ACCEPTED")}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleRequestAction(request.id, "REJECTED")}
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
                                    <div>
                                        <p className="font-semibold">Project ID: {request.projectId}</p>
                                        <p className={`font-medium ${
                                            request.status === "ACCEPTED" ? "text-green-600" : "text-red-600"
                                        }`}>
                                            Status: {request.status}
                                        </p>
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
