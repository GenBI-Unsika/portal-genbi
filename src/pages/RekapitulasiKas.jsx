"use client";

import React, { useState } from "react";
// Using a plain HTML table (Tailwind styled) instead of missing UI table components
import { ArrowUpDown, Search } from "lucide-react";

// Data shape:
// { id, no, nama, jabatan, oktober, november, desember, januari, februari, maret, april, mei, juni }
// Data dari PDF
const data = [
  {
    id: 1,
    no: 1,
    nama: "Mochamad Faishal Burhanudin",
    jabatan: "Ketua Umum",
    oktober: 0,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 2,
    no: 2,
    nama: "Nana Casmana Ade Wikarta",
    jabatan: "Wakil Ketua Umum",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 3,
    no: 3,
    nama: "Lydia Angelica Sitorus",
    jabatan: "Sekretaris Umum I",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 4,
    no: 4,
    nama: "Aira Nazua Artamevia",
    jabatan: "Sekretaris Umum II",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 5,
    no: 5,
    nama: "Rohmah Laelasari",
    jabatan: "Bendahara Umum I",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 6,
    no: 6,
    nama: "Ulya Sofiatunnisa",
    jabatan: "Bendahara Umum II",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 7,
    no: 7,
    nama: "Senia Nur Agista",
    jabatan: "Kepala Div. Kesehatan Masyarakat",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 8,
    no: 8,
    nama: "Rosita Elsa Monica",
    jabatan: "Sekretaris Div. Kesehatan Masyarakat",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 9,
    no: 9,
    nama: "Helmi Putra 'Izazi",
    jabatan: "Bendahara Div. Kesehatan Masyarakat",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 10,
    no: 10,
    nama: "Bimo Grimaldi Rahmat",
    jabatan: "Staff Div. Kesehatan Masyarakat",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 11,
    no: 11,
    nama: "Muhammad Naufal Nurhadi Hidayat",
    jabatan: "Staff Div. Kesehatan Masyarakat",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 12,
    no: 12,
    nama: "Alvianda Nurliawan",
    jabatan: "Staff Div. Kesehatan Masyarakat",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 13,
    no: 13,
    nama: "Fikriyyah Adilah",
    jabatan: "Staff Div. Kesehatan Masyarakat",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 14,
    no: 14,
    nama: "Kaila Rasha Ramadhani",
    jabatan: "Staff Div. Kesehatan Masyarakat",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 15,
    no: 15,
    nama: "Juan Yeheskiel Parhusip",
    jabatan: "Kepala Div. Kewirausahaan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 16,
    no: 16,
    nama: "Sri Ayu Lestari",
    jabatan: "Sekretaris Div. Kewirausahaan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 17,
    no: 17,
    nama: "Widiya Astuti",
    jabatan: "Bendahara Div. Kewirausahaan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 18,
    no: 18,
    nama: "Alisha Zahra Sa'adiya",
    jabatan: "Staff Div. Kewirausahaan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 19,
    no: 19,
    nama: "Eki Ramadhan",
    jabatan: "Staff Div. Kewirausahaan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 20,
    no: 20,
    nama: "Aqsha Atallah",
    jabatan: "Staff Div. Kewirausahaan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 21,
    no: 21,
    nama: "Aurel Sheryn Azzahra Sauala",
    jabatan: "Staff Div. Kewirausahaan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 22,
    no: 22,
    nama: "Sofia Nur Assyfa Sulaiman",
    jabatan: "Staff Div. Kewirausahaan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 23,
    no: 23,
    nama: "Asyifa Nursyabani",
    jabatan: "Staff Div. Kewirausahaan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 24,
    no: 24,
    nama: "Rangga Mukti Daniswara",
    jabatan: "Kepala Div. Komunikasi Informasi",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 25,
    no: 25,
    nama: "Juliana Widianti Dwi Putri",
    jabatan: "Sekretaris Div. Komunikasi Informasi",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 26,
    no: 26,
    nama: "Rizky Dwi Mardiani",
    jabatan: "Bendahara Div. Komunikasi Informasi",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 27,
    no: 27,
    nama: "Atifah Putri Danniyah",
    jabatan: "Staff Div. Komunikasi Informasi",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 28,
    no: 28,
    nama: "Esterina Permata Gracia",
    jabatan: "Staff Div. Komunikasi Informasi",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 29,
    no: 29,
    nama: "Muhammad Rizqi Fadhilah",
    jabatan: "Staff Div. Komunikasi Informasi",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 30,
    no: 30,
    nama: "Damar Anggaraditya Yusran Rabbani",
    jabatan: "Staff Div. Komunikasi Informasi",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 31,
    no: 31,
    nama: "Faryz Reynaldy",
    jabatan: "Staff Div. Komunikasi Informasi",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 32,
    no: 32,
    nama: "Gerald Dustin Albert",
    jabatan: "Staff Div. Komunikasi Informasi",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 33,
    no: 33,
    nama: "Hendra Asri Harahap",
    jabatan: "Staff Div. Komunikasi Informasi",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 34,
    no: 34,
    nama: "Milda Azkia",
    jabatan: "Kepala Div. Lingkungan Hidup",
    oktober: 0,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 35,
    no: 35,
    nama: "Zahroniswati",
    jabatan: "Sekretaris Div. Lingkungan Hidup",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 36,
    no: 36,
    nama: "Baiq Hana Anggela Putri",
    jabatan: "Bendahara Div. Lingkungan Hidup",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 37,
    no: 37,
    nama: "Raka Aghan Hafizd",
    jabatan: "Staff Div. Lingkungan Hidup",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 38,
    no: 38,
    nama: "Syifa Arifah Fauziah",
    jabatan: "Staff Div. Lingkungan Hidup",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 39,
    no: 39,
    nama: "Ervina Anandhita",
    jabatan: "Staff Div. Lingkungan Hidup",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 40,
    no: 40,
    nama: "Nur Alifah Khoirunissa",
    jabatan: "Staff Div. Lingkungan Hidup",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 41,
    no: 41,
    nama: "Rendy Pramudia",
    jabatan: "Staff Div. Lingkungan Hidup",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 42,
    no: 42,
    nama: "Shafira Nur Annisa",
    jabatan: "Kepala Div. Pendidikan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 43,
    no: 43,
    nama: "Resti Dwi Artika",
    jabatan: "Sekretaris Div. Pendidikan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 44,
    no: 44,
    nama: "Sukma Rahmawati",
    jabatan: "Bendahara Div. Pendidikan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 45,
    no: 45,
    nama: "Firly Nur Takbirani",
    jabatan: "Staff Div. Pendidikan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 46,
    no: 46,
    nama: "Septiyani Arlita",
    jabatan: "Staff Div. Pendidikan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 47,
    no: 47,
    nama: "Aryawuni Alfatoni Wijayanti",
    jabatan: "Staff Div. Pendidikan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 48,
    no: 48,
    nama: "Ernawati",
    jabatan: "Staff Div. Pendidikan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 49,
    no: 49,
    nama: "Muhamad Aksyal Faiz Destian",
    jabatan: "Staff Div. Pendidikan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
  {
    id: 50,
    no: 50,
    nama: "Yuke Dwi Maritza",
    jabatan: "Staff Div. Pendidikan",
    oktober: 10000,
    november: 10000,
    desember: 10000,
    januari: 10000,
    februari: 10000,
    maret: 10000,
    april: 10000,
    mei: 10000,
    juni: 10000,
  },
];

export default function RekapitulasiKas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const filteredData = data.filter(
    (row) =>
      row.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
  });

  const calculateTotal = (row) => {
    return (
      row.oktober +
      row.november +
      row.desember +
      row.januari +
      row.februari +
      row.maret +
      row.april +
      row.mei +
      row.juni
    );
  };

  const grandTotal = sortedData.reduce(
    (sum, row) => sum + calculateTotal(row),
    0
  );
  const monthlyTotals = {
    oktober: sortedData.reduce((sum, row) => sum + row.oktober, 0),
    november: sortedData.reduce((sum, row) => sum + row.november, 0),
    desember: sortedData.reduce((sum, row) => sum + row.desember, 0),
    januari: sortedData.reduce((sum, row) => sum + row.januari, 0),
    februari: sortedData.reduce((sum, row) => sum + row.februari, 0),
    maret: sortedData.reduce((sum, row) => sum + row.maret, 0),
    april: sortedData.reduce((sum, row) => sum + row.april, 0),
    mei: sortedData.reduce((sum, row) => sum + row.mei, 0),
    juni: sortedData.reduce((sum, row) => sum + row.juni, 0),
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          UANG KAS GENBI UNSIKA
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Periode 2024-2025
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau jabatan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md w-full"
        />
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 border-b-2 border-slate-200 dark:border-slate-600">
                <th className="w-12 text-center font-bold text-slate-900 dark:text-white py-3">
                  No
                </th>
                <th
                  className="font-bold text-slate-900 dark:text-white cursor-pointer hover:bg-blue-100 dark:hover:bg-slate-600 px-4 py-3 text-left"
                  onClick={() => handleSort("nama")}
                >
                  <div className="flex items-center gap-2">
                    Nama
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="font-bold text-slate-900 dark:text-white py-3">
                  Jabatan
                </th>
                <th className="text-center font-bold text-slate-900 dark:text-white text-sm py-3">
                  Okt
                </th>
                <th className="text-center font-bold text-slate-900 dark:text-white text-sm py-3">
                  Nov
                </th>
                <th className="text-center font-bold text-slate-900 dark:text-white text-sm py-3">
                  Des
                </th>
                <th className="text-center font-bold text-slate-900 dark:text-white text-sm py-3">
                  Jan
                </th>
                <th className="text-center font-bold text-slate-900 dark:text-white text-sm py-3">
                  Feb
                </th>
                <th className="text-center font-bold text-slate-900 dark:text-white text-sm py-3">
                  Mar
                </th>
                <th className="text-center font-bold text-slate-900 dark:text-white text-sm py-3">
                  Apr
                </th>
                <th className="text-center font-bold text-slate-900 dark:text-white text-sm py-3">
                  Mei
                </th>
                <th className="text-center font-bold text-slate-900 dark:text-white text-sm py-3">
                  Jun
                </th>
                <th className="text-right font-bold text-slate-900 dark:text-white text-sm py-3">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="text-center text-sm font-medium text-slate-600 dark:text-slate-400 py-2">
                    {row.no}
                  </td>
                  <td className="font-medium text-slate-900 dark:text-white py-2">
                    {row.nama}
                  </td>
                  <td className="text-sm text-slate-600 dark:text-slate-400 py-2">
                    {row.jabatan}
                  </td>
                  <td className="text-right text-sm text-slate-700 dark:text-slate-300 py-2">
                    {formatCurrency(row.oktober)}
                  </td>
                  <td className="text-right text-sm text-slate-700 dark:text-slate-300 py-2">
                    {formatCurrency(row.november)}
                  </td>
                  <td className="text-right text-sm text-slate-700 dark:text-slate-300 py-2">
                    {formatCurrency(row.desember)}
                  </td>
                  <td className="text-right text-sm text-slate-700 dark:text-slate-300 py-2">
                    {formatCurrency(row.januari)}
                  </td>
                  <td className="text-right text-sm text-slate-700 dark:text-slate-300 py-2">
                    {formatCurrency(row.februari)}
                  </td>
                  <td className="text-right text-sm text-slate-700 dark:text-slate-300 py-2">
                    {formatCurrency(row.maret)}
                  </td>
                  <td className="text-right text-sm text-slate-700 dark:text-slate-300 py-2">
                    {formatCurrency(row.april)}
                  </td>
                  <td className="text-right text-sm text-slate-700 dark:text-slate-300 py-2">
                    {formatCurrency(row.mei)}
                  </td>
                  <td className="text-right text-sm text-slate-700 dark:text-slate-300 py-2">
                    {formatCurrency(row.juni)}
                  </td>
                  <td className="text-right font-semibold text-slate-900 dark:text-white bg-blue-50 dark:bg-slate-700 py-2">
                    {formatCurrency(calculateTotal(row))}
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-slate-600 dark:to-slate-500 font-bold border-t-2 border-slate-300 dark:border-slate-600">
                <td
                  colSpan={3}
                  className="text-sm text-slate-900 dark:text-white font-bold py-2"
                >
                  JUMLAH TOTAL
                </td>
                <td className="text-right text-sm text-slate-900 dark:text-white py-2">
                  {formatCurrency(monthlyTotals.oktober)}
                </td>
                <td className="text-right text-sm text-slate-900 dark:text-white py-2">
                  {formatCurrency(monthlyTotals.november)}
                </td>
                <td className="text-right text-sm text-slate-900 dark:text-white py-2">
                  {formatCurrency(monthlyTotals.desember)}
                </td>
                <td className="text-right text-sm text-slate-900 dark:text-white py-2">
                  {formatCurrency(monthlyTotals.januari)}
                </td>
                <td className="text-right text-sm text-slate-900 dark:text-white py-2">
                  {formatCurrency(monthlyTotals.februari)}
                </td>
                <td className="text-right text-sm text-slate-900 dark:text-white py-2">
                  {formatCurrency(monthlyTotals.maret)}
                </td>
                <td className="text-right text-sm text-slate-900 dark:text-white py-2">
                  {formatCurrency(monthlyTotals.april)}
                </td>
                <td className="text-right text-sm text-slate-900 dark:text-white py-2">
                  {formatCurrency(monthlyTotals.mei)}
                </td>
                <td className="text-right text-sm text-slate-900 dark:text-white py-2">
                  {formatCurrency(monthlyTotals.juni)}
                </td>
                <td className="text-right text-lg text-slate-900 dark:text-white font-bold py-2">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <p className="text-sm font-medium opacity-90">Total Anggota</p>
          <p className="text-3xl font-bold mt-2">{sortedData.length}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
          <p className="text-sm font-medium opacity-90">Total Kas (9 Bulan)</p>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(grandTotal)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-6 text-white shadow-lg">
          <p className="text-sm font-medium opacity-90">
            Rata-rata per Anggota
          </p>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(grandTotal / sortedData.length)}
          </p>
        </div>
      </div>
    </div>
  );
}
