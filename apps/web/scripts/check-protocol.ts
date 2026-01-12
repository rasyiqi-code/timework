
import { prisma } from '@/lib/db';

async function main() {
    const protocolId = 'cmk9ur87d0021khaw0swshk06';
    console.log(`Checking Protocol: ${protocolId}`);

    const protocol = await prisma.protocol.findUnique({
        where: { id: protocolId },
        include: {
            items: {
                select: {
                    id: true,
                    title: true,
                    defaultAssigneeId: true
                }
            }
        }
    });

    if (!protocol) {
        console.log('Protocol not found');
        return;
    }

    console.log('Protocol Items:');
    protocol.items.forEach(item => {
        console.log(`- ${item.title}: DefaultAssigneeId=${item.defaultAssigneeId}`);
    });
}

main().catch(console.error);
