import React from 'react';
import { Check, AlertTriangle, X } from 'lucide-react';

const StatusIcon = ({ status }) => {
    switch (status) {
        case 'valid': return <Check className="w-4 h-4 text-green-500" />;
        case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        case 'error': return <X className="w-4 h-4 text-red-500" />;
        case 'info': return <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>;
        default: return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
};

export default StatusIcon;
