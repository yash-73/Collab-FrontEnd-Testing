import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import techstack from "./TechStack/Techstack";

const validRoles = ["USER", "ADMIN"];

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [newTech, setNewTech] = useState("");
  const [techSuggestions, setTechSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [projects, setProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [techStack, setTechStack] = useState(new Set());
  const [roles, setRoles] = useState(new Set());
  const user = useSelector((state) => state.auth.user);

  // Refs for dropdowns
  const roleDropdownRef = useRef(null);
  const techDropdownRef = useRef(null);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target)
      ) {
        setShowRoleDropdown(false);
      }
      if (
        techDropdownRef.current &&
        !techDropdownRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    loadProfile();
    loadProjects();
    loadJoinedProjects();
    loadTechStack();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/user/profile",
        {
          withCredentials: true,
        }
      );
      setProfile(response.data);
      setRoles(new Set(response.data.roles || []));
    } catch (error) {
      setError("Failed to load profile");
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTechStack = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/user/tech", {
        withCredentials: true,
      });
      setTechStack(new Set(response.data));
    } catch (error) {
      console.error("Error loading tech stack:", error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/user/projects",
        {
          withCredentials: true,
        }
      );
      setProjects(response.data);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const loadJoinedProjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/user/joined-projects",
        {
          withCredentials: true,
        }
      );
      setJoinedProjects(response.data);
    } catch (error) {
      console.error("Error loading joined projects:", error);
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:8080/api/user/email",
        { email: newEmail },
        { withCredentials: true }
      );
      setProfile({ ...profile, email: newEmail });
      setNewEmail("");
      alert("Email updated successfully");
    } catch (error) {
      console.error("Error updating email:", error);
      alert("Failed to update email");
    }
  };

  const handleRoleSelect = (role) => {
    setNewRole(role);
    setShowRoleDropdown(false);
  };

  const handleAddRole = async (e) => {
    e.preventDefault();

    // Validate if the role is valid
    if (!validRoles.includes(newRole.toUpperCase())) {
      alert("Please select a valid role (USER or ADMIN)");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/user/role",
        { roles: [newRole.toUpperCase()] },
        { withCredentials: true }
      );
      setRoles(new Set([...roles, newRole.toUpperCase()]));
      setNewRole("");
      alert("Role added successfully");
    } catch (error) {
      console.error("Error adding role:", error);
      alert("Failed to add role");
    }
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

  const handleTechSelect = (tech) => {
    setNewTech(tech);
    setShowSuggestions(false);
  };

  const handleAddTech = async (e) => {
    e.preventDefault();

    // Validate if the tech exists in techstack
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
      setTechStack(new Set(response.data));
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
      const response = await axios.delete(
        `http://localhost:8080/api/user/tech/${tech}`,
        {
          withCredentials: true,
        }
      );
      setTechStack(new Set(response.data));
      alert("Technology removed successfully");
    } catch (error) {
      console.error("Error removing technology:", error);
      alert("Failed to remove technology");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-4">
            {user?.data?.avatar && (
              <img
                src={user.data.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{profile?.name}</h1>
              <p className="text-gray-600">@{profile?.login}</p>
            </div>
          </div>
        </div>

        {/* Email Update */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Update Email</h2>
          <form onSubmit={handleEmailUpdate} className="flex space-x-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New email"
              className="flex-1 p-2 border rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update
            </button>
          </form>
        </div>

        {/* Roles Management */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Roles</h2>
          <form
            onSubmit={handleAddRole}
            className="flex space-x-2 mb-4 relative"
          >
            <div className="flex-1 relative" ref={roleDropdownRef}>
              <input
                type="text"
                value={newRole}
                onFocus={() => setShowRoleDropdown(true)}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Select role..."
                className="w-full p-2 border rounded"
                required
                readOnly
              />
              {showRoleDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                  {validRoles.map((role) => (
                    <div
                      key={role}
                      onClick={() => handleRoleSelect(role)}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Role
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {Array.from(roles).map((role) => (
              <span
                key={role}
                className="bg-gray-200 px-3 py-1 rounded-full text-sm"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Tech Stack Management */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Tech Stack</h2>
          <form
            onSubmit={handleAddTech}
            className="flex space-x-2 mb-4 relative"
          >
            <div className="flex-1 relative" ref={techDropdownRef}>
              <input
                type="text"
                value={newTech}
                onChange={handleTechInputChange}
                placeholder="Search technology..."
                className="w-full p-2 border rounded"
                required
              />
              {showSuggestions && techSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {techSuggestions.map((tech) => (
                    <div
                      key={tech}
                      onClick={() => handleTechSelect(tech)}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {tech}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Tech
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {Array.from(techStack).map((tech) => (
              <div
                key={tech}
                className="bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
              >
                <span>{tech}</span>
                <button
                  onClick={() => handleRemoveTech(tech)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Created Projects */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">My Created Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-gray-600 text-sm">{project.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.techStack?.map((tech) => (
                    <span
                      key={tech}
                      className="bg-gray-200 px-2 py-1 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Joined Projects */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Joined Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedProjects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-gray-600 text-sm">{project.description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.techStack?.map((tech) => (
                    <span
                      key={tech}
                      className="bg-gray-200 px-2 py-1 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
