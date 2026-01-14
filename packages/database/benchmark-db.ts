import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to Prisma...');
    const start = performance.now();

    try {
        // 1. Warmpup / Connection
        await prisma.$connect();
        console.log(`Connected in ${(performance.now() - start).toFixed(2)}ms`);

        // 2. Simple Query
        const qStart = performance.now();
        const count = await prisma.user.count();
        console.log(`Query (User count: ${count}) took ${(performance.now() - qStart).toFixed(2)}ms`);

        // 3. Metadata Query
        const mStart = performance.now();
        await prisma.$queryRaw`SELECT 1`;
        console.log(`Raw Query (SELECT 1) took ${(performance.now() - mStart).toFixed(2)}ms`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
