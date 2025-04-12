import { User2, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const validRoles = ["USER", "ADMIN"];

export default function RolesManagement({ roles, onRolesUpdate }) {
    const [newRole, setNewRole] = useState("");
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const roleDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
                setShowRoleDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleRoleSelect = (role) => {
        setNewRole(role);
        setShowRoleDropdown(false);
    };

    const handleAddRole = async (e) => {
        e.preventDefault();
        if (!validRoles.includes(newRole.toUpperCase())) {
            alert("Please select a valid role (USER or ADMIN)");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:8080/api/user/role",
                { roles: [newRole.toUpperCase()] },
                { withCredentials: true }
            );
            onRolesUpdate(response.data);
            setNewRole("");
            alert("Role added successfully");
        } catch (error) {
            console.error("Error adding role:", error);
            alert("Failed to add role");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                <User2 className="w-5 h-5 mr-2 text-purple-500" />
                Roles
            </h2>
            <form onSubmit={handleAddRole} className="flex space-x-3 mb-6 relative">
                <div className="flex-1 relative" ref={roleDropdownRef}>
                    <input
                        type="text"
                        value={newRole}
                        onFocus={() => setShowRoleDropdown(true)}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Select role..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                        readOnly
                    />
                    {showRoleDropdown && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-lg">
                            {validRoles.map((role) => (
                                <div
                                    key={role}
                                    onClick={() => handleRoleSelect(role)}
                                    className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                                >
                                    {role}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </form>
            <div className="flex flex-wrap gap-2">
                {Array.from(roles).map((role) => (
                    <span
                        key={role}
                        className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium"
                    >
                        {typeof role === "object" ? role.roleName : role}
                    </span>
                ))}
            </div>
        </div>
    );
} 