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

    // 2. Project creation removed as requested
    // const project = await prisma.project.create({ ... });

    // 3. Seed KBM Data (Protocol Only)
    await seedKBMData(organizationId, userId);
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

    // 2. Dependencies logic removed as requested
    // const items = protocolKBM.items;
    // const findId = (t: string) => items.find(i => i.title === t)?.id;

    // const connect = async (c: string, p: string) => {
    //     const cId = findId(c); const pId = findId(p);
    //     if (cId && pId) await prisma.protocolDependency.create({ data: { itemId: cId, prerequisiteId: pId } });
    // }

    // ... (dependency calls removed)

    console.log('✅ KBM Protocol seeded for tenant (Protocol Only, No Dependencies)');
    return protocolKBM;
}
