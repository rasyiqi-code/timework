# Technical Overview

Dokumen ini menyediakan gambaran teknis mengenai arsitektur, database, dan alur autentikasi pada project `timework-monorepo`.

## 1. Arsitektur Project

Project ini menggunakan arsitektur **Monorepo** yang dikelola dengan **TurboRepo** dan **PNPM Workspaces**.

### Struktur Direktori
-   **`apps/web`**: Aplikasi frontend utama berbasis **Next.js 16 (App Router)**.
-   **`packages/database`**: Layer database menggunakan **Prisma ORM** + PostgreSQL.
-   **`packages/project-service`**: (Shared Business Logic/Services - *Work in Progress*).
-   **`packages/typescript-config`**: Konfigurasi TypeScript terpusat.

### Technology Stack
-   **Langauge**: TypeScript
-   **Frontend**: React 19, Next.js 16, Tailwind CSS v4.
-   **Backend/DB**: Prisma ORM, PostgreSQL.
-   **Auth**: Stack Auth (`@stackframe/stack`).
-   **Other**: `pnpm` untuk package management, `turbo` untuk build system.

## 2. Database & Data Model

Database dirancang dengan prinsip **Multi-tenancy** di mana data dipisahkan berdasarkan `Organization`.

### Core Entities
1.  **Organization**
    -   Entitas utama tenant.
    -   Hampir semua data krusial (`Project`, `Protocol`, `User Membership`) berelasi ke Organization.
2.  **User (`packages/database/schema.prisma`)**
    -   Menyimpan data user yang disinkronisasi dari Auth Provider.
    -   Relasi `OrganizationMember` menentukan role user (`ADMIN`, `STAFF`) dalam spesifik Organization.
3.  **Project (The Canvas)**
    -   Unit kerja utama.
    -   Memiliki status (`ACTIVE`, `COMPLETED`, `ARCHIVED`).
    -   Terdiri dari banyak `ProjectItem` (Task).
4.  **Protocol (Template)**
    -   Template atau SOP untuk project.
    -   Berisi `ProtocolItem` yang bisa di-copy menjadi `ProjectItem` saat project dibuat.
5.  **Items & Dependencies**
    -   `ProjectItem`: Task aktual dengan start/end date dan status.
    -   `ItemDependency`: Mengatur ketergantungan antar task (Recursive relationship/Adjacency List).

## 3. Authentication & RBAC

Autentikasi dihandle secara hybrid antara **Stack Auth** (managed service) dan database lokal.

### Autentikasi Flow
1.  **Login**: User login melalui Stack Auth UI.
2.  **Session**: Stack Auth mengelola session dan token.
3.  **Sinkronisasi (`apps/web/src/actions/auth.ts`)**:
    -   Saat user mengakses aplikasi, fungsi `getCurrentUser` dipanggil.
    -   Cek apakah user Stack Auth sudah ada di table `User` database lokal.
    -   Jika belum atau ada perubahan data, lakukan **Sync** (Create/Update user di DB lokal).
    -   Sync juga mencakup role dan membership organization.

### Role-Based Access Control (RBAC)
-   **System Roles**: `SUPER_ADMIN`, `ADMIN`, `STAFF`.
-   **Permissions**:
    -   Disimpan di level `OrganizationMember`.
    -   Frontend mengecek role statis atau menggunakan helper `canAction` (perlu verifikasi implementasi lebih lanjut di frontend).

## 4. Key Workflows

### Project Creation
Saat Project dibuat:
1.  User memilih `Organization` context.
2.  (Opsional) User memilih `Protocol` sebagai template.
3.  Sistem meng-clone `ProtocolItem` menjadi `ProjectItem` awal untuk Project tersebut.

### Task Management
-   Task memiliki status lifecycle: `LOCKED` -> `OPEN` -> `IN_PROGRESS` -> `DONE`.
-   Status bisa otomatis berubah berdasarkan `ItemDependency` (misal: Task B terbuka jika Task A selesai) - *Logic ini perlu dipastikan ada di service layer*.
