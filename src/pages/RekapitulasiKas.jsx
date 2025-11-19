import React from "react";
import DataTable from "react-data-table-component";

const columns = [
  { name: "No", selector: (row) => row.no, width: "60px" },
  { name: "Nama", selector: (row) => row.nama, sortable: true },
  { name: "Jabatan", selector: (row) => row.jabatan },
  { name: "Jan", selector: (row) => row.jan, right: true },
  { name: "Feb", selector: (row) => row.feb, right: true },
  { name: "Mar", selector: (row) => row.mar, right: true },
  { name: "Apr", selector: (row) => row.apr, right: true },
  { name: "Mei", selector: (row) => row.mei, right: true },
  { name: "Jun", selector: (row) => row.jun, right: true },
  { name: "Jul", selector: (row) => row.jul, right: true },
  { name: "Agu", selector: (row) => row.agu, right: true },
  { name: "Sep", selector: (row) => row.sep, right: true },
  { name: "Okt", selector: (row) => row.okt, right: true },
  { name: "Nov", selector: (row) => row.nov, right: true },
  { name: "Des", selector: (row) => row.des, right: true },
  {
    name: "Jumlah",
    selector: (row) =>
      [
        row.jan,
        row.feb,
        row.mar,
        row.apr,
        row.mei,
        row.jun,
        row.jul,
        row.agu,
        row.sep,
        row.okt,
        row.nov,
        row.des,
      ].reduce((a, b) => a + b, 0),
    sortable: true,
    right: true,
  },
];

// sample data (periode 2024-2025)
const data = [
  {
    id: 1,
    no: 1,
    nama: "Rangga Mukti",
    jabatan: "Ketua",
    jan: 50000,
    feb: 50000,
    mar: 50000,
    mar: 50000,
    apr: 50000,
    mei: 50000,
    jun: 50000,
    jul: 50000,
    agu: 50000,
    sep: 50000,
    okt: 50000,
    nov: 50000,
    des: 50000,
  },
  {
    id: 2,
    no: 2,
    nama: "Siti Nurhaliza",
    jabatan: "Bendahara",
    jan: 50000,
    feb: 0,
    mar: 50000,
    apr: 50000,
    mei: 0,
    jun: 50000,
    jul: 50000,
    agu: 50000,
    sep: 0,
    okt: 50000,
    nov: 50000,
    des: 50000,
  },
];

export default function RekapitulasiKas() {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">
          UANG KAS GENBI UNSIKA PERIODE 2024-2025
        </h2>
        <div className="bg-white rounded-2xl p-4 border">
          <DataTable
            columns={columns}
            data={data}
            defaultSortFieldId={1}
            pagination
            dense
            persistTableHead
          />
        </div>
      </div>
    </div>
  );
}
