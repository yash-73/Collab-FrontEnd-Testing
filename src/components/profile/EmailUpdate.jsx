import { Mail } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export default function EmailUpdate({ profile, onEmailUpdate }) {
    const [newEmail, setNewEmail] = useState("");

    const handleEmailUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                "http://localhost:8080/api/user/email",
                { email: newEmail },
                { withCredentials: true }
            );
            onEmailUpdate(newEmail);
            setNewEmail("");
            alert("Email updated successfully");
        } catch (error) {
            console.error("Error updating email:", error);
            alert("Failed to update email");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                <Mail className="w-5 h-5 mr-2 text-blue-500" />
                Update Email
            </h2>
            <form onSubmit={handleEmailUpdate} className="flex space-x-3">
                <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="New email address"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Update
                </button>
            </form>
        </div>
    );
} 