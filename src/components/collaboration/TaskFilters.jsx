import React from 'react';
import { Users, CheckCircle2 } from 'lucide-react';

export default function TaskFilters({ 
    isCreator, 
    showAllTasks, 
    setShowAllTasks, 
    showCompletedOnly, 
    setShowCompletedOnly,
    filteredTasksCount 
}) {
    return (
        <div className="flex items-center space-x-4">
            {isCreator && (
                <button
                    onClick={() => {
                        setShowAllTasks(!showAllTasks);
                        setShowCompletedOnly(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm flex items-center space-x-2 ${
                        showAllTasks
                            ? 'bg-indigo-500/80 hover:bg-indigo-500 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-gray-300'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    <span>All Tasks</span>
                </button>
            )}
            <button
                onClick={() => {
                    setShowCompletedOnly(!showCompletedOnly);
                    setShowAllTasks(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm flex items-center space-x-2 ${
                    showCompletedOnly
                        ? 'bg-green-500/80 hover:bg-green-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
            >
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed</span>
            </button>
            <span className="text-gray-300 text-sm">
                {filteredTasksCount} {filteredTasksCount === 1 ? 'task' : 'tasks'}
            </span>
        </div>
    );
} 