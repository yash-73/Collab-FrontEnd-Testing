import React from 'react';
import { PlusCircle } from 'lucide-react';
import TaskStatusBadge from './TaskStatusBadge';
import TaskActions from './TaskActions';

export default function TaskList({
    filteredTasks,
    currentUser,
    isCreator,
    loadingStates,
    taskPrUrls,
    setTaskPrUrls,
    handleTaskStatusUpdate,
    handleTaskCompletion,
    handleDeleteTask
}) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <PlusCircle className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-xl font-semibold text-white">Tasks</h2>
                </div>
            </div>

            {filteredTasks.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                    <p className="text-gray-300">No tasks available</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                    <p className="font-medium text-white">{task.details}</p>
                                    <div className="flex items-center space-x-4">
                                        <p className="text-sm text-gray-300">
                                            Assigned to: {currentUser.login}
                                        </p>
                                        <TaskStatusBadge status={task.status} />
                                    </div>
                                </div>
                                <TaskActions
                                    task={task}
                                    isCreator={isCreator}
                                    currentUser={currentUser}
                                    loadingStates={loadingStates}
                                    taskPrUrls={taskPrUrls}
                                    setTaskPrUrls={setTaskPrUrls}
                                    handleTaskStatusUpdate={handleTaskStatusUpdate}
                                    handleTaskCompletion={handleTaskCompletion}
                                    handleDeleteTask={handleDeleteTask}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 