import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import axios from 'axios';

function EmailUpdate({ email, onUpdate }) {
    const [newEmail, setNewEmail] = useState(email);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                'http://localhost:8080/api/user/email',
                { email: newEmail },
                { withCredentials: true }
            );
            onUpdate(newEmail);
            setError(null);
        } catch (error) {
            setError(error.response?.data || 'Failed to update email');
        }
    };

    return (
        <div className="bg-white/10 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-white/20">
            <h2 className="text-xl font-semibold text-white flex items-center mb-6">
                <Mail className="w-5 h-5 mr-2 text-indigo-400" />
                Update Email
            </h2>
            {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-lg mb-6 backdrop-blur-sm">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Email
                    </label>
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                        placeholder="Enter new email"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-500/80 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition-colors backdrop-blur-sm"
                >
                    Update Email
                </button>
            </form>
        </div>
    );
}

export default EmailUpdate; 