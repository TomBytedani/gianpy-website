import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.update({
        where: { email: 'gianpaolo.lantermo@gmail.com' },
        data: { role: 'ADMIN' },
    });

    console.log('✓ Updated user to ADMIN:', user.email, user.role);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
