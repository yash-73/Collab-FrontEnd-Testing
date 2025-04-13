import React, { useState } from 'react';
import axios from 'axios';
import techstack from "./TechStack/Techstack";
import { Code2, X } from 'lucide-react';

export default function UpdateProject({ project, onUpdate }) {
    const [formData, setFormData] = useState({
        projectName: project.projectName || "",
        description: project.description || "",
        techStack: new Set(project.techStack || []),
        githubRepository: project.githubRepository || ""
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddTech = (e) => {
        e.preventDefault();
        const newTech = e.target.elements.tech.value.trim().toUpperCase();
        if (newTech && techstack.includes(newTech)) {
            setFormData(prev => ({
                ...prev,
                techStack: new Set([...prev.techStack, newTech])
            }));
            e.target.reset();
        }
    };

    const handleRemoveTech = (tech) => {
        setFormData(prev => ({
            ...prev,
            techStack: new Set([...prev.techStack].filter((t) => t !== tech))
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const response = await axios.put(
                `http://localhost:8080/api/project/${project.projectId}`,
                {
                    projectName: formData.projectName,
                    description: formData.description,
                    techStack: Array.from(formData.techStack),
                    githubRepository: formData.githubRepository
                },
                { withCredentials: true }
            );

            setSuccess("Project updated successfully!");
            onUpdate(response.data);
        } catch (error) {
            console.error("Error updating project:", error);
            setError(error.response?.data || "Failed to update project");
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
                Edit Project
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Edit Project</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name
                        </label>
                        <input
                            type="text"
                            name="projectName"
                            value={formData.projectName}
                            onChange={handleInputChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            GitHub Repository URL
                        </label>
                        <input
                            type="url"
                            name="githubRepository"
                            value={formData.githubRepository}
                            onChange={handleInputChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://github.com/username/repo"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tech Stack
                        </label>
                        <form onSubmit={handleAddTech} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                name="tech"
                                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add technology..."
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Add
                            </button>
                        </form>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(formData.techStack).map((tech) => (
                                <div
                                    key={tech}
                                    className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                                >
                                    <span>{tech}</span>
                                    <button
                                        onClick={() => handleRemoveTech(tech)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {success && (
                        <div className="text-green-500 text-sm">{success}</div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Update Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
