import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

type Props = {
    children: React.ReactNode;
};

export default async function AdminLayout({ children }: Props) {
    const session = await auth();

    // Redirect to sign in if not authenticated
    if (!session?.user) {
        redirect('/auth/signin?callbackUrl=/admin');
    }

    // Redirect to home if not an admin
    if (session.user.role !== 'ADMIN') {
        redirect('/?error=unauthorized');
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Admin Header */}
            <AdminHeader user={session.user} />

            <div className="flex">
                {/* Sidebar */}
                <AdminSidebar />

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8 ml-0 lg:ml-64">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
