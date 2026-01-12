
export const PROJECT_FORM_FIELDS = [
    {
        key: 'sender',
        label: 'Pengirim Naskah',
        type: 'text',
        placeholder: 'Nama Pengirim',
        required: true
    },
    {
        key: 'author',
        label: 'Nama Penulis',
        type: 'text',
        placeholder: 'Nama Penulis',
        required: true
    },
    {
        key: 'bookTitle',
        label: 'Judul Buku',
        type: 'text',
        placeholder: 'Judul Buku',
        required: true
    },
    {
        key: 'packageStatus',
        label: 'Status Paket',
        type: 'select',
        options: ['Cetak Only', 'Layout', 'Desain Cover', 'All In'],
        required: true
    },
    {
        key: 'copies',
        label: 'Jumlah Eksemplar',
        type: 'number',
        placeholder: '100',
        required: true
    }
];
