
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for records with invalid organizationId...');

    const orgs = await prisma.organization.findMany();
    const orgIds = new Set(orgs.map(o => o.id));

    let fixedCount = 0;

    // Users
    const users = await prisma.user.findMany({ where: { organizationId: { not: null } } });
    for (const user of users) {
        if (user.organizationId && !orgIds.has(user.organizationId)) {
            console.log(`Fixing user ${user.id}`);
            await prisma.user.update({ where: { id: user.id }, data: { organizationId: null } });
            fixedCount++;
        }
    }

    // Members
    const members = await prisma.organizationMember.findMany();
    for (const m of members) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!orgIds.has(m.organizationId as any)) { // Casting to avoid complex type issues if schema changed
            console.log(`Deleting invalid member ${m.id}`);
            try {
                await prisma.organizationMember.delete({ where: { id: m.id } });
                fixedCount++;
            } catch (e: any) {
                if (e.code !== 'P2025') console.error(e);
            }
        }
    }

    // Projects
    const projects = await prisma.project.findMany();
    for (const p of projects) {
        if (!orgIds.has(p.organizationId)) {
            console.log(`Deleting invalid project ${p.id}`);
            try {
                await prisma.project.delete({ where: { id: p.id } });
                fixedCount++;
            } catch (e: any) {
                if (e.code !== 'P2025') console.error(e);
            }
        }
    }

    // Protocols
    const protocols = await prisma.protocol.findMany();
    const validProtocolIds = new Set(protocols.map(p => p.id));
    for (const p of protocols) {
        if (!orgIds.has(p.organizationId)) {
            console.log(`Deleting invalid protocol ${p.id}`);
            try {
                await prisma.protocol.delete({ where: { id: p.id } });
                validProtocolIds.delete(p.id);
                fixedCount++;
            } catch (e: any) {
                if (e.code !== 'P2025') console.error(e);
            }
        }
    }

    // Protocol Items (Orphans)
    const protocolItems = await prisma.protocolItem.findMany();
    for (const item of protocolItems) {
        if (!validProtocolIds.has(item.protocolId)) {
            console.log(`Deleting orphan protocol item ${item.id}`);
            try {
                await prisma.protocolItem.delete({ where: { id: item.id } });
                fixedCount++;
            } catch (e: any) {
                if (e.code !== 'P2025') console.error(e);
            }
        }
    }

    // Project Items (Orphans)
    // Re-fetch projects to get current valid list
    const validProjects = await prisma.project.findMany();
    const validProjectIds = new Set(validProjects.map(p => p.id));

    const projectItems = await prisma.projectItem.findMany();
    for (const item of projectItems) {
        if (!validProjectIds.has(item.projectId)) {
            console.log(`Deleting orphan project item ${item.id}`);
            try {
                await prisma.projectItem.delete({ where: { id: item.id } });
                fixedCount++;
            } catch (e: any) {
                if (e.code !== 'P2025') console.error(e);
            }
        }
    }

    // Project History (Orphans)
    const history = await prisma.projectHistory.findMany();
    for (const h of history) {
        if (!validProjectIds.has(h.projectId)) {
            console.log(`Deleting orphan history ${h.id}`);
            try {
                await prisma.projectHistory.delete({ where: { id: h.id } });
                fixedCount++;
            } catch (e: any) {
                if (e.code !== 'P2025') console.error(e);
            }
        }
    }

    console.log(`Fixed/Deleted ${fixedCount} records.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
