# **PANDUAN ALUR KERJA & SIMULASI OPERASIONAL**

## **Smart Protocol Engine (v3.0)**

| Meta Data | Detail |
| :---- | :---- |
| **Tujuan** | Memberikan panduan langkah-demi-langkah penggunaan sistem berbasis *Item-Dependency*. |
| **Audience** | Project Manager, Admin, Staff Produksi, Keuangan. |

### **1\. Konsep Mental (Mindset)**

Sebelum masuk ke teknis, pahami dulu aturan mainnya:

1. **Jangan cari Timeline Panjang.** Anda tidak akan melihat jadwal kaku.  
2. **Cari "Gembok".** Jika tombol Anda abu-abu (mati), berarti ada teman di divisi lain yang belum selesai.  
3. **Tugas Anda \= Item Anda.** Fokus selesaikan apa yang ada di daftar "Tugas Saya".

### **2\. Aktor yang Terlibat**

1. **The Orchestrator (PM/Admin):** Yang mengatur lagu, membagi tugas, dan menyuntikkan tugas dadakan.  
2. **The Executor (Staff/Mitra):** Yang mengerjakan tugas spesifik (Desain, Layout, Cetak).  
3. **The Gatekeeper (Keuangan/Legal):** Yang memegang kunci gembok (DP, Pelunasan, Kontrak).

### **3\. Alur Utama (The Happy Flow)**

Berikut adalah perjalanan satu proyek dari lahir sampai selesai.

#### **Tahap 1: Setup Proyek (Oleh Admin/PM)**

1. **Create Project:** Admin input judul buku, klien, dan deadline target.  
2. **Load Protocol:** Admin memilih template *"Paket SPT Full"*.  
   * *Sistem:* Otomatis memuntahkan 20 butir tugas (Items) ke dashboard proyek.  
3. **Mapping/Assignment:** Admin menetapkan siapa mengerjakan apa.  
   * Item "Keuangan" \-\> Assign ke Grup Finance.  
   * Item "Layout" \-\> Assign ke Budi.  
   * Item "Cover" \-\> Assign ke Siti.

#### **Tahap 2: Eksekusi Paralel (Oleh Tim)**

* **Tim Legal** mulai mengurus ISBN (Karena tidak punya syarat gembok).  
* **Tim Desain** *ingin* upload cover, tapi tombolnya **TERGEMBOK**.  
  * *Info Gembok:* "Menunggu Konfirmasi DP".  
* **Tim Finance** klik "Konfirmasi DP" \-\> **DONE**.  
  * *Sistem:* Gembok Tim Desain terbuka otomatis. Notifikasi masuk ke HP Siti: *"DP Lunas. Silakan upload cover."*

#### **Tahap 3: Penyelesaian & Kontrol**

* Semua item selesai satu per satu.  
* Item terakhir "Kirim Buku" terbuka kuncinya setelah Item "Pelunasan" & "QC Cetak" selesai.  
* Project dinyatakan **Complete**.

### **4\. Simulasi Skenario (Studi Kasus)**

Berikut adalah simulasi kejadian nyata di lapangan untuk memperjelas fleksibilitas sistem.

#### **Skenario A: "Suntikan Tugas Dadakan" (Ad-Hoc Injection)**

*Kasus: Di tengah proses layout, Penulis minta ada halaman khusus ucapan terima kasih (yang tidak ada di paket standar).*

1. **Situasi:** Item "Layout Naskah" sedang dikerjakan Budi (Status: *In Progress*).  
2. **Aksi PM:**  
   * Masuk ke Project Dashboard.  
   * Klik **(+) Add Item**.  
   * Nama: *"Layout Halaman Ucapan"*.  
   * Assign: Budi.  
   * **Set Dependency:** Item ini harus selesai SEBELUM Item *"Finalisasi PDF"*.  
3. **Hasil:**  
   * Item *"Finalisasi PDF"* otomatis **TERGEMBOK** kembali, meskipun Budi sudah siap finalisasi.  
   * Budi harus menyelesaikan *"Layout Halaman Ucapan"* dulu, baru gembok finalisasi terbuka.  
   * *Manfaat:* Mencegah Budi lupa memasukkan halaman tambahan tersebut.

#### **Skenario B: "Kerja Balapan" (Paralelisme)**

*Kasus: Mengejar tayang. Layout dan Cover dikerjakan bersamaan.*

1. **Situasi:** DP sudah lunas.  
2. **Dashboard Budi (Layouter):**  
   * Melihat Item *"Layout Isi"*. Status: **OPEN**.  
   * Budi mulai kerja.  
3. **Dashboard Siti (Cover Designer):**  
   * Melihat Item *"Desain Cover"*. Status: **OPEN**.  
   * Siti mulai kerja.  
4. **Sistem:**  
   * Kedua progress bar berjalan beriringan.  
   * Item *"Gabung File PDF"* (milik Admin Produksi) tetap **TERGEMBOK**.  
   * Syarat Gembok *"Gabung File PDF"*: Item Budi DONE **AND** Item Siti DONE.  
5. **Hasil:** Admin Produksi tidak perlu tanya-tanya "Mana yang belum?". Dia cukup tunggu gemboknya terbuka sendiri.

#### **Skenario C: "Vendor Luar" (External Assignment)**

*Kasus: Menggunakan jasa Proofreader lepas (Freelance).*

1. **Aksi PM:**  
   * Pada Item *"Proofreading"*, PM klik Assign \-\> Masukkan Email Freelancer.  
2. **Sisi Freelancer:**  
   * Freelancer login (atau buka link khusus).  
   * Dia **HANYA** melihat satu kotak: *"Tugas: Proofreading Naskah A"*.  
   * Dia tidak melihat nilai kontrak, data klien, atau item tugas orang lain.  
3. **Hasil:** Keamanan data terjaga, tapi kolaborasi tetap jalan.

### **5\. Visualisasi Dashboard (UI Mockup Description)**

Bayangkan layar komputer Anda terbagi menjadi dua area utama.

#### **A. Tampilan Admin (Control Tower)**

Sebuah kanvas besar berisi kartu-kartu tugas.

* **Warna Kartu:**  
  * ⬜ **Putih:** Belum mulai (Tergembok).  
  * 🟦 **Biru:** Sedang jalan (*Open*).  
  * 🟩 **Hijau:** Selesai.  
  * 🟨 **Kuning:** Ada masalah/Telat.  
* **Garis Penghubung:** Ada garis tipis yang menghubungkan satu kartu ke kartu lain (menunjukkan *dependency*). Jika Kartu A belum hijau, Kartu B pasti masih ada ikon 🔒.

#### **B. Tampilan Staff (My Daily List)**

Sederhana, seperti daftar belanja.

* **Judul:** "Halo Budi, ini tugasmu hari ini."  
  1. \[Project Novel A\] Layout Bab 1 (Deadline: Hari Ini) 🟦  
  2. \[Project Buku Ajar\] Revisi Typo (Deadline: Besok) ⬜  
* **Tombol Aksi:** Di sebelah kanan setiap list ada tombol *"Upload File"* atau *"Mark as Done"*.

### **6\. Kesimpulan Flow**

Sistem ini mengubah peran manajer dari **"Polisi Tidur"** (yang harus cek manual setiap langkah) menjadi **"Montir Mesin"** (yang hanya perlu memastikan mesin dependency berjalan, dan memperbaiki jika ada macet).

Setiap orang hanya melihat apa yang perlu mereka kerjakan, dan sistem menjaga agar urutan kerja tidak dilanggar.