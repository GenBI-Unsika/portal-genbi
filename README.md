# 🦅 Portal GenBI UNSIKA (Internal Member Area)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg?logo=react)
![Vite](https://img.shields.io/badge/vite-5.4.8-646cff.svg?logo=vite)
![TailwindCSS v4](https://img.shields.io/badge/tailwindcss-v4-38b2ac.svg?logo=tailwind-css)

## 📖 Introduction / Description

**Portal GenBI UNSIKA** didesain sebagai ekosistem digital internal (Intranet) bagi para penerima beasiswa Bank Indonesia wilayah UNSIKA. Modul ini menjadi jembatan antara anggota dan pengurus dalam mengatur birokrasi, agenda, keuangan (kas), dan profil pribadi.

Portal ini menekankan privasi penuh—semua rute dilindungi. Pengguna diharuskan login menggunakan akun Google yang emailnya telah didaftarkan ke sistem sebelumnya.

## 🎯 Key Features

- **Personalized Member Dashboard**: Ringkasan profil, jumlah absensi poin keaktifan, dan notifikasi terbaru.
- **Internal Calendar & Scheduling**: Kalender interaktif untuk sinkronisasi jadwal kegiatan divisi maupun pleno.
- **Financial Status (Kas/Treasury)**: Pemeriksaan status iuran kas bulanan secara transparan oleh masing-masing anggota.
- **Document & Dispensation Request**: Form otomatis untuk pengajuan surat dispensasi kuliah atau administrasi organisasi.
- **Reporting & Export**: Fitur ringan untuk mengunduh laporan diri ke dalam format PDF.

## 🛠️ Tech Stack & Ekosistem

Modul ini dibangun agar efisien namun tetap tajam. Amunisi yang terpasang di sini berbeda versinya dari klien publik:

- **Core Framework**: React (`^18.3.1`) & React DOM
- **Build Tool**: Vite (`^5.4.8`)
- **Styling Core**: **Tailwind CSS v4** (`^4.0.0`) via eksplisit plugin Vite. *(Bukan v3!)*
- **Routing**: React Router DOM (`^6.26.2`) a.k.a v6. *(Perhatikan perbedaannya dengan router v7 di modul lain)*
- **Authentication**: React OAuth Google (`^0.13.4`)
- **Data Table**: React Data Table Component (`^7.5.0`) - *Untuk grid data fungsional tanpa pusing.*
- **Calendar Engine**: React Big Calendar (`^1.11.3`) - *Mesin utama fitur jadwal.*
- **Data Visualization**: Recharts (`^2.12.7`) - *Grafik keaktifan/keuangan pribadi.*
- **PDF Exporting**: `jspdf` (`^4.0.0`) & `jspdf-autotable`
- **Utility**: `date-fns` (`^3.6.0`) - *Manipulasi format tanggal kalender.*
- **Iconography**: Lucide React (`^0.471.0`)
- **Typography (Fonts)**: `@fontsource-variable/inter`
- **Testing**: Vitest (`^3.2.4`), Testing Library (`jest-dom`, `react`, `user-event`) dengan JSDOM environment.

## ⚙️ Prerequisites

Syarat mutlak sebelum Anda bisa menyentuh UI Portal Internal ini:

- **Node.js**: Minimal versi LTS (18+).
- **Backend `genbi-server`**: WAJIB nyala dan running di port terpisah (default 3500) agar ada data yang bisa ditarik.
- **Email Terdaftar**: Autentikasi akan menolak masuk email Google yang tidak tercatat di database server.

## 🚀 Installation & Starter

Instalasi standar prajurit:

1. **Clone dan Masuk ke Direktori**
   ```bash
   cd project-fullstack/genbiunsika/portal-genbi-unsika
   ```

2. **Pasang Amunisi**
   Tunggu dengan sabar sampai NPM selesai.
   ```bash
   npm install
   ```

3. **Setel Variabel Lingkungan**
   Kopi paste rahasia ke file lokal:
   ```bash
   cp .env.example .env.local
   ```
   Lalu isi `VITE_GOOGLE_CLIENT_ID` dengan kunci dari Google Cloud Anda.

4. **Nyalakan Mesin Development**
   ```bash
   npm run dev
   ```
   Akses basecamp di `http://localhost:5175`.

## 🔐 Environment Variables

Portal ini hanya butuh dua kunci penting:

```env
# Arahkan Vite Proxy ke Backend (Server utama)
VITE_API_BASE_URL=/api/v1

# Kredensial Google OAuth Provider
VITE_GOOGLE_CLIENT_ID=1015424406938-so5oeb8hicss9kad02s8i9kf20adhkvm.apps.googleusercontent.com
```

## 📂 Folder Structure

Peta pangkalan Portal Internal:

```text
portal-genbi-unsika/
├── public/              # Aset gambar terbuka
├── src/
│   ├── components/      # UI Element pecah-pecah (Button, Card, Modals umum)
│   ├── contexts/        # React Provider (Auth, Theme/Notification state container)
│   ├── hooks/           # Hook mandiri seperti `useAuth.js`, `useFetch.js`
│   ├── lib/             # Kumpulan library setup (contoh: Axios interceptor)
│   ├── modules/         # Fungsionalitas spesifik per fitur (Kalender, Surat)
│   ├── pages/           # Kumpulan rute Utama (Home, Profile, Kas)
│   ├── shell/           # Base Layout & Wrapper untuk Navigasi Portal
│   ├── App.jsx          # Titik masuk Routing v6
│   ├── main.jsx         # Pemasangan ke DOM
│   ├── index.css        # Masukkin `@import "tailwindcss";` untuk v4
├── .env.example         # Template Env
├── eslint.config.js     # Aturan disiplin koding (Linter)
├── package.json         # Rangkuman dependencies
└── vite.config.js       # Setting dev server & proxy
```

## 💻 Usage / Examples

Implementasi di Portal member ini mengandalkan _Protected Routes_ dan Custom Hooks:

**1. Proteksi Halaman (Memaksa Login)**
```jsx
// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Checking security clearance...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />; // Lolos pengecekan, render halaman
};
```

**2. Calendar Interaktif (`react-big-calendar` dengan `date-fns`)**
```jsx
// src/modules/calendar/AgendaView.jsx
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const AgendaView = ({ events }) => (
  <Calendar
    localizer={localizer}
    events={events}
    startAccessor="start"
    endAccessor="end"
    style={{ height: 500 }}
  />
);
```

## 🔌 API Documentation (Frontend Perspective)

Portal member menembak endpoint yang terproteksi oleh JWT Bearer Token (lewat Cookie HTTP-only atau Header Authorization).

- `POST /api/v1/auth/google` : Verifikasi identitas. Jika DITOLAK backend, tampilkan Toast error (Bukan Member).
- `GET /api/v1/me` : Narik data penuh dari pengguna yang sedang login.
- `GET /api/v1/activities/internal` : Ambil data agenda private.
- `GET /api/v1/treasury/my-status` : Ambil tagihan/status kas khusus User tersebut.

## 📜 Commands (CLI)

Gunakan perintah ini tanpa banyak tanya:

| Command | Fungsi |
| :--- | :--- |
| `npm run dev` | Menghidupkan mode pengembangan Vite Server. |
| `npm run build` | Render ke bundel statis untuk dilempar ke Production (`/dist`). |
| `npm run preview`| Tes lokal hasil production build. |
| `npm run test` | Pasukan Vitest mengecek kode secara fungsional. |
| `npm run test:watch`| Menyalakan Vitest secara interaktif. |
| `npm run test:coverage`| Cetak laporan persentase kode tersentuh test. |

## 🧪 Testing

Sistem internal butuh keamanan ganda. 
```bash
npm run test
```
Tes menggunakan `jsdom` pada Vitest. Jangan sampai fungsi kalkulasi Poin Keaktifan di komponen melenceng, atau Anda dipecat!

## 🚑 Troubleshooting

**1. CSS Berantakan Total/Styling Hilang:**
- **Solusi**: Vite memuat Tailwind **v4**. Pastikan di `index.css` hanya ada perintah deklaratif standar v4 (`@import "tailwindcss";`), bukan sintaks v3 (`@tailwind base;`). Jika error cache, hapus folder `node_modules/.vite`.

**2. Routing React Router v6 Nge-Crash (Blank):**
- **Solusi**: Beda dengan client, di sini menggunakan `react-router-dom@6`. Pastikan penulisan struktur komponen memakai `<Routes>` dan `<Route>` standard v6 (bukan flat router config v7 kecuali sudah dimigrasi sepenuhnya).

**3. Error Kalender (Localizer):**
- **Solusi**: `react-big-calendar` sensitif dengan import `date-fns`. Pastikan Anda me-mapping fungsi `format`, `parse`, `startOfWeek` ke `dateFnsLocalizer` dengan presisi!

## 🤝 Contribution

Aturan Internal:
1. Tidak ada modifikasi kode _Core Auth_ tanpa persetujuan Tech Lead.
2. Pakai `feature/xxx` branch saat develop.
3. Semua form pengajuan internal HARUS memiliki status loading dan feedback Toast (hijau/merah) saat data diproses.
4. Jangan hardcode data pribadi!! Semua data harus asinkronus ke Backend.

## 🕒 Changelog / Version Control

- **v1.0.0** - Init Internal Portal.
- *(Tahap Pengembangan Aktif)*

## ✒️ Author & Credits

- **Developer / Maintainer**: KSP divisi IT GenBI UNSK.
- **Tech Lead**: Rangga Mukti
- **Credits**: React Big Calendar untuk mengatasi kebingungan jadwal, Vite untuk kecepatan kilat.

---
*"Jika pintu depan dijaga preman, pintu dalam dijaga anjing pelacak. Jangan tinggalkan celah keamanan di Portal Member!"*
