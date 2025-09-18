import React, { useState } from 'react';
import axios from 'axios';
import techstack from "./TechStack/Techstack";
import { Code2, X, FileText, Github } from 'lucide-react';

export default function UpdateProject({ project, onUpdate }) {
    const [formData, setFormData] = useState({
        description: project.description || "",
        techStack: new Set(project.techStack || []),
        githubRepository: project.githubRepository || ""
    });

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [newTech, setNewTech] = useState("");
    const [techSuggestions, setTechSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTechInputChange = (e) => {
        const value = e.target.value;
        setNewTech(value);
        if (value.length > 0) {
            const filtered = techstack.filter((tech) =>
                tech.toLowerCase().includes(value.toLowerCase())
            );
            setTechSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setTechSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleAddTech = (e) => {
        e.preventDefault();
        if (newTech && techstack.includes(newTech.toUpperCase())) {
            setFormData(prev => ({
                ...prev,
                techStack: new Set([...prev.techStack, newTech.toUpperCase()])
            }));
            setNewTech("");
            setShowSuggestions(false);
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
                `http://localhost:8080/api/project/update`,
                {
                    projectId: project.projectId,
                    projectName: project.projectName,
                    creatorId: project.creatorId,
                    description: formData.description,
                    techStack: Array.from(formData.techStack),
                    githubRepository: formData.githubRepository
                },
                { withCredentials: true }
            );

            setSuccess("Project updated successfully!");
            console.log(response.data);
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
                className="px-4 py-2 bg-indigo-500/80 hover:bg-indigo-600/80 text-white rounded-lg transition-colors duration-200 backdrop-blur-sm flex items-center space-x-2"
            >
                <Code2 className="w-5 h-5" />
                <span>Edit Project</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 rounded-2xl shadow-lg p-8 max-w-2xl w-full border border-white/20 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-white">Edit Project</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-lg mb-6 backdrop-blur-sm">
                        {typeof error === "object" ? error.message || JSON.stringify(error) : error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-6 py-4 rounded-lg mb-6 backdrop-blur-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">
                            Description
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-white/50" />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                                rows="3"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">
                            GitHub Repository URL
                        </label>
                        <div className="relative">
                            <Github className="absolute left-3 top-3 text-white/50" />
                            <input
                                type="url"
                                name="githubRepository"
                                value={formData.githubRepository}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/20 rounded-lg px-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                                placeholder="https://github.com/username/repo"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">
                            Tech Stack
                        </label>
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <Code2 className="absolute left-3 top-3 text-white/50" />
                                <input
                                    type="text"
                                    value={newTech}
                                    onChange={handleTechInputChange}
                                    placeholder="Search technology..."
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-10 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                                />
                                {showSuggestions && techSuggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 mt-2 bg-white/10 border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto backdrop-blur-sm z-10">
                                        {techSuggestions.map((tech) => (
                                            <div
                                                key={tech}
                                                onClick={() => {
                                                    setNewTech(tech);
                                                    setShowSuggestions(false);
                                                }}
                                                className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors text-white"
                                            >
                                                {tech}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleAddTech}
                                className="px-4 py-2 bg-indigo-500/80 hover:bg-indigo-600/80 text-white rounded-lg transition-colors duration-200 backdrop-blur-sm"
                            >
                                +
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(formData.techStack).map((tech) => (
                                <div
                                    key={tech}
                                    className="flex items-center gap-2 bg-indigo-500/20 text-white px-3 py-1 rounded-full border border-indigo-500/30"
                                >
                                    <span>{tech}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTech(tech)}
                                        className="text-white/70 hover:text-white transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-500/80 hover:bg-indigo-600/80 text-white rounded-lg transition-colors duration-200 backdrop-blur-sm"
                        >
                            Update Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
