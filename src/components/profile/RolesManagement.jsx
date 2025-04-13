import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import axios from 'axios';

function RolesManagement({ roles, onUpdate }) {
    const [selectedRoles, setSelectedRoles] = useState(new Set(roles));
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleRoleToggle = (role) => {
        setSelectedRoles(prev => {
            const newRoles = new Set(prev);
            if (newRoles.has(role)) {
                newRoles.delete(role);
            } else {
                newRoles.add(role);
            }
            return newRoles;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const rolesArray = Array.from(selectedRoles);
            const response = await axios.post(
                'http://localhost:8080/api/user/role',
                { roles: rolesArray },
                { withCredentials: true }
            );
            
            setSuccess(response.data);
            onUpdate(rolesArray);
        } catch (error) {
            console.error('Error updating roles:', error);
            setError(error.response?.data || 'Failed to update roles');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/10 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-white/20">
            <h2 className="text-xl font-semibold text-white flex items-center mb-6">
                <Shield className="w-5 h-5 mr-2 text-indigo-400" />
                Manage Roles
            </h2>

            {error && (
                <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20 mb-6">
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 p-3 rounded-xl border border-green-500/20 mb-6">
                    <span>{success}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {['USER', 'ADMIN'].map((role) => (
                        <label
                            key={role}
                            className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={selectedRoles.has(role)}
                                onChange={() => handleRoleToggle(role)}
                                className="w-4 h-4 text-indigo-500 bg-white/5 border-white/20 rounded focus:ring-indigo-500"
                            />
                            <span className="text-gray-300">{role}</span>
                        </label>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center space-x-2 bg-indigo-500/80 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20 ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            <span>Updating...</span>
                        </>
                    ) : (
                        <span>Update Roles</span>
                    )}
                </button>
            </form>
        </div>
    );
}

export default RolesManagement; 