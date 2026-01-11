# **PRODUCT REQUIREMENTS DOCUMENT (PRD)**

## **Sistem Manajemen Produksi: Smart Protocol Engine**

| Meta Data | Detail |
| :---- | :---- |
| **Versi Dokumen** | 1.0 |
| **Status** | Draft Final |
| **Objektif Utama** | Membangun platform manajemen alur kerja yang berbasis *item-dependency* (bukan timeline linear) untuk mengakomodasi dinamika produksi penerbitan yang tinggi. |

### **1\. Latar Belakang & Masalah**

Sistem manajemen proyek konvensional menggunakan pendekatan *linear waterfall* (Langkah 1 \-\> 2 \-\> 3\) yang kaku. Dalam industri penerbitan yang dinamis, pendekatan ini gagal menangani:

* Pekerjaan paralel antar divisi.  
* Revisi atau tugas tambahan dadakan (*Ad-hoc injection*).  
* Perbedaan perlakuan untuk setiap judul buku.

### **2\. Solusi: The Smart Protocol System**

Sistem baru ini akan mengadopsi struktur data berbasis graf/jaringan (*Network Dependency*). Timeline tidak ditentukan secara manual, melainkan terbentuk otomatis dari penyelesaian item tugas (*atomic tasks*).

### **3\. Profil Pengguna (User Personas)**

1. **Admin / Project Manager (The Orchestrator)**  
   * Membuat template protokol.  
   * Melakukan *injection* tugas dadakan.  
   * Memantau *critical path* (hambatan proyek).  
2. **Staff / Contributor (The Executor)**  
   * Hanya peduli pada "Apa tugas saya hari ini?".  
   * Melakukan update status item (Done/Upload).  
3. **Client / Mitra (The Viewer)**  
   * Melihat progres secara transparan (jika diberi akses).

### **4\. Spesifikasi Fitur Utama (Functional Requirements)**

#### **4.1. Manajemen Protokol (The Blueprint)**

* **Protocol Builder:** Admin dapat membuat template daftar tugas (checklist).  
* **Dependency Setting:** Admin dapat mengatur prasyarat.  
  * *Contoh:* Item "Cetak" *depends on* Item "Lunas" AND Item "ACC Cover".

#### **4.2. Manajemen Project (The Canvas)**

* **Load Protocol:** Saat membuat project baru, Admin memilih protokol (misal: "Paket Full") \-\> Sistem meng-generate item-item ke dalam project.  
* **Ad-Hoc Injection:** Admin dapat menambahkan item tugas baru di tengah project yang sedang berjalan tanpa merusak item lain.  
* **Graph/Gantt View:** Visualisasi hubungan antar item dan estimasi waktu selesai.

#### **4.3. Penugasan (Assignment System)**

* **Item-Level Assignment:** Penugasan dilakukan per butir tugas, bukan per project.  
* **Group Assignment:** Tugas bisa di-assign ke User Individu atau Grup Divisi.  
* **Dynamic Access:** User hanya bisa mengedit item di mana dia ditugaskan.

#### **4.4. Rule Engine (The Lock)**

* **Auto-Locking:** Item yang prasyaratnya belum terpenuhi harus berstatus LOCKED (Disabled).  
* **Auto-Unlock:** Saat prasyarat terpenuhi (misal: Pembayaran dikonfirmasi), item selanjutnya otomatis berubah status menjadi OPEN dan mengirim notifikasi ke penanggung jawab.

#### **4.5. Dashboard Personal (My Tasks)**

* Mengagregasi semua item dari berbagai project yang ditugaskan ke user yang sedang login.  
* Filter: *Overdue* (Telat), *Today*, *Upcoming*.

### **5\. Alur Data (Data Flow)**

1. **Inisiasi:** Admin Create Project \-\> Load Protocol "Standard".  
2. **Operasional:**  
   * Staff A menyelesaikan Item 1 (Upload File).  
   * Sistem cek *Dependencies*.  
   * Item 2 (Review) terbuka gemboknya.  
3. **Interupsi:**  
   * Admin inject Item Baru "Revisi Tambahan" di antara Item 1 dan 2\.  
   * Item 2 kembali terkunci sampai "Revisi Tambahan" selesai.

### **6\. Kebutuhan Non-Fungsional**

* **Real-time Update:** Perubahan status oleh satu user harus terlihat detik itu juga oleh user lain tanpa refresh halaman (menggunakan WebSockets).  
* **Audit Trail:** Setiap perubahan (siapa mengubah apa, kapan) harus tercatat dalam Log Aktivitas.  
* **Performance:** Dashboard harus memuat \< 2 detik meskipun ada ratusan item aktif.

### **7\. Kriteria Sukses (MVP)**

1. Admin bisa membuat project dengan template.  
2. Sistem gembok (dependency) berfungsi 100% akurat.  
3. Admin bisa menambahkan tugas dadakan di tengah jalan.  
4. Staff bisa melihat daftar tugas harian mereka sendiri.