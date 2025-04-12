import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectList({ projects, title, type = 'created' }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                <Briefcase className={`w-5 h-5 mr-2 ${
                    type === 'created' ? 'text-indigo-500' : 'text-orange-500'
                }`} />
                {title}
            </h2>
            <div className="space-y-4">
                {projects.map((project) => (
                    <Link
                        key={project.projectId}
                        to={`/project/${project.projectId}`}
                        className="block bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                    >
                        <h3 className="font-semibold text-lg text-gray-900">{project.projectName}</h3>
                        <p className="text-gray-600 mt-2">{project.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {project.techStack?.map((tech) => (
                                <span
                                    key={tech}
                                    className={`bg-white px-3 py-1 rounded-full text-sm font-medium border ${
                                        type === 'created' 
                                            ? 'text-indigo-600 border-indigo-100' 
                                            : 'text-orange-600 border-orange-100'
                                    }`}
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
} 