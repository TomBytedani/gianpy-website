import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

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
        <AdminLayoutClient user={session.user}>
            {children}
        </AdminLayoutClient>
    );
}

