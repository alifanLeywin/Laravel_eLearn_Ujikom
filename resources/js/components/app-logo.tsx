import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export default function AppLogo() {
    const { auth } = usePage<SharedData>().props;

    const roleLabel = (() => {
        switch (auth.user?.role) {
            case 'super_admin':
                return 'Dashboard Super Admin';
            case 'admin':
                return 'Dashboard Admin';
            case 'teacher':
                return 'Dashboard Teacher';
            case 'student':
                return 'Dashboard Student';
            default:
                return 'Dashboard';
        }
    })();

    return (
        <div className="ml-1 grid flex-1 text-left text-sm">
            <span className="mb-0.5 truncate leading-tight font-semibold">{roleLabel}</span>
        </div>
    );
}
