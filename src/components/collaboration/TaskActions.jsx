import React from 'react';
import { CheckCircle2, XCircle, GitPullRequest } from 'lucide-react';

export default function TaskActions({
    task,
    isCreator,
    currentUser,
    loadingStates,
    taskPrUrls,
    setTaskPrUrls,
    handleTaskStatusUpdate,
    handleTaskCompletion,
    handleDeleteTask
}) {
    return (
        <div className="space-x-2">
            {task.assignedTo === currentUser.id && task.status === "REQUESTED" && (
                <>
                    <button
                        onClick={() => handleTaskStatusUpdate(task.id, "PENDING")}
                        disabled={loadingStates[task.id]}
                        className="bg-indigo-500/80 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm flex items-center space-x-2 disabled:opacity-50"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept</span>
                    </button>
                    <button
                        onClick={() => handleTaskStatusUpdate(task.id, "REJECTED")}
                        disabled={loadingStates[task.id]}
                        className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm flex items-center space-x-2 disabled:opacity-50"
                    >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                    </button>
                </>
            )}

            {task.assignedTo === currentUser.id && task.status === "PENDING" && (
                <div className="mt-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <GitPullRequest className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-gray-300">Add Pull Request URL</span>
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Enter PR URL"
                            value={taskPrUrls[task.id] || ''}
                            onChange={(e) => setTaskPrUrls(prev => ({ ...prev, [task.id]: e.target.value }))}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                            onClick={() => handleTaskCompletion(task.id, taskPrUrls[task.id])}
                            disabled={!taskPrUrls[task.id] || loadingStates[task.id]}
                            className="bg-indigo-500/80 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm flex items-center space-x-2 disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mark Complete</span>
                        </button>
                    </div>
                </div>
            )}


            {(isCreator && task.status === "PENDING") && (
                <button
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={loadingStates[task.id]}
                    className="bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm flex items-center space-x-2 disabled:opacity-50"
                >
                    <XCircle className="w-4 h-4" />
                    <span>Delete Task</span>
                </button>
            )}
        </div>
    );
} 