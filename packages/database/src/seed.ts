
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // ==========================================
    // 1. CLEAR EXISTING DATA (Optional - mostly for dev)
    // ==========================================
    // await prisma.itemDependency.deleteMany({})
    // await prisma.projectItem.deleteMany({})
    // await prisma.project.deleteMany({})
    // await prisma.protocolDependency.deleteMany({})
    // await prisma.protocolItem.deleteMany({})
    // await prisma.protocol.deleteMany({})
    // await prisma.user.deleteMany({}) 
    // Commented out to avoid accidental data loss, uncomment if needed for full reset.

    // ==========================================
    // 2. UPSERT ORGANIZATION (Tenant)
    // ==========================================
    const demoOrg = await prisma.organization.upsert({
        where: { id: 'org_demo123' },
        update: {},
        create: {
            id: 'org_demo123',
            name: 'SPT Publishing (Demo)',
            slug: 'spt-demo'
        }
    })
    console.log('✅ Organization seeded:', demoOrg.name)

    // ==========================================
    // 3. UPSERT USERS (Actors)
    // ==========================================
    const upsertUser = async (email: string, name: string, role: string) => {
        return await prisma.user.upsert({
            where: { email },
            update: { role, organizationId: demoOrg.id },
            create: { email, name, role, organizationId: demoOrg.id },
        })
    }

    // THE ONLY REAL ADMIN
    const superAdmin = await upsertUser('super@spt.com', 'Super Administrator', 'ADMIN')

    // STAFF (Even if their job title says "Admin", in the system they are STAFF)
    const adminMarketing = await upsertUser('marketing@spt.com', 'Staff Marketing (KBM)', 'STAFF')
    const adminNonKBM = await upsertUser('marketing_umum@spt.com', 'Staff Marketing (Non-KBM)', 'STAFF')
    const adminKeuangan = await upsertUser('keuangan@spt.com', 'Staff Keuangan', 'STAFF')
    const adminPerijinan = await upsertUser('legal@spt.com', 'Staff Perijinan', 'STAFF')
    const adminCetak = await upsertUser('produksi@spt.com', 'Staff Cetak', 'STAFF')

    const layouter = await upsertUser('budi@spt.com', 'Budi (Layouter)', 'STAFF')
    const desainer = await upsertUser('dany@spt.com', 'Dany (Desainer)', 'STAFF')
    const penulis = await upsertUser('dosen@abc.ac.id', 'Dr. Client (Penulis)', 'STAFF')

    console.log('✅ Users seeded')

    // ==========================================
    // 3b. CREATE KBM ORGANIZATION (Real World Scenario)
    // ==========================================
    const kbmOrg = await prisma.organization.upsert({
        where: { id: 'org_kbm_real' },
        update: {},
        create: {
            id: 'org_kbm_real',
            name: 'PT. Karya Bakti Makmur (KBM)',
            slug: 'kbm-publisher'
        }
    })

    // KBM ROLES
    const kbmUser = async (email: string, name: string, role: string) => {
        return await prisma.user.upsert({
            where: { email },
            update: { role, organizationId: kbmOrg.id },
            create: { email, name, role, organizationId: kbmOrg.id },
        })
    }

    // Actors based on KBM SOP
    const kbmMarketing = await kbmUser('marketing@kbm.com', 'Admin Marketing KBM', 'ADMIN')
    const kbmMarketingNon = await kbmUser('marketing_non@kbm.com', 'Admin Marketing Luar KBM', 'ADMIN')
    const kbmKeuangan = await kbmUser('keuangan@kbm.com', 'Admin Keuangan', 'STAFF')
    const kbmPerijinan = await kbmUser('perijinan@kbm.com', 'Admin Perijinan', 'STAFF')
    const kbmCetak = await kbmUser('cetak@kbm.com', 'Admin Cetak', 'STAFF')
    const kbmKordinator = await kbmUser('kordinator@kbm.com', 'Kordinator Layout', 'STAFF')
    const kbmLayouter = await kbmUser('layouter@kbm.com', 'Layouter', 'STAFF')
    const kbmDesainer = await kbmUser('desainer@kbm.com', 'Mbak Dany (Cover)', 'STAFF')

    // ==========================================
    // 4. CREATE PROTOCOLS (Templates)
    // ==========================================

    // --- KBM WORKFLOW (SOP Lengkap) ---
    // Mapping 27 Data Points to Process
    const protocolKBM = await prisma.protocol.create({
        data: {
            name: 'Prosedur Penerbitan Buku (SOP KBM)',
            description: 'Alur lengkap dari naskah masuk hingga pengiriman buku jadi.',
            organizationId: kbmOrg.id,
            items: {
                create: [
                    // PHASE 1: PRA-PRODUKSI (Marketing & Keuangan)
                    { title: 'Input Data Naskah', description: 'Marketing input data (Penulis, Judul, Eksemplar, Spesifikasi). Data Points 1-7, 23-24.', role: 'ADMIN', defaultAssigneeId: kbmMarketing.id },
                    { title: 'Pembayaran DP', description: 'Keuangan validasi transfer DP. (Point 8)', role: 'STAFF', defaultAssigneeId: kbmKeuangan.id },

                    // PHASE 2: PRODUKSI (Kreatif)
                    { title: 'Serah Terima Naskah ke Kordinator', description: 'Marketing kirim naskah fix. (Point 10)', role: 'ADMIN', defaultAssigneeId: kbmMarketing.id },
                    { title: 'Distribusikan ke Tim', description: 'Kordinator membagi tugas ke Layouter & Desainer.', role: 'STAFF', defaultAssigneeId: kbmKordinator.id },
                    { title: 'Proses Layout', description: 'Layouter mengerjakan tata letak.', role: 'STAFF', defaultAssigneeId: kbmLayouter.id },
                    { title: 'Proses Desain Cover', description: 'Desainer mengerjakan alternatif cover. (Point 11)', role: 'STAFF', defaultAssigneeId: kbmDesainer.id },
                    { title: 'Revisi & Finalisasi', description: 'Revisi berdasarkan feedback penulis. (Point 12-13)', role: 'STAFF', defaultAssigneeId: kbmLayouter.id },

                    // PHASE 3: LEGALITAS (Paralel)
                    { title: 'Verifikasi Form Keaslian', description: 'Cek surat keaslian yg dikirim penulis. (Point 14)', role: 'ADMIN', defaultAssigneeId: kbmMarketing.id },
                    { title: 'Finalisasi Data Legalitas', description: 'Cek perubahan judul/penulis sblm submit. (Point 15)', role: 'STAFF', defaultAssigneeId: kbmPerijinan.id },
                    { title: 'Pengajuan ISBN & HAKI', description: 'Submit ke Perpusnas & DJKI. (Point 16, 18)', role: 'STAFF', defaultAssigneeId: kbmPerijinan.id },
                    { title: 'Input Nomor ISBN & HAKI', description: 'Input nomor yang sudah terbit. (Point 17, 19)', role: 'STAFF', defaultAssigneeId: kbmPerijinan.id },

                    // PHASE 4: CETAK (Produksi)
                    { title: 'ACC Final Print', description: 'Cek file PDF siap cetak. (Point 25)', role: 'STAFF', defaultAssigneeId: kbmCetak.id },
                    { title: 'Pelunasan Biaya', description: 'Keuangan validasi pelunasan sblm cetak/kirim. (Point 9)', role: 'STAFF', defaultAssigneeId: kbmKeuangan.id },
                    { title: 'Proses Naik Cetak', description: 'Cetak fisik buku. (Point 26)', role: 'STAFF', defaultAssigneeId: kbmCetak.id },

                    // PHASE 5: PASCA-PRODUKSI
                    { title: 'Pengiriman & Resi', description: 'Kirim buku ke alamat & input resi. (Point 24, 27)', role: 'STAFF', defaultAssigneeId: kbmCetak.id },
                    { title: 'Kirim Sertifikat & Link', description: 'Kirim sertifikat, link jualan, testimoni. (Point 20-22)', role: 'STAFF', defaultAssigneeId: kbmKeuangan.id },
                ]
            }
        }
    })

    // Create Dependencies for KBM Workflow
    const itemsKBM = await prisma.protocolItem.findMany({ where: { protocolId: protocolKBM.id } })
    const findKBM = (t: string) => itemsKBM.find(i => i.title === t)?.id
    const connectKBM = async (c: string, p: string) => {
        const cId = findKBM(c); const pId = findKBM(p);
        if (cId && pId) await prisma.protocolDependency.create({ data: { itemId: cId, prerequisiteId: pId } })
    }

    // Linear dependencies for main flow
    await connectKBM('Pembayaran DP', 'Input Data Naskah')
    await connectKBM('Serah Terima Naskah ke Kordinator', 'Pembayaran DP')
    await connectKBM('Distribusikan ke Tim', 'Serah Terima Naskah ke Kordinator')

    // Fork: Layout & Cover run parallel
    await connectKBM('Proses Layout', 'Distribusikan ke Tim')
    await connectKBM('Proses Desain Cover', 'Distribusikan ke Tim')

    // Merge: Revisi needs both draft
    await connectKBM('Revisi & Finalisasi', 'Proses Layout')
    await connectKBM('Revisi & Finalisasi', 'Proses Desain Cover')

    // Legalitas branch (Parallel with Creative, but starts after DP)
    await connectKBM('Verifikasi Form Keaslian', 'Pembayaran DP')
    await connectKBM('Finalisasi Data Legalitas', 'Verifikasi Form Keaslian')
    await connectKBM('Pengajuan ISBN & HAKI', 'Finalisasi Data Legalitas')
    await connectKBM('Input Nomor ISBN & HAKI', 'Pengajuan ISBN & HAKI')

    // Production needs Creative Final & ISBN
    await connectKBM('ACC Final Print', 'Revisi & Finalisasi')
    await connectKBM('ACC Final Print', 'Input Nomor ISBN & HAKI')

    await connectKBM('Pelunasan Biaya', 'ACC Final Print')
    await connectKBM('Proses Naik Cetak', 'Pelunasan Biaya')

    await connectKBM('Pengiriman & Resi', 'Proses Naik Cetak')
    await connectKBM('Kirim Sertifikat & Link', 'Pengiriman & Resi')

    console.log('✅ KBM Protocol created')


    // --- SCENARIO 2: Layanan Satuan ---
    const protocolSatuan = await prisma.protocol.create({
        data: {
            name: 'Layanan Satuan (Fast Track)',
            description: 'Layanan cetak cepat tanpa proses legalitas/kreatif (Print Only).',
            organizationId: demoOrg.id,
            items: {
                create: [
                    { title: 'Input Order Satuan', description: 'Marketing input detail order cetak.', role: 'ADMIN', defaultAssigneeId: adminNonKBM.id },
                    { title: 'Upload File Siap Cetak', description: 'Upload PDF cover dan isi yang sudah ready.', role: 'ADMIN', defaultAssigneeId: adminNonKBM.id },
                    { title: 'Konfirmasi Lunas', description: 'Keuangan konfirmasi pembayaran (Full Payment).', role: 'ADMIN', defaultAssigneeId: adminKeuangan.id },
                    { title: 'Naik Cetak & Resi', description: 'Langsung proses cetak dan kirim.', role: 'ADMIN', defaultAssigneeId: adminCetak.id },
                ]
            }
        }
    })

    // Dependencies for Satuan
    const satuanItems = await prisma.protocolItem.findMany({ where: { protocolId: protocolSatuan.id } })
    const findSat = (t: string) => satuanItems.find(i => i.title === t)?.id

    const connectSat = async (child: string, parent: string) => {
        const cId = findSat(child); const pId = findSat(parent);
        if (cId && pId) await prisma.protocolDependency.create({ data: { itemId: cId, prerequisiteId: pId } })
    }

    await connectSat('Upload File Siap Cetak', 'Input Order Satuan')
    await connectSat('Konfirmasi Lunas', 'Upload File Siap Cetak')
    await connectSat('Naik Cetak & Resi', 'Konfirmasi Lunas')

    console.log('✅ Protocol Satuan created')

    // ==========================================
    // 5. INSTANTIATE PROJECTS (Demo Data)
    // ==========================================

    // --- PROJECT 1: "Jurnal Medis" (Skenario 1 - In Progress) ---
    // Status: Dapur Kreatif (Layout & Cover sedang berjalan)
    const project1 = await prisma.project.create({
        data: {
            title: 'Jurnal Medis Vol. 1',
            description: 'Pesanan Universitas ABC - 500 Eksplar. Hardcover.',
            createdById: adminMarketing.id,
            category: 'SPT',
            status: 'ACTIVE',
            organizationId: demoOrg.id,
        }
    })

    // Manually cloning items (Simplified version of createProjectFromProtocol logic)
    // We need to recreate the dependencies on the instance level. 
    // For the sake of this seed, I'll rely on the "Create Project" action logic logic logic...
    // BUT I can't call server actions here. I must duplicate the logic or just create raw records.
    // I will create raw records to match the "In Progress" state described.

    const p1_item1 = await prisma.projectItem.create({ data: { projectId: project1.id, title: 'Input Data Pesanan', status: 'DONE', assignedToId: adminMarketing.id } })
    const p1_item2 = await prisma.projectItem.create({ data: { projectId: project1.id, title: 'Verifikasi Dokumen Keaslian', status: 'DONE', assignedToId: penulis.id } })
    const p1_item3 = await prisma.projectItem.create({ data: { projectId: project1.id, title: 'Konfirmasi Pembayaran DP', status: 'DONE', assignedToId: adminKeuangan.id } })
    const p1_item4 = await prisma.projectItem.create({ data: { projectId: project1.id, title: 'Assign Tim Kreatif', status: 'DONE', assignedToId: adminMarketing.id } })

    // Active/In Progress Items
    const p1_item5 = await prisma.projectItem.create({ data: { projectId: project1.id, title: 'Proses Layout Naskah', status: 'IN_PROGRESS', description: 'Sedang setting bab 3...', assignedToId: layouter.id } })
    const p1_item6 = await prisma.projectItem.create({ data: { projectId: project1.id, title: 'Proses Desain Cover', status: 'OPEN', assignedToId: desainer.id } })
    const p1_item_isbn_req = await prisma.projectItem.create({ data: { projectId: project1.id, title: 'Pengajuan ISBN', status: 'OPEN', assignedToId: adminPerijinan.id } })

    // Future/Locked Items
    const p1_item7 = await prisma.projectItem.create({ data: { projectId: project1.id, title: 'Revisi & Finalisasi Naskah', status: 'LOCKED', assignedToId: penulis.id } })
    const p1_item_isbn_in = await prisma.projectItem.create({ data: { projectId: project1.id, title: 'Input Nomor ISBN', status: 'LOCKED', assignedToId: adminPerijinan.id } })
    const p1_item8 = await prisma.projectItem.create({ data: { projectId: project1.id, title: 'ACC Cetak', status: 'LOCKED', assignedToId: adminCetak.id } })
    const p1_item9 = await prisma.projectItem.create({ data: { projectId: project1.id, title: 'Konfirmasi Pelunasan', status: 'LOCKED', assignedToId: adminKeuangan.id } })
    const p1_item10 = await prisma.projectItem.create({ data: { projectId: project1.id, title: 'Proses Naik Cetak & Resi', status: 'LOCKED', assignedToId: adminCetak.id } })

    // Connect Dependencies P1
    const connectP1 = async (cId: string, pId: string) => await prisma.itemDependency.create({ data: { itemId: cId, prerequisiteId: pId } })

    await connectP1(p1_item2.id, p1_item1.id)
    await connectP1(p1_item3.id, p1_item2.id)
    await connectP1(p1_item4.id, p1_item3.id)
    await connectP1(p1_item5.id, p1_item4.id)
    await connectP1(p1_item6.id, p1_item4.id)
    await connectP1(p1_item_isbn_req.id, p1_item4.id)

    await connectP1(p1_item7.id, p1_item5.id)
    await connectP1(p1_item7.id, p1_item6.id)
    await connectP1(p1_item_isbn_in.id, p1_item_isbn_req.id)

    await connectP1(p1_item8.id, p1_item7.id)
    await connectP1(p1_item8.id, p1_item_isbn_in.id)

    await connectP1(p1_item9.id, p1_item8.id)
    await connectP1(p1_item10.id, p1_item9.id)

    console.log('✅ Project "Jurnal Medis" created (In Progress)')


    // --- PROJECT 2: "Penerbit Maju Jaya" (Skenario 2 - Completed) ---
    // Status: COMPLETED
    const project2 = await prisma.project.create({
        data: {
            title: 'Chetak Buku Maju Jaya',
            description: 'Cetak Only 100pcs. Klien buru-buru.',
            createdById: adminNonKBM.id,
            category: 'SATUAN',
            status: 'COMPLETED',
            organizationId: demoOrg.id,
        }
    })

    const p2_1 = await prisma.projectItem.create({ data: { projectId: project2.id, title: 'Input Order Satuan', status: 'DONE', assignedToId: adminNonKBM.id } })
    const p2_2 = await prisma.projectItem.create({ data: { projectId: project2.id, title: 'Upload File Siap Cetak', status: 'DONE', assignedToId: adminNonKBM.id } })
    const p2_3 = await prisma.projectItem.create({ data: { projectId: project2.id, title: 'Konfirmasi Lunas', status: 'DONE', assignedToId: adminKeuangan.id } })
    const p2_4 = await prisma.projectItem.create({ data: { projectId: project2.id, title: 'Naik Cetak & Resi', status: 'DONE', description: 'Resi: JNE-00123456', assignedToId: adminCetak.id } })

    await connectP1(p2_2.id, p2_1.id) // reusing connectP1 function as it is generic
    await connectP1(p2_3.id, p2_2.id)
    await connectP1(p2_4.id, p2_3.id)

    console.log('✅ Project "Maju Jaya" created (Completed)')

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
