import React, { useState } from "react";
import axios from "axios";

function DeleteProject({ projectId, onProjectDeleted }) {
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/project/delete/${projectId}`,
        { withCredentials: true }
      );

      if (onProjectDeleted) {
        onProjectDeleted(projectId);
      }
      setError(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      setError(error.response?.data || "Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
      >
        {isDeleting ? "Deleting..." : "Delete Project"}
      </button>
    </div>
  );
}

export default DeleteProject;
