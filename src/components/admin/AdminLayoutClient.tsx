'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

type User = {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
};

type Props = {
    user: User;
    children: React.ReactNode;
};

export default function AdminLayoutClient({ user, children }: Props) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Admin Header */}
            <AdminHeader user={user} onToggleSidebar={toggleSidebar} />

            <div className="flex">
                {/* Sidebar */}
                <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 ml-0 lg:ml-64 min-w-0">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
