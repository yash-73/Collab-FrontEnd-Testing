import React from 'react';
import { Briefcase, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ProjectList({ title, projects }) {
    const navigate = useNavigate();

    return (
        <div className="bg-white/10 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-white/20">
            <h2 className="text-xl font-semibold text-white flex items-center mb-6">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-400" />
                {title}
            </h2>
            <div className="space-y-4">
                {projects.map((project) => (
                    <div
                        key={project.projectId}
                        className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                        onClick={() => navigate(`/project/${project.projectId}`)}
                    >
                        <h3 className="font-semibold text-lg text-white">
                            {project.projectName}
                        </h3>
                        <p className="text-gray-300 mt-2">{project.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {project.techStack?.map((tech) => (
                                <span
                                    key={tech}
                                    className="bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full text-sm font-medium border border-indigo-500/30"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                        {project.githubRepository && (
                            <a
                                href={project.githubRepository}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center text-indigo-300 hover:text-white"
                            >
                                <Github className="w-4 h-4 mr-2" />
                                View on GitHub
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProjectList; 