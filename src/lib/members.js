export const divisions = [
  { key: 'steering', name: 'Steering Committee', description: 'Pimpinan dan pengarah program', bannerClass: 'bg-gradient-to-r from-primary-300 to-primary-500' },
  { key: 'komunikasi', name: 'Divisi Komunikasi', description: 'Konten, humas, dan publikasi', bannerClass: 'bg-gradient-to-r from-green-200 to-green-400' },
  { key: 'pendidikan', name: 'Divisi Pendidikan', description: 'Program edukasi dan mentoring', bannerClass: 'bg-gradient-to-r from-yellow-200 to-yellow-400' },
  { key: 'lingkungan', name: 'Divisi Lingkungan Hidup', description: 'Aksi lingkungan dan sustainability', bannerClass: 'bg-gradient-to-r from-emerald-200 to-emerald-400' },
  { key: 'wirausaha', name: 'Divisi Kewirausahaan', description: 'Dukungan kewirausahaan dan bisnis', bannerClass: 'bg-gradient-to-r from-rose-200 to-rose-400' },
  { key: 'kesehatan', name: 'Divisi Kesehatan Masyarakat', description: 'Program kesehatan komunitas', bannerClass: 'bg-gradient-to-r from-sky-200 to-sky-400' },
];

export const sampleMembers = {
  steering: [
    {
      name: 'Asep Suryadi',
      jabatan: 'Ketua Steering',
      badgeText: 'Steering',
      major: 'Manajemen',
      faculty: 'FEB',
      socials: [
        { type: 'instagram', url: 'https://instagram.com/asep' },
        { type: 'email', url: 'mailto:asep@example.com' },
        { type: 'linkedin', url: 'https://linkedin.com/in/asep' },
      ],
      division: 'Steering Committee',
      cohort: 2022,
      motivasi: 'Mengembangkan organisasi',
      cerita: 'Aktif sejak 2020',
    },
    {
      name: 'Maya Putri',
      jabatan: 'Sekretaris',
      badgeText: 'Steering',
      major: 'Ekonomi',
      faculty: 'FEB',
      socials: [
        { type: 'instagram', url: 'https://instagram.com/maya' },
        { type: 'email', url: 'mailto:maya@example.com' },
      ],
      division: 'Steering Committee',
      cohort: 2023,
      motivasi: 'Mendukung program',
      cerita: 'Berpengalaman dalam administrasi',
    },
  ],
  komunikasi: [
    {
      name: 'Rizky H',
      jabatan: 'Koordinator',
      badgeText: 'Komunikasi',
      socials: [
        { type: 'instagram', url: 'https://instagram.com/rizky' },
        { type: 'email', url: 'mailto:rizky@example.com' },
      ],
      division: 'Divisi Komunikasi',
      cohort: 2021,
      motivasi: 'Meningkatkan reach',
      cerita: 'Pengalaman media sosial',
    },
    {
      name: 'Intan N',
      jabatan: 'Anggota',
      badgeText: 'Komunikasi',
      socials: [
        { type: 'instagram', url: 'https://instagram.com/intan' },
        { type: 'email', url: 'mailto:intan@example.com' },
      ],
      division: 'Divisi Komunikasi',
      cohort: 2022,
      motivasi: 'Belajar desain',
      cerita: 'Aktif dalam konten kreatif',
    },
  ],
  pendidikan: [
    {
      name: 'Budi Santoso',
      jabatan: 'Koordinator',
      badgeText: 'Pendidikan',
      socials: [
        { type: 'instagram', url: 'https://instagram.com/budi' },
        { type: 'email', url: 'mailto:budi@example.com' },
      ],
      division: 'Divisi Pendidikan',
      cohort: 2020,
      motivasi: 'Berbagi ilmu',
      cerita: 'Terlibat di program mentoring',
    },
  ],
  lingkungan: [
    {
      name: 'Citra Lestari',
      jabatan: 'Koordinator',
      badgeText: 'Lingkungan',
      socials: [
        { type: 'instagram', url: 'https://instagram.com/citra' },
        { type: 'email', url: 'mailto:citra@example.com' },
      ],
      division: 'Divisi Lingkungan Hidup',
      cohort: 2021,
      motivasi: 'Peduli lingkungan',
      cerita: 'Mengorganisir kegiatan bersih-bersih',
    },
  ],
  wirausaha: [
    {
      name: 'Dewi Kartika',
      jabatan: 'Koordinator',
      badgeText: 'Kewirausahaan',
      socials: [
        { type: 'instagram', url: 'https://instagram.com/dewi' },
        { type: 'email', url: 'mailto:dewi@example.com' },
      ],
      division: 'Divisi Kewirausahaan',
      cohort: 2022,
      motivasi: 'Mendukung start-up',
      cerita: 'Memiliki pengalaman bisnis kecil',
    },
  ],
  kesehatan: [
    {
      name: 'Eko Prasetyo',
      jabatan: 'Koordinator',
      badgeText: 'Kesehatan',
      socials: [
        { type: 'instagram', url: 'https://instagram.com/eko' },
        { type: 'email', url: 'mailto:eko@example.com' },
      ],
      division: 'Divisi Kesehatan Masyarakat',
      cohort: 2020,
      motivasi: 'Promosi kesehatan',
      cerita: 'Terlibat di program kesehatan kampus',
    },
  ],
};

export default { divisions, sampleMembers };
