import React, { useState } from "react";
import axios from "axios";
import { Trash2, Loader2, AlertCircle } from 'lucide-react';

function DeleteProject({ projectId, onProjectDeleted }) {
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!projectId) {
      setError("Project ID is missing");
      return;
    }

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
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.details || 
                          "Failed to delete project";
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!projectId) {
    return null;
  }

  return (
    <div>
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-2 rounded-lg mb-4 flex items-center space-x-2 backdrop-blur-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="w-full bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Deleting...</span>
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            <span>Delete Project</span>
          </>
        )}
      </button>
    </div>
  );
}

export default DeleteProject;