import { User2, Mail } from 'lucide-react';
import { useSelector } from "react-redux";

export default function ProfileHeader({ profile }) {
    const user = useSelector((state) => state.auth.user);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center space-x-6">
                {user?.data?.avatar ? (
                    <img
                        src={user.data.avatar}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-gray-50 shadow-lg"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                        <User2 size={48} className="text-gray-400" />
                    </div>
                )}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
                    <p className="text-lg text-gray-600 mt-1">@{profile?.login}</p>
                    <p className="text-gray-500 flex items-center mt-2">
                        <Mail className="w-4 h-4 mr-2" />
                        {profile?.email}
                    </p>
                </div>
            </div>
        </div>
    );
} 