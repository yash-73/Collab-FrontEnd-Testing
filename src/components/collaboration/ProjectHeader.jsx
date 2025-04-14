import React from 'react';
import TaskAssignment from '../task/TaskAssignment';

export default function ProjectHeader({ project, creator, isCreator, projectId, members }) {
    return (
        <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">{project.projectName}</h1>
                <p className="text-gray-300">Created by: {creator?.login || 'Unknown'}</p>
            </div>
            <TaskAssignment
                projectId={projectId}
                members={members}
                isCreator={isCreator}
            />
        </div>
    );
} 