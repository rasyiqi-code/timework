import { PrismaClient, ProtocolItemType } from '@prisma/client'

const prisma = new PrismaClient()

// Define types for our seed data
type SeedItem = {
    title: string
    type: ProtocolItemType
    role?: 'ADMIN' | 'STAFF' // Default ADMIN
    children?: SeedItem[]
}

type ProtocolDefinition = {
    name: string
    description: string
    items: SeedItem[]
}

// 1. Protocol Reguler Penerbit KBM
const kbmReguler: SeedItem[] = [
    { title: 'DP (UANG MUKA)', type: 'TASK', role: 'ADMIN' },
    { title: 'Naskah Masuk dari Penulis', type: 'TASK', role: 'ADMIN' },
    { title: 'REQUEST PENULIS', type: 'NOTE', role: 'ADMIN' },
    { title: 'KETERANGAN TAMBAHAN', type: 'NOTE', role: 'ADMIN' },
    {
        title: 'LAYOUT',
        type: 'GROUP',
        children: [
            { title: 'Naskah dikirim Ke Kordinator Layout', type: 'TASK', role: 'STAFF' },
            { title: 'Naskah diterima Ke Kordinator Layout', type: 'TASK', role: 'STAFF' },
            { title: 'Layout Selesai', type: 'TASK', role: 'STAFF' }
        ]
    },
    {
        title: 'COVER',
        type: 'GROUP',
        children: [
            { title: 'Naskah dikirim Ke Kordinator Cover', type: 'TASK', role: 'STAFF' },
            { title: 'Naskah diterima Kordinator Cover', type: 'TASK', role: 'STAFF' },
            { title: 'Cover Selesai', type: 'TASK', role: 'STAFF' }
        ]
    },
    {
        title: 'SURAT KEASLIAN',
        type: 'GROUP',
        children: [
            { title: 'Template Surat dikirim ke Penulis', type: 'TASK', role: 'ADMIN' },
            { title: 'Surat Keaslian diterima dari Penulis', type: 'TASK', role: 'ADMIN' }
        ]
    },
    {
        title: 'ISBN/QRCBN/QRSBN',
        type: 'GROUP',
        children: [
            { title: 'ISBN/QRCBN/QRSBN Diajukan', type: 'TASK', role: 'STAFF' },
            { title: 'ISBN/QRCBN/QRSBN Keluar', type: 'TASK', role: 'STAFF' },
            { title: 'Detail Nomor ISBN/QRCBN/QRSBN', type: 'NOTE', role: 'STAFF' }
        ]
    },
    {
        title: 'HAKI',
        type: 'GROUP',
        children: [
            { title: 'HAKI diajukan', type: 'TASK', role: 'STAFF' },
            { title: 'HAKI keluar', type: 'TASK', role: 'STAFF' }
        ]
    },
    {
        title: 'ACC NASKAH',
        type: 'GROUP',
        children: [
            { title: 'Naskah di ACC Cetak Oleh Penulis', type: 'TASK', role: 'STAFF' },
            { title: 'Detail Alamat Kirim Buku Cetakan', type: 'NOTE', role: 'ADMIN' }
        ]
    },
    { title: 'PELUNASAN', type: 'TASK', role: 'ADMIN' },
    { title: 'NAIK CETAK', type: 'TASK', role: 'ADMIN' },
    {
        title: 'ADM. PASCA CETAK',
        type: 'GROUP',
        children: [
            { title: 'Form Penjualan & Royalty', type: 'TASK', role: 'ADMIN' },
            { title: 'Testimoni Penulis', type: 'TASK', role: 'ADMIN' },
            { title: 'Sertifikat Buku', type: 'TASK', role: 'ADMIN' }
        ]
    },
    {
        title: 'DISTRIBUSI & PUBLIKASI',
        type: 'GROUP',
        children: [
            { title: 'Upload Playbook', type: 'TASK', role: 'ADMIN' },
            { title: 'Link Playbook di Kirim ke Penulis', type: 'TASK', role: 'ADMIN' },
            { title: 'Upload Shopee', type: 'TASK', role: 'ADMIN' },
            { title: 'Link Shopee di Kirim ke Penulis', type: 'TASK', role: 'ADMIN' },
            { title: 'Upload OMP', type: 'TASK', role: 'ADMIN' },
            { title: 'Link OMP di Kirim ke Penulis', type: 'TASK', role: 'ADMIN' }
        ]
    },
    { title: 'Resi Diterima', type: 'TASK', role: 'STAFF' },
    { title: 'Resi Dikirim ke Penulis', type: 'TASK', role: 'ADMIN' }
]

// 2. Protocol Satuan Mitra Penerbit (SPT)
const sptMitra: SeedItem[] = [
    {
        title: 'DP & NASKAH',
        type: 'GROUP',
        children: [
            { title: 'Tanggal DP', type: 'TASK', role: 'ADMIN' },
            { title: 'Tanggal Naskah Masuk', type: 'TASK', role: 'ADMIN' },
            { title: 'REQUEST PENULIS', type: 'NOTE', role: 'ADMIN' },
            { title: 'PERUBAHAN/ TAMBAHAN REQUEST PENULIS', type: 'NOTE', role: 'ADMIN' }
        ]
    },
    {
        title: 'LAYOUT',
        type: 'GROUP',
        children: [
            { title: 'Naskah dikirim Ke Kordinator Layout', type: 'TASK', role: 'STAFF' },
            { title: 'Naskah Diterima dari Kordinator Layout', type: 'TASK', role: 'STAFF' },
            { title: 'Layout Selesai', type: 'TASK', role: 'STAFF' }
        ]
    },
    {
        title: 'COVER',
        type: 'GROUP',
        children: [
            { title: 'Naskah dikirim Ke Kordinator Cover', type: 'TASK', role: 'STAFF' },
            { title: 'Naskah diterima dari Kordinator Cover', type: 'TASK', role: 'STAFF' },
            { title: 'Cover Selesai', type: 'TASK', role: 'STAFF' }
        ]
    },
    {
        title: 'SURAT KEASLIAN',
        type: 'GROUP',
        children: [
            { title: 'Template Surat dikirim ke Penulis', type: 'TASK', role: 'ADMIN' },
            { title: 'Surat Keaslian diterima dari Penulis', type: 'TASK', role: 'ADMIN' }
        ]
    },
    {
        title: 'ISBN/QRCBN/QRSBN',
        type: 'GROUP',
        children: [
            { title: 'ISBN/QRCBN/QRSBN Diajukan', type: 'TASK', role: 'STAFF' },
            { title: 'ISBN/QRCBN/QRSBN Keluar', type: 'TASK', role: 'STAFF' },
            { title: 'Detail Nomor ISBN/QRCBN/QRSBN', type: 'NOTE', role: 'STAFF' }
        ]
    },
    {
        title: 'HAKI',
        type: 'GROUP',
        children: [
            { title: 'HAKI diajukan', type: 'TASK', role: 'STAFF' },
            { title: 'HAKI keluar', type: 'TASK', role: 'STAFF' }
        ]
    },
    {
        title: 'ACC NASKAH',
        type: 'GROUP',
        children: [
            { title: 'Naskah di ACC Cetak Oleh Penulis', type: 'TASK', role: 'STAFF' },
            { title: 'Detail Alamat Kirim Buku Cetakan', type: 'NOTE', role: 'ADMIN' }
        ]
    },
    { title: 'PELUNASAN', type: 'TASK', role: 'ADMIN' },
    { title: 'NAIK CETAK', type: 'TASK', role: 'ADMIN' },
    {
        title: 'ADM. PASCA CETAK',
        type: 'GROUP',
        children: [
            { title: 'Form Penjualan & Royalty', type: 'TASK', role: 'ADMIN' },
            { title: 'Testimoni Penulis', type: 'TASK', role: 'ADMIN' },
            { title: 'Sertifikat Buku', type: 'TASK', role: 'ADMIN' }
        ]
    },
    {
        title: 'DISTRIBUSI & PUBLIKASI',
        type: 'GROUP',
        children: [
            { title: 'Upload Playbook', type: 'TASK', role: 'ADMIN' },
            { title: 'Link Playbook di Kirim ke Penulis', type: 'TASK', role: 'ADMIN' },
            { title: 'Upload Shopee', type: 'TASK', role: 'ADMIN' },
            { title: 'Link Shopee di Kirim ke Penulis', type: 'TASK', role: 'ADMIN' },
            { title: 'Upload OMP', type: 'TASK', role: 'ADMIN' },
            { title: 'Link OMP di Kirim ke Penulis', type: 'TASK', role: 'ADMIN' }
        ]
    },
    { title: 'Resi Diterima', type: 'TASK', role: 'STAFF' },
    { title: 'Resi Dikirim ke Mitra SPT', type: 'TASK', role: 'ADMIN' }
]

// 3. Jasa Layout
const jasaLayout: SeedItem[] = [
    { title: 'DP', type: 'TASK', role: 'ADMIN' },
    { title: 'Data Masuk (Naskah, Draft)', type: 'TASK', role: 'ADMIN' },
    { title: 'REQUEST Khusus', type: 'NOTE', role: 'ADMIN' },
    { title: 'Diserahkan ke Kordinator Layout', type: 'TASK', role: 'ADMIN' },
    { title: 'Layout Selesai', type: 'TASK', role: 'STAFF' },
    { title: 'Revisi', type: 'TASK', role: 'STAFF' },
    { title: 'Pelunasan', type: 'TASK', role: 'ADMIN' },
    { title: 'Dikirim ke Mitra/Client', type: 'TASK', role: 'ADMIN' },
    { title: 'Selesai', type: 'TASK', role: 'ADMIN' }
]

// 4. Jasa Desain Cover
const jasaCover: SeedItem[] = [
    { title: 'DP', type: 'TASK', role: 'ADMIN' },
    { title: 'Data Masuk (Naskah, Draft)', type: 'TASK', role: 'ADMIN' },
    { title: 'REQUEST Khusus', type: 'NOTE', role: 'ADMIN' },
    { title: 'Naskah dibagi Ke Kordinator Cover', type: 'TASK', role: 'ADMIN' },
    { title: 'Cover Selesai', type: 'TASK', role: 'STAFF' },
    { title: 'Revisi', type: 'TASK', role: 'STAFF' },
    { title: 'Pelunasan', type: 'TASK', role: 'ADMIN' },
    { title: 'Dikirim ke Mitra/Client', type: 'TASK', role: 'ADMIN' },
    { title: 'Selesai', type: 'TASK', role: 'ADMIN' }
]

// 5. Jasa HAKI
const jasaHaki: SeedItem[] = [
    { title: 'DP', type: 'TASK', role: 'ADMIN' },
    { title: 'Data Masuk (Naskah, Draft)', type: 'TASK', role: 'ADMIN' },
    { title: 'REQUEST Khusus', type: 'NOTE', role: 'ADMIN' },
    { title: 'HAKI diajukan', type: 'TASK', role: 'STAFF' },
    { title: 'Nomor HAKI keluar', type: 'TASK', role: 'STAFF' },
    { title: 'Pelunasan', type: 'TASK', role: 'ADMIN' },
    { title: 'Dikirim ke Mitra/Client', type: 'TASK', role: 'ADMIN' }
]

// 6. Jasa Cetak
const jasaCetak: SeedItem[] = [
    { title: 'DP', type: 'TASK', role: 'ADMIN' },
    { title: 'Data Masuk (Naskah, Draft)', type: 'TASK', role: 'ADMIN' },
    { title: 'REQUEST Khusus', type: 'NOTE', role: 'ADMIN' },
    { title: 'Naskah di ACC Cetak', type: 'TASK', role: 'ADMIN' },
    { title: 'Detail Alamat Pengiriman Buku Cetakan', type: 'NOTE', role: 'ADMIN' },
    { title: 'NAIK CETAK', type: 'TASK', role: 'STAFF' },
    { title: 'Resi Diterima', type: 'TASK', role: 'STAFF' },
    { title: 'Resi Di Kirim Ke Penulis', type: 'TASK', role: 'ADMIN' }
]


const allProtocols: ProtocolDefinition[] = [
    {
        name: 'Protocol Reguler Penerbit KBM',
        description: 'Standard Operating Procedure (Grouped Flow)',
        items: kbmReguler
    },
    {
        name: 'Protocol Satuan Mitra Penerbit (SPT)',
        description: 'Standar Prosedur untuk Mitra SPT',
        items: sptMitra
    },
    {
        name: 'Jasa Layout',
        description: 'Flow Jasa Layout',
        items: jasaLayout
    },
    {
        name: 'Jasa Desain Cover',
        description: 'Flow Jasa Desain Cover',
        items: jasaCover
    },
    {
        name: 'Jasa HAKI',
        description: 'Flow Pengajuan HAKI',
        items: jasaHaki
    },
    {
        name: 'Jasa Cetak',
        description: 'Flow Jasa Cetak',
        items: jasaCetak
    }
]

async function main() {
    console.log('🌱 Starting seed (Multi-Protocols)...')

    // 1. Organization
    const kbmOrg = await prisma.organization.upsert({
        where: { id: '56a6d1cc-04cf-432e-9e31-770e4f2bd5cd' },
        update: {},
        create: {
            id: '56a6d1cc-04cf-432e-9e31-770e4f2bd5cd',
            name: 'PT. Karya Bakti Makmur (KBM)',
            slug: 'kbm-publisher'
        }
    })

    // 1b. Form Template (Moved from Code Config to Database)
    console.log('📝 Seeding Project Form Template...')
    const defaultFormFields = [
        // 1. Header Section
        {
            key: 'orderCategory',
            label: 'Kategori Order (Order Category)',
            type: 'select',
            options: ['KBM Satuan', 'KBM Reguler', 'SPT KBM'],
            required: true
        },
        {
            key: 'date',
            label: 'Tanggal Masuk',
            type: 'date',
            required: true
        },

        // 2. Common Fields
        {
            key: 'author',
            label: 'Nama Penulis (Author)',
            type: 'text',
            placeholder: 'Nama Lengkap Penulis',
            required: true
        },
        {
            key: 'bookTitle',
            label: 'Judul Buku',
            type: 'text',
            placeholder: 'Judul Naskah',
            required: true
        },

        // 3. Dynamic Section (Conditional)
        // IF KBM Satuan -> Show Publisher Name
        {
            key: 'publisherName',
            label: 'Nama Penerbit',
            type: 'text',
            placeholder: 'Nama Penerbit (Mitra)',
            required: true,
            visibility: {
                fieldKey: 'orderCategory',
                operator: 'eq',
                value: 'KBM Satuan'
            }
        },
        // IF KBM Satuan -> Show Service Types (Checkbox)
        {
            key: 'serviceType',
            label: 'Jenis Orderan (Service Type)',
            type: 'checkbox-group',
            options: ['Jasa Layout', 'Jasa Desain Cover', 'Jasa Cetak'],
            required: false,
            visibility: {
                fieldKey: 'orderCategory',
                operator: 'eq',
                value: 'KBM Satuan'
            }
        },
        // IF Reguler OR SPT -> Show Package Type
        {
            key: 'packageType',
            label: 'Jenis Paket',
            type: 'select',
            options: ['Paket Hemat', 'Paket Premium', 'Paket Lengkap', 'Paket Custom'],
            required: true,
            visibility: {
                fieldKey: 'orderCategory',
                operator: 'in',
                value: ['KBM Reguler', 'SPT KBM']
            }
        },

        // 4. Footer Section
        {
            key: 'quantity',
            label: 'Jumlah Eksemplar / Satuan',
            type: 'number',
            placeholder: '100',
            required: true
        },
        {
            key: 'size',
            label: 'Ukuran Buku',
            type: 'select',
            options: ['13x19 cm', '14x20 cm', 'A5 (14.8x21)', 'B5 (17.6x25)', 'Custom'],
            required: true
        }
    ];

    await prisma.organizationFormTemplate.upsert({
        where: { organizationId: kbmOrg.id },
        create: {
            organizationId: kbmOrg.id,
            fields: defaultFormFields
        },
        update: {
            fields: defaultFormFields // Reset to default on seed run? Or keep existing? Usually seed resets or ensures defaults. Let's update.
        }
    });

    // 2. Cleanup
    console.log('🧹 Cleaning up existing protocols...')
    await prisma.protocol.deleteMany({
        where: { organizationId: kbmOrg.id }
    })

    // 3. Loop through protocols
    for (const def of allProtocols) {
        console.log(`\n📌 Creating Protocol: ${def.name}`)

        const protocol = await prisma.protocol.create({
            data: {
                name: def.name,
                description: def.description,
                organizationId: kbmOrg.id
            }
        })

        // Recursive creation
        let globalOrder = 0
        let previousItemId: string | null = null

        const createItemsRecursive = async (items: SeedItem[], parentId: string | null = null) => {
            for (const item of items) {
                const createdItem = await prisma.protocolItem.create({
                    data: {
                        title: item.title,
                        type: item.type,
                        role: item.role || 'ADMIN',
                        order: globalOrder++,
                        protocolId: protocol.id,
                        parentId: parentId
                    }
                })

                // console.log(`   - Created ${item.type}: ${item.title}`)

                // Create Dependency (Sequence)
                // Dependencies only form between TOP level items, or CHILDREN within the same group.
                // We don't link Groups to Tasks directly usually, but logic here assumes flat sequence traversal?
                // Actually, if we traverse hierarchically, dependencies are tricky.
                // Simplified Logic: 
                // - Top level items depend on previous Top Level item.
                // - Children depend on previous Child in the same group.

                if (item.type !== 'GROUP') {
                    if (previousItemId) {
                        // Only link if previous item was NOT the Parent (it should separate scope)
                        // But 'previousItemId' variable is scoped? No, it's global in this loop function.
                        // Let's rely on the function scope.
                        // We need 'previousSiblingId' actually.
                    }
                }
            }
        }

        // Better Implementation for Linking: 
        // We want a Linear Flow: Item 1 -> Item 2 -> Item 3.
        // If Item 2 is a Group, does Item 3 depend on Item 2 (Group) or the last child of Item 2?
        // In the app, Groups are just containers. Dependencies usually flow through them or skip them.
        // Current App Logic: Dependencies are between ITEMS.
        // Let's implement a Flattened Linear Sequence for dependencies for ease of use?
        // OR: Sibling dependencies only?
        // User's previous request implied flow.

        // Let's use a robust Recursive Sibling linker.
        const createItemsHelpers = async (items: SeedItem[], parentId: string | null = null, lastSiblingId: string | null = null) => {
            let localPrevId = lastSiblingId;

            for (const item of items) {
                const createdItem = await prisma.protocolItem.create({
                    data: {
                        title: item.title,
                        type: item.type,
                        role: item.role || 'ADMIN',
                        order: globalOrder++,
                        protocolId: protocol.id, // Fixed: use current protocol.id
                        parentId: parentId
                    }
                });

                // Link to previous sibling
                if (localPrevId) {
                    // We link to previous sibling. 
                    // IMPORTANT: If previous sibling was a GROUP, should we link to it?
                    // In ProjectBoard, Group Dependencies are hidden!
                    // But strictly speaking, the Task follows the Group.
                    // Let's link them. The UI hides buttons but logic remains.
                    await prisma.protocolDependency.create({
                        data: { itemId: createdItem.id, prerequisiteId: localPrevId }
                    });
                }

                localPrevId = createdItem.id;

                // Children?
                if (item.children && item.children.length > 0) {
                    await createItemsHelpers(item.children, createdItem.id, null);
                    // Children start their own chain (null start), they don't depend on outside yet?
                    // Actually, first child usually depends on NOTHING (start of group).
                }
            }
        };

        await createItemsHelpers(def.items);
        console.log(`   ✅ Finished Items for ${def.name}`)
    }

    console.log('\n🚀 Seed finished successfully!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
