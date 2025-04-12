import { Code2, Plus, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import techstack from '../TechStack/Techstack';

export default function TechStackManagement({ techStack, onTechStackUpdate }) {
    const [newTech, setNewTech] = useState("");
    const [techSuggestions, setTechSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const techDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (techDropdownRef.current && !techDropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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

    const handleTechSelect = (tech) => {
        setNewTech(tech);
        setShowSuggestions(false);
    };

    const handleAddTech = async (e) => {
        e.preventDefault();
        if (!techstack.includes(newTech.toUpperCase())) {
            alert("Please select a valid technology from the list");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:8080/api/user/tech",
                { techStack: [newTech.toUpperCase()] },
                { withCredentials: true }
            );
            onTechStackUpdate(response.data);
            setNewTech("");
            setShowSuggestions(false);
            alert("Technology added successfully");
        } catch (error) {
            console.error("Error adding technology:", error);
            alert("Failed to add technology");
        }
    };

    const handleRemoveTech = async (tech) => {
        try {

            console.log(tech);
            const response = await axios.delete(
                `http://localhost:8080/api/user/tech/${tech.techName || tech}`,
                { withCredentials: true }
            );
            onTechStackUpdate(response.data);
            alert("Technology removed successfully");
        } catch (error) {
            console.error("Error removing technology:", error);
            alert("Failed to remove technology");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                <Code2 className="w-5 h-5 mr-2 text-green-500" />
                Tech Stack
            </h2>
            <form onSubmit={handleAddTech} className="flex space-x-3 mb-6 relative">
                <div className="flex-1 relative" ref={techDropdownRef}>
                    <input
                        type="text"
                        value={newTech}
                        onChange={handleTechInputChange}
                        placeholder="Search technology..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        required
                    />
                    {showSuggestions && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {techSuggestions.length > 0 ? (
                                techSuggestions.map((tech) => (
                                    <div
                                        key={tech}
                                        onClick={() => handleTechSelect(tech)}
                                        className="px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        {tech}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-gray-500">No suggestions found</div>
                            )}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </form>
            <div className="flex flex-wrap gap-2">
                {Array.from(techStack).map((tech) => (
                    <div
                        key={tech.id || tech}
                        className="group bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2"
                    >
                        <span>{tech.techName || tech}</span>
                        <button
                            onClick={() => handleRemoveTech(tech.techName || tech)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-800"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
} 