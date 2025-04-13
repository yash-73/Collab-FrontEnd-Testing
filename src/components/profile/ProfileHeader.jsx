import React from 'react';
import { User2, Mail, Github } from 'lucide-react';
import { useSelector } from "react-redux";

export default function ProfileHeader({ profile, isOwnProfile, onEditClick }) {
    const user = useSelector((state) => state.auth.user);

    return (
        <div className="bg-white/10 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-white/20">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/20">
                        {profile.avatarUrl ? (
                            <img 
                                src={profile.avatarUrl} 
                                alt={profile.name} 
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <User2 className="w-12 h-12 text-gray-300" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                        <p className="text-gray-300 mt-1">@{profile.login}</p>
                        <div className="flex items-center mt-2 text-gray-300">
                            <Mail className="w-4 h-4 mr-2" />
                            <span>{profile.email}</span>
                        </div>
                        {profile.githubId && (
                            <div className="flex items-center mt-2 text-gray-300">
                                <Github className="w-4 h-4 mr-2" />
                                <span>GitHub ID: {profile.githubId}</span>
                            </div>
                        )}
                    </div>
                </div>
                {isOwnProfile && (
                    <button
                        onClick={onEditClick}
                        className="bg-indigo-500/80 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm"
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        </div>
    );
} 