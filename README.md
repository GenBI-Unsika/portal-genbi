# Portal GenBI Unsika (Internal Member Area)

Portal khusus untuk anggota aktif GenBI Unsika. Digunakan untuk manajemen profil, absensi, pengajuan surat, dan melihat informasi internal.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Backend (`genbi-server`) wajib berjalan.

### Installation

1.  **Clone & Install Dependencies**
    ```bash
    cd portal-genbi-unsika
    npm install
    ```

2.  **Environment Variables**
    Buat file `.env.local`:
    ```env
    VITE_API_BASE_URL=http://localhost:4000/api/v1
    VITE_GOOGLE_CLIENT_ID=your_google_client_id
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Akses di `http://localhost:5175`.

## 🛠️ Tech Stack

-   **Framework**: React
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS
-   **Routing**: React Router v6
-   **Auth**: Google OAuth + JWT Backend

## 📂 Folder Structure

```
portal-genbi-unsika/
├── public/              # Static assets
├── src/
│   ├── components/      # UI components (Layout, Cards, Modals)
│   ├── contexts/        # AuthContext, NotificationContext
│   ├── hooks/           # Custom hooks (useAuth, useFetch)
│   ├── lib/             # Utility libraries
│   ├── modules/         #  Fitur modular
│   ├── pages/           # Halaman (Dashboard Member, Profile)
│   ├── shell/           # App shell layout
│   ├── App.jsx          # Root component
│   └── main.jsx         # Entry point
├── .env.local           # Environment variables
└── vite.config.js       # Vite configuration
```

## 🔄 Application Flow

1.  **Login Wajib**:
    -   Seluruh halaman (kecuali login) diproteksi oleh `ProtectedRoute`.
    -   Redirect ke `/login` jika tidak ada token valid.

2.  **User Dashboard**:
    -   Menampilkan ringkasan poin keaktifan, status kas, dan notifikasi terbaru.
    -   Data diambil realtime dari endpoint `/api/v1/me`.

3.  **Self-Service Features**:
    -   Update profil mandiri.
    -   Upload berkas laporan.
    -   Pengajuan surat dispensasi.

## 🗺️ File Tour

-   **`src/shell/BaseLayout.jsx`**:
    -   Layout utama portal member (Sidebar/Navbar + Content).

-   **`src/pages/Dashboard.jsx`**:
    -   Halaman beranda member.

-   **`src/hooks/useAuth.js`**:
    -   Hook untuk mengakses data user yang sedang login.

## 📚 Documentation

Dokumentasi lengkap project ini ada di folder `../Documentation/`.
