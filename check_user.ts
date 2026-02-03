
import prisma from './src/lib/db';

async function checkUser() {
    const user = await prisma.user.findUnique({
        where: { email: 'patient@test.com' },
        include: { patient: true }
    });
    console.log('Current User in DB:');
    console.log(JSON.stringify(user, null, 2));
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
