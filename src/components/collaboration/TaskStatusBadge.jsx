import React from 'react';
import { CheckCircle2, AlertCircle, Clock, XCircle, Loader2 } from 'lucide-react';

export const getStatusColor = (status) => {
    switch (status) {
        case 'REQUESTED': return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
        case 'PENDING': return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
        case 'REQUEST_COMPLETE': return 'bg-purple-500/20 text-purple-200 border-purple-500/30';
        case 'COMPLETED': return 'bg-green-500/20 text-green-200 border-green-500/30';
        case 'REJECTED':
        case 'REQUEST_REJECTED': return 'bg-red-500/20 text-red-200 border-red-500/30';
        default: return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
    }
};

export const getStatusIcon = (status) => {
    switch (status) {
        case 'REQUESTED': return <Clock className="w-4 h-4" />;
        case 'PENDING': return <Loader2 className="w-4 h-4 animate-spin" />;
        case 'REQUEST_COMPLETE':
        case 'COMPLETED': return <CheckCircle2 className="w-4 h-4" />;
        case 'REJECTED':
        case 'REQUEST_REJECTED': return <XCircle className="w-4 h-4" />;
        default: return <AlertCircle className="w-4 h-4" />;
    }
};

export default function TaskStatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            <span className="mr-1">{getStatusIcon(status)}</span>
            {status}
        </span>
    );
} 