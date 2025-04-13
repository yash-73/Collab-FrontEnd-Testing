import React, { useState } from 'react';
import { Code2, Plus, X, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import techstack from '../TechStack/Techstack';

function TechStackManagement({ techStack, onUpdate }) {
    const [searchTech, setSearchTech] = useState("");
    const [techSuggestions, setTechSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedTech, setSelectedTech] = useState(new Set(techStack));
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleTechInputChange = (e) => {
        const value = e.target.value;
        setSearchTech(value);
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
        if (searchTech && techstack.includes(searchTech.toUpperCase())) {
            setSelectedTech((prev) => new Set([...prev, searchTech.toUpperCase()]));
            setSearchTech("");
            setShowSuggestions(false);
        }
    };

    const handleRemoveTech = async (tech) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/user/tech/${tech}`,
                { withCredentials: true }
            );
            setSelectedTech((prev) => {
                const newSet = new Set(prev);
                newSet.delete(tech);
                return newSet;
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to remove technology';
            setError(errorMessage);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:8080/api/user/tech',
                { techStack: Array.from(selectedTech) },
                { withCredentials: true }
            );
            onUpdate(Array.from(selectedTech));
            setError(null);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update tech stack';
            setError(errorMessage);
            setSuccess(false);
        }
    };

    return (
        <div className="bg-white/10 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-white/20">
            <h2 className="text-xl font-semibold text-white flex items-center mb-6">
                <Code2 className="w-5 h-5 mr-2 text-indigo-400" />
                Manage Tech Stack
            </h2>
            {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-lg mb-6 backdrop-blur-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-6 py-4 rounded-lg mb-6 backdrop-blur-sm flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Tech stack updated successfully!
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Add Technology
                    </label>
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={searchTech}
                            onChange={handleTechInputChange}
                            placeholder="Search technology..."
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-white placeholder-gray-400"
                        />
                        <button
                            type="button"
                            onClick={handleAddTech}
                            className="bg-indigo-500/80 text-white px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 backdrop-blur-sm"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    {showSuggestions && techSuggestions.length > 0 && (
                        <div className="mt-2 bg-white/10 border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto backdrop-blur-sm">
                            {techSuggestions.map((tech) => (
                                <div
                                    key={tech}
                                    onClick={() => {
                                        setSearchTech(tech);
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

                <div className="flex flex-wrap gap-2">
                    {Array.from(selectedTech).map((tech) => (
                        <div
                            key={tech}
                            className="group bg-indigo-500/20 text-indigo-200 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 border border-indigo-500/30"
                        >
                            <Code2 className="w-4 h-4" />
                            <span>{tech}</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveTech(tech)}
                                className="text-indigo-200 hover:text-white transition-colors"
                                title="Remove technology"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    className="w-full bg-indigo-500/80 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition-colors backdrop-blur-sm"
                >
                    Update Tech Stack
                </button>
            </form>
        </div>
    );
}

export default TechStackManagement; 