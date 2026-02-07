# Portal GenBI Unsika

Portal internal untuk anggota GenBI Unsika.

## Quick Start

```bash
npm install
npm run dev
```

Berjalan di `http://localhost:5175`

## Environment

Buat `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Routes

| Route               | Halaman               |
| ------------------- | --------------------- |
| `/`                 | Home Dashboard        |
| `/kalender`         | Kalender Kegiatan     |
| `/profile`          | Profile Member        |
| `/settings`         | Pengaturan            |
| `/peringkat`        | Leaderboard Poin      |
| `/rekapitulasi-kas` | Rekap Kas (View Only) |
| `/dispensasi`       | Pengajuan Dispensasi  |
| `/divisi/:id`       | Detail Divisi         |
| `/login`            | Login                 |

## Build

```bash
npm run build
```

Output: `dist/`

## Dokumentasi

Lihat `../Documentation/` untuk dokumentasi lengkap.
