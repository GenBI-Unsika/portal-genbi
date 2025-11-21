import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { getMe, setMe } from "../utils/auth.js";
import { useToast } from "../components/Toast.jsx";

const TABS = [
  { key: "akun", label: "Data Akun" },
  { key: "rekening", label: "Rekening" },
  { key: "akademik", label: "Akademik" },
  { key: "perpointan", label: "Perpointan" },
  { key: "uangkas", label: "Uang Kas" },
];

export default function Profile() {
  const toast = useToast();
  const [tab, setTab] = useState("akun");
  const [me, setLocalMe] = useState(() => getMe());

  const copyToClipboard = async (text, label = "teks") => {
    try {
      await navigator.clipboard.writeText(String(text));
      toast.push(`${label} disalin ke clipboard`, "success");
    } catch (err) {
      toast.push(`Gagal menyalin ${label}`, "error");
    }
  };

  const formatCurrency = (v) => {
    try {
      const n = Number(v || 0);
      return `Rp ${n.toLocaleString()}`;
    } catch (e) {
      return `Rp ${v}`;
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleDateString();
    } catch (e) {
      return iso;
    }
  };

  const saveAkun = (e) => {
    e.preventDefault();
    setMe(me);
    toast.push("Profil diperbarui", "success");
  };

  const Section = useMemo(() => {
    if (tab === "akun")
      return (
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          onSubmit={saveAkun}
        >
          <label className="block">
            <span className="label">Nama</span>
            <input
              className="input mt-2"
              value={me.name || ""}
              onChange={(e) => setLocalMe({ ...me, name: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="label">Email</span>
            <input
              className="input mt-2"
              type="email"
              value={me.email || ""}
              onChange={(e) => setLocalMe({ ...me, email: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="label">No. HP</span>
            <input
              className="input mt-2"
              value={me.phone || ""}
              onChange={(e) => setLocalMe({ ...me, phone: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="label">Fakultas</span>
            <input
              className="input mt-2"
              value={me.faculty || ""}
              onChange={(e) => setLocalMe({ ...me, faculty: e.target.value })}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="label">Program Studi</span>
            <input
              className="input mt-2"
              value={me.study || ""}
              onChange={(e) => setLocalMe({ ...me, study: e.target.value })}
            />
          </label>
          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <button
              type="reset"
              className="btn btn-quiet cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              Simpan
            </button>
          </div>
        </form>
      );

    if (tab === "rekening")
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Info label="Nama Bank" value="Bank Indonesia (contoh)" />
          <div className="rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] p-4 flex items-center justify-between hover:shadow-md transition-shadow duration-300">
            <div>
              <div className="text-xs text-neutral-600">No. Rekening</div>
              <div className="mt-1 font-semibold text-neutral-900">
                1234 5678 9012
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                className="btn btn-quiet cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
                onClick={() =>
                  copyToClipboard("1234 5678 9012", "No. Rekening")
                }
              >
                Salin
              </button>
            </div>
          </div>
          <Info label="Atas Nama" value={me.name || "-"} />
        </div>
      );

    if (tab === "akademik")
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] p-4 flex items-center justify-between hover:shadow-md transition-shadow duration-300">
            <div>
              <div className="text-xs text-neutral-600">NPM</div>
              <div className="mt-1 font-semibold text-neutral-900">
                2010631250000
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                className="btn btn-quiet cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
                onClick={() => copyToClipboard("2010631250000", "NPM")}
              >
                Salin
              </button>
            </div>
          </div>
          <Info label="Semester" value="7" />
          <Info label="IPK Terakhir" value="3.85" />
          <Info label="Status" value="Aktif" />
        </div>
      );

    if (tab === "perpointan") {
      const activities = (
        me.activities || [
          {
            date: "2025-11-15",
            name: "Webinar GenBI",
            type: "online",
            points: 12,
          },
          {
            date: "2025-11-10",
            name: "GENBI Mengajar",
            type: "offline",
            points: 10,
          },
          {
            date: "2025-11-05",
            name: "Raker Triwulan",
            type: "offline",
            points: 12,
          },
        ]
      ).slice();
      const totalPoints = activities.reduce((s, a) => s + (a.points || 0), 0);
      const onlineCount = activities.filter((a) => a.type === "online").length;
      const offlineCount = activities.filter(
        (a) => a.type === "offline"
      ).length;

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] p-4 hover:shadow-md transition-shadow duration-300">
              <div className="text-xs text-neutral-600">Total Poin</div>
              <div className="mt-1 text-2xl font-semibold text-primary-700">
                {totalPoints} pts
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] p-4 hover:shadow-md transition-shadow duration-300">
              <div className="text-xs text-neutral-600">Kegiatan Online</div>
              <div className="mt-1 text-2xl font-semibold text-blue-600">
                {onlineCount}
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] p-4 hover:shadow-md transition-shadow duration-300">
              <div className="text-xs text-neutral-600">Kegiatan Offline</div>
              <div className="mt-1 text-2xl font-semibold text-green-600">
                {offlineCount}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] p-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold">Riwayat Kegiatan</div>
              <div className="text-xs text-neutral-600">
                Terakhir diperbarui:{" "}
                {me.pointsUpdated || activities[0]?.date || "-"}
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {activities.map((act, i) => (
                <div
                  key={i}
                  className="p-4 bg-neutral-50 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="font-semibold text-base text-neutral-900 flex-1">
                      {act.name}
                    </div>
                    <div className="font-bold text-lg text-primary-600 whitespace-nowrap flex items-center">
                      +{act.points} pts
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{act.date}</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full font-medium ${
                        act.type === "online"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {act.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (tab === "uangkas") {
      const transactions = (
        me.transactions || [
          { date: "2025-10-01", amount: -10000, desc: "Iuran Bulanan Oktober" },
          {
            date: "2025-09-01",
            amount: -10000,
            desc: "Iuran Bulanan September",
          },
          { date: "2025-08-01", amount: -10000, desc: "Iuran Bulanan Agustus" },
        ]
      ).slice();

      const totalPaid = Math.abs(
        transactions
          .filter((t) => t.amount < 0)
          .reduce((s, t) => s + t.amount, 0)
      );
      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 1);
      nextDue.setDate(1);

      const generateInvoice = () => {
        const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Laporan Transaksi Kas</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .info { margin-bottom: 30px; }
    .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: bold; }
    .amount-negative { color: #dc2626; }
    .amount-positive { color: #16a34a; }
    .summary { margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>LAPORAN TRANSAKSI KAS</h1>
    <p>Periode: 1 Januari 2025 - ${formatDate(new Date())}</p>
  </div>
  
  <div class="info">
    <div class="info-row"><strong>Nama:</strong> ${me.name || "-"}</div>
    <div class="info-row"><strong>NPM:</strong> 2010631250000</div>
    <div class="info-row"><strong>Email:</strong> ${me.email || "-"}</div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Tanggal</th>
        <th>Deskripsi</th>
        <th style="text-align: right;">Jumlah</th>
      </tr>
    </thead>
    <tbody>
      ${transactions
        .map(
          (t) => `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td>${t.desc}</td>
          <td style="text-align: right;" class="${
            t.amount < 0 ? "amount-negative" : "amount-positive"
          }">
            ${t.amount < 0 ? "-" : "+"}${formatCurrency(Math.abs(t.amount))}
          </td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
  
  <div class="summary">
    <div class="info-row"><strong>Total Dibayar:</strong> ${formatCurrency(
      totalPaid
    )}</div>
    <div class="info-row"><strong>Iuran Bulanan:</strong> Rp 10.000</div>
  </div>
  
  <div class="footer">
    <p>Dokumen ini digenerate otomatis pada ${formatDate(new Date())}</p>
    <p>GenBI - Generasi Baru Indonesia</p>
  </div>
</body>
</html>`;

        const blob = new Blob([invoiceHTML], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Laporan-Kas-${me.name || "GenBI"}-${
          new Date().toISOString().split("T")[0]
        }.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.push("Laporan berhasil diunduh", "success");
      };

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] p-4 hover:shadow-md transition-shadow duration-300">
              <div className="text-xs text-neutral-600">
                Total Sudah Dibayar
              </div>
              <div className="mt-1 text-2xl font-semibold text-green-700">
                {formatCurrency(totalPaid)}
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] p-4 hover:shadow-md transition-shadow duration-300">
              <div className="text-xs text-neutral-600">Iuran Bulanan</div>
              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                Rp 10.000
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] p-4 hover:shadow-md transition-shadow duration-300">
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors duration-200">
              <div className="text-sm font-semibold text-amber-900">
                🔔 Reminder Tagihan
              </div>
              <div className="mt-1 text-xs text-amber-700">
                Tagihan Bulan Berikutnya: <strong>Rp 10.000</strong>
              </div>
              <div className="text-xs text-amber-600 mt-0.5">
                Jatuh Tempo: {formatDate(nextDue)}
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">Riwayat Transaksi</div>
                <button
                  className="btn btn-quiet text-xs cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
                  onClick={generateInvoice}
                >
                  📥 Download Laporan
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {transactions.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 hover:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-900">
                        {t.desc}
                      </div>
                      <div className="text-xs text-neutral-600 mt-0.5">
                        {formatDate(t.date)}
                      </div>
                    </div>
                    <div
                      className={`font-semibold text-sm ${
                        t.amount < 0 ? "text-red-600" : "text-green-700"
                      }`}
                    >
                      {t.amount < 0 ? "-" : "+"}
                      {formatCurrency(Math.abs(t.amount)).replace("Rp ", "")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }, [tab, me, toast]);

  return (
    <div className="space-y-4">
      <h1>Profile</h1>
      <div className="card">
        <div className="border-b border-neutral-200 px-4 md:px-6">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-3.5 text-sm font-semibold focus-ring cursor-pointer transition-all duration-200
                  ${
                    tab === t.key
                      ? "text-primary-700 border-b-2 border-primary-600"
                      : "text-neutral-600 hover:text-primary-600 hover:bg-neutral-50"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">{Section}</div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] p-4 hover:shadow-md transition-shadow duration-300">
      <div className="text-xs text-neutral-600">{label}</div>
      <div className="mt-1 font-semibold text-neutral-900">{value}</div>
    </div>
  );
}
