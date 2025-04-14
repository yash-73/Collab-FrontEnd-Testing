import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useSelector } from 'react-redux';
import { Send, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function MessageList({ projectId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [members, setMembers] = useState([]);
    const messagesEndRef = useRef(null);
    const currentUser = useSelector(state => state.auth.user.data);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/project/${projectId}/members`,
                    { withCredentials: true }
                );
                setMembers(response.data);
            } catch (error) {
                console.error("Error fetching members:", error);
            }
        };

        fetchMembers();
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;

        console.log("Current projectId:", projectId, "Type:", typeof projectId);
        const numericProjectId = Number(projectId);
        console.log("Numeric projectId:", numericProjectId, "Type:", typeof numericProjectId);

        // First, let's see all messages to debug
        const allMessagesRef = collection(db, "Messages");
        const allMessagesQuery = query(allMessagesRef);
        const allMessagesUnsubscribe = onSnapshot(allMessagesQuery, (snapshot) => {
            
        });

        // Then our filtered query
        const messagesRef = collection(db, "Messages");
        const q = query(
            messagesRef,
            where("projectId", "==", numericProjectId),
            orderBy("timestamp", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          
            const newMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                
                return {
                    id: doc.id,
                    ...data
                };
            });
            setMessages(newMessages);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setError("Failed to load messages");
            setLoading(false);
        });

        return () => {
            unsubscribe();
            allMessagesUnsubscribe();
        };
    }, [projectId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const getSenderName = (senderId) => {
        if (senderId === currentUser?.id) return null;
        const member = members.find(m => m.id === senderId);
        return member?.login || 'Unknown User';
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser?.id) return;

        try {
            const messageData = {
                message: newMessage.trim(),
                projectId: Number(projectId),
                senderId: Number(currentUser.id)
            };

            // Send message to backend API only
            await axios.post(
                'http://localhost:8080/api/messages/addMessage',
                messageData,
                { withCredentials: true }
            );

            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
            setError("Failed to send message");
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            // Send delete request to backend API only
            await axios.delete(
                'http://localhost:8080/api/messages/deleteMessage',
                {
                    data: { messageId },
                    withCredentials: true
                }
            );
        } catch (error) {
            console.error("Error deleting message:", error);
            setError("Failed to delete message");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-200 bg-red-500/20 px-4 py-2 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((message) => {
                    const isCurrentUser = message.senderId === currentUser?.id;
                    const senderName = getSenderName(message.senderId);

                    return (
                        <div
                            key={message.id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className="max-w-[70%]">
                                {!isCurrentUser && senderName && (
                                    <div className="text-xs text-white/70 mb-1 ml-1">
                                        {senderName}
                                    </div>
                                )}
                                <div
                                    className={`rounded-lg p-3 group ${
                                        isCurrentUser
                                            ? 'bg-indigo-500/80 text-white'
                                            : 'bg-white/10 text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <p className="text-sm">{message.message}</p>
                                        {isCurrentUser && (
                                            <button
                                                onClick={() => handleDeleteMessage(message.id)}
                                                className="ml-2 text-white/70 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs mt-1 opacity-0 group-hover:opacity-70 transition-opacity">
                                        {message.timestamp?.toDate().toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-indigo-500/80 hover:bg-indigo-600/80 text-white rounded-lg transition-colors duration-200 backdrop-blur-sm flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                    </button>
                </div>
            </form>
        </div>
    );
} 