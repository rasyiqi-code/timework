import { prisma } from '@/lib/db';

export async function seedOrganizationData(organizationId: string, userId: string) {
    console.log(`Seeding data for Organization: ${organizationId}`);

    // 1. Create Default Protocol (SOP Template)
    const protocol = await prisma.protocol.create({
        data: {
            name: 'Standard Operating Procedure (SOP) Template',
            description: 'A default template for standardized workflows.',
            isDefault: true,
            organizationId,
            items: {
                create: [
                    { title: 'Step 1: Initiation', description: 'Define the scope and objectives.', duration: 1 },
                    { title: 'Step 2: Execution', description: 'Carry out the task according to guidelines.', duration: 2 },
                    { title: 'Step 3: Review', description: 'Verify the output meets quality standards.', duration: 1 },
                    { title: 'Step 4: Completion', description: 'Mark the task as complete and document findings.', duration: 1 },
                ]
            }
        }
    });

    console.log(`Created Protocol: ${protocol.id}`);

    // 2. Create Default Project (Welcome Project)
    const project = await prisma.project.create({
        data: {
            title: 'Welcome to Timework',
            description: 'This is your first project tailored to demonstrate the platform capabilities.',
            organizationId,
            status: 'ACTIVE',
            createdById: userId, // Ensure we link to creator
            items: {
                create: [
                    {
                        title: 'Explore Dashboard',
                        description: 'Navigate through the dashboard to see your project overview.',
                        status: 'DONE',
                        originProtocolItemId: null // Ad-hoc item
                    },
                    {
                        title: 'Review SOP Items',
                        description: 'Check how the protocol items above are instantiated.',
                        status: 'OPEN',
                        originProtocolItemId: null
                    }
                ]
            },
        }
    });

    console.log(`Created Project: ${project.id}`);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function seedKBMData(organizationId: string, _currentUserId: string) {
    console.log(`Seeding KBM Specific Data for Org: ${organizationId}`);

    // 1. Create KBM Protocol
    const protocolKBM = await prisma.protocol.create({
        data: {
            name: 'Prosedur Penerbitan Buku (SOP KBM)',
            description: 'Alur lengkap dari naskah masuk hingga pengiriman buku jadi (KBM Version).',
            organizationId,
            items: {
                create: [
                    // PHASE 1: PRA-PRODUKSI
                    { title: 'Input Data Naskah', description: 'Marketing input data (Penulis, Judul, Eksemplar, Spesifikasi). Data Points 1-7, 23-24.', role: 'ADMIN', duration: 1 },
                    { title: 'Pembayaran DP', description: 'Keuangan validasi transfer DP. (Point 8)', role: 'STAFF', duration: 1 },

                    // PHASE 2: PRODUKSI
                    { title: 'Serah Terima Naskah ke Kordinator', description: 'Marketing kirim naskah fix. (Point 10)', role: 'ADMIN', duration: 1 },
                    { title: 'Distribusikan ke Tim', description: 'Kordinator membagi tugas ke Layouter & Desainer.', role: 'STAFF', duration: 1 },
                    { title: 'Proses Layout', description: 'Layouter mengerjakan tata letak.', role: 'STAFF', duration: 5 },
                    { title: 'Proses Desain Cover', description: 'Desainer mengerjakan alternatif cover. (Point 11)', role: 'STAFF', duration: 3 },
                    { title: 'Revisi & Finalisasi', description: 'Revisi berdasarkan feedback penulis. (Point 12-13)', role: 'STAFF', duration: 2 },

                    // PHASE 3: LEGALITAS
                    { title: 'Verifikasi Form Keaslian', description: 'Cek surat keaslian yg dikirim penulis. (Point 14)', role: 'ADMIN', duration: 1 },
                    { title: 'Finalisasi Data Legalitas', description: 'Cek perubahan judul/penulis sblm submit. (Point 15)', role: 'STAFF', duration: 1 },
                    { title: 'Pengajuan ISBN & HAKI', description: 'Submit ke Perpusnas & DJKI. (Point 16, 18)', role: 'STAFF', duration: 2 },
                    { title: 'Input Nomor ISBN & HAKI', description: 'Input nomor yang sudah terbit. (Point 17, 19)', role: 'STAFF', duration: 1 },

                    // PHASE 4: CETAK
                    { title: 'ACC Final Print', description: 'Cek file PDF siap cetak. (Point 25)', role: 'STAFF', duration: 1 },
                    { title: 'Pelunasan Biaya', description: 'Keuangan validasi pelunasan sblm cetak/kirim. (Point 9)', role: 'STAFF', duration: 1 },
                    { title: 'Proses Naik Cetak', description: 'Cetak fisik buku. (Point 26)', role: 'STAFF', duration: 7 },

                    // PHASE 5: PASCA-PRODUKSI
                    { title: 'Pengiriman & Resi', description: 'Kirim buku ke alamat & input resi. (Point 24, 27)', role: 'STAFF', duration: 1 },
                    { title: 'Kirim Sertifikat & Link', description: 'Kirim sertifikat, link jualan, testimoni. (Point 20-22)', role: 'STAFF', duration: 1 },
                ]
            }
        },
        include: { items: true } // Need items to link dependencies
    });

    // 2. Create Dependencies
    const items = protocolKBM.items;
    const findId = (t: string) => items.find(i => i.title === t)?.id;

    const connect = async (c: string, p: string) => {
        const cId = findId(c); const pId = findId(p);
        if (cId && pId) await prisma.protocolDependency.create({ data: { itemId: cId, prerequisiteId: pId } });
    }

    // Linear dependencies for main flow
    await connect('Pembayaran DP', 'Input Data Naskah');
    await connect('Serah Terima Naskah ke Kordinator', 'Pembayaran DP');
    await connect('Distribusikan ke Tim', 'Serah Terima Naskah ke Kordinator');

    // Fork
    await connect('Proses Layout', 'Distribusikan ke Tim');
    await connect('Proses Desain Cover', 'Distribusikan ke Tim');

    // Merge
    await connect('Revisi & Finalisasi', 'Proses Layout');
    await connect('Revisi & Finalisasi', 'Proses Desain Cover');

    // Legalitas
    await connect('Verifikasi Form Keaslian', 'Pembayaran DP');
    await connect('Finalisasi Data Legalitas', 'Verifikasi Form Keaslian');
    await connect('Pengajuan ISBN & HAKI', 'Finalisasi Data Legalitas');
    await connect('Input Nomor ISBN & HAKI', 'Pengajuan ISBN & HAKI');

    // Production
    await connect('ACC Final Print', 'Revisi & Finalisasi');
    await connect('ACC Final Print', 'Input Nomor ISBN & HAKI');

    await connect('Pelunasan Biaya', 'ACC Final Print');
    await connect('Proses Naik Cetak', 'Pelunasan Biaya');

    await connect('Pengiriman & Resi', 'Proses Naik Cetak');
    await connect('Kirim Sertifikat & Link', 'Pengiriman & Resi');

    console.log('✅ KBM Protocol seeded for tenant (No Users)');
    return protocolKBM;
}
