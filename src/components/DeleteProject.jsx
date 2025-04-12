import React, { useState } from "react";
import axios from "axios";
import { Trash2, Loader2 } from 'lucide-react';

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isDeleting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Deleting...</span>
          </>
        ) : (
          <>
            <Trash2 className="w-5 h-5" />
            <span>Delete Project</span>
          </>
        )}
      </button>
    </div>
  );
}

export default DeleteProject;