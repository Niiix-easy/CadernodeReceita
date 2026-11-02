import { jsx as _jsx } from "react/jsx-runtime";
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
export const SyncStatus = () => {
    const isOnline = useOnlineStatus();
    return (_jsx("div", { className: `fixed bottom-4 right-4 z-50 px-3 py-1 text-xs font-bold rounded-full text-white ${isOnline ? 'bg-emerald-600' : 'bg-red-600'}`, children: isOnline ? '● Online' : '○ Offline' }));
};
