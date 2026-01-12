import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed (Protocol Only)...')

    // ==========================================
    // 1. UPSERT ORGANIZATION (Tenant)
    // ==========================================
    const kbmOrg = await prisma.organization.upsert({
        where: { id: '56a6d1cc-04cf-432e-9e31-770e4f2bd5cd' },
        update: {},
        create: {
            id: '56a6d1cc-04cf-432e-9e31-770e4f2bd5cd',
            name: 'PT. Karya Bakti Makmur (KBM)',
            slug: 'kbm-publisher'
        }
    })
    console.log('✅ Organization synced:', kbmOrg.name)

    // ==========================================
    // 1b. CLEANUP EXISTING PROTOCOLS (Idempotency)
    // ==========================================
    console.log('🧹 Cleaning up existing KBM protocols to prevent duplicates...')
    await prisma.protocol.deleteMany({
        where: { organizationId: kbmOrg.id }
    })
    console.log('✅ Previous protocols removed.')

    // ==========================================
    // HELPERS
    // ==========================================
    const createProtocol = async (name: string, description: string, itemsData: { title: string, role: string }[]) => {
        const protocol = await prisma.protocol.create({
            data: {
                name,
                description,
                organizationId: kbmOrg.id,
                items: {
                    create: itemsData.map((item, index) => ({
                        title: item.title,
                        role: item.role,
                        order: index,
                        defaultAssigneeId: null
                    }))
                }
            }
        })
        console.log(`✅ Protocol created: ${name}`)

        // Link Dependencies
        const items = await prisma.protocolItem.findMany({
            where: { protocolId: protocol.id },
            orderBy: { order: 'asc' }
        })

        let createdLinks = 0
        for (let i = 1; i < items.length; i++) {
            const prev = items[i - 1]
            const curr = items[i]

            await prisma.protocolDependency.create({
                data: {
                    itemId: curr.id,
                    prerequisiteId: prev.id
                }
            })
            createdLinks++
        }
        console.log(`   🔗 Linked ${createdLinks} dependencies for ${name}`)
    }

    // ==========================================
    // 2. CREATE PROTOCOLS
    // ==========================================

    // Protocol 1: Prosedur Penerbitan Buku (KBM) - EXISTING
    const itemsData1 = [
        { title: 'Tanggal naskah masuk', role: 'ADMIN' },
        { title: 'Tanggal DP (Uang muka masuk, proses dimulai)', role: 'STAFF' },
        { title: 'REQUEST PENULIS', role: 'ADMIN' },
        { title: 'Naskah dibagi Ke Kordinator Layout', role: 'STAFF' },
        { title: 'Layout Selesai', role: 'STAFF' },
        { title: 'Naskah dibagi Ke Kordinator Cover', role: 'STAFF' },
        { title: 'Cover Selesai', role: 'STAFF' },
        { title: 'PERUBAHAN / TAMBAHAN REQUEST PENULIS', role: 'ADMIN' },
        { title: 'Surat Keaslian diterima dari Penulis', role: 'ADMIN' },
        { title: 'Pengajuan ISBN/QRCBN/QRSBN', role: 'STAFF' },
        { title: 'Keluarnya ISBN/QRCBN/QRSBN', role: 'STAFF' },
        { title: 'ISBN/QRCBN/QRSBN (Nomor diinput)', role: 'STAFF' },
        { title: 'HAKI diajukan admin', role: 'STAFF' },
        { title: 'HAKI keluar', role: 'STAFF' },
        { title: 'Naskah di ACC Cetak Oleh Penulis', role: 'STAFF' },
        { title: 'Pelunasan (Biasanya wajib lunas sebelum naik cetak)', role: 'STAFF' },
        { title: 'Alamat Kirim Buku Cetakan', role: 'ADMIN' },
        { title: 'NAIK CETAK', role: 'STAFF' },
        { title: 'JotForm dibagi', role: 'ADMIN' },
        { title: 'Testimoni dibagi', role: 'ADMIN' },
        { title: 'Sertifikat dibagi', role: 'ADMIN' },
        { title: 'Upload Playbook', role: 'ADMIN' },
        { title: 'Link Playbook di Kirim ke Penulis', role: 'ADMIN' },
        { title: 'Upload Shopee', role: 'ADMIN' },
        { title: 'Link Shopee di Kirim ke Penulis', role: 'ADMIN' },
        { title: 'Upload OMP', role: 'ADMIN' },
        { title: 'Link OMP di Kirim ke Penulis', role: 'ADMIN' },
        { title: 'Resi Di Kirim Ke Marketing', role: 'STAFF' },
        { title: 'Resi Di Kirim Ke Penulis', role: 'ADMIN' },
    ]
    await createProtocol('Prosedur Penerbitan Buku (KBM)', 'Standard Operating Procedure KBM (Original)', itemsData1)

    // Protocol 2: Satuan Penerbit Terpadu KBM - NEW
    const itemsData2 = [
        { title: 'Tanggal naskah masuk', role: 'ADMIN' },
        { title: 'Tanggal DP', role: 'STAFF' },
        { title: 'REQUEST PENULIS', role: 'ADMIN' },
        { title: 'PERUBAHAN / TAMBAHAN REQUEST PENULIS', role: 'ADMIN' },
        { title: 'Naskah dibagi Ke Kordinator Layout', role: 'STAFF' },
        { title: 'Layout Selesai', role: 'STAFF' },
        { title: 'Naskah dibagi Ke Kordinator Cover', role: 'STAFF' },
        { title: 'Cover Selesai', role: 'STAFF' },
        { title: 'Surat Keaslian diterima dari Penulis', role: 'ADMIN' },
        { title: 'ISBN/QRCBN/QRSBN', role: 'STAFF' },
        { title: 'Pengajuan ISBN/QRCBN/QRSBN', role: 'STAFF' },
        { title: 'Keluarnya ISBN/QRCBN/QRSBN', role: 'STAFF' },
        { title: 'HAKI diajukan admin', role: 'STAFF' },
        { title: 'Nomor HAKI keluar', role: 'STAFF' },
        { title: 'Naskah di ACC Cetak Oleh Penulis', role: 'STAFF' },
        { title: 'Alamat Kirim Buku Cetakan', role: 'ADMIN' },
        { title: 'Tanggal Pelunasan', role: 'STAFF' },
        { title: 'NAIK CETAK', role: 'STAFF' },
        { title: 'JotForm dibagi', role: 'ADMIN' }, // Corrected Typo
        { title: 'Testimoni dibagi', role: 'ADMIN' },
        { title: 'Sertifikat dibagi', role: 'ADMIN' },
        { title: 'Upload Playbook', role: 'ADMIN' },
        { title: 'Link Playbook di Kirim ke Penulis', role: 'ADMIN' },
        { title: 'Upload Shopee', role: 'ADMIN' },
        { title: 'Link Shopee di Kirim ke Penulis', role: 'ADMIN' },
        { title: 'Upload OMP', role: 'ADMIN' },
        { title: 'Link OMP di Kirim ke Penulis', role: 'ADMIN' },
        { title: 'Resi Di Kirim Ke Marketing', role: 'STAFF' },
        { title: 'Resi Di Kirim Ke Penerbit', role: 'ADMIN' },
    ]
    await createProtocol('Satuan Penerbit Terpadu KBM', 'Satuan Penerbit Terpadu KBM Workflow', itemsData2)

    console.log('🚀 Seed finished successfully!')
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
