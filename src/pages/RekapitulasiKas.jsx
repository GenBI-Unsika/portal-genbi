'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUpDown, Search, ChevronDown, ChevronUp, Users, TrendingUp, Wallet, RefreshCw, X } from 'lucide-react';
import { fetchTreasuryRecap } from '../utils/api.js';
import { useToast } from '../components/Toast.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

const months = [
  { key: 'oktober', label: 'Okt', full: 'Oktober' },
  { key: 'november', label: 'Nov', full: 'November' },
  { key: 'desember', label: 'Des', full: 'Desember' },
  { key: 'januari', label: 'Jan', full: 'Januari' },
  { key: 'februari', label: 'Feb', full: 'Februari' },
  { key: 'maret', label: 'Mar', full: 'Maret' },
  { key: 'april', label: 'Apr', full: 'April' },
  { key: 'mei', label: 'Mei', full: 'Mei' },
  { key: 'juni', label: 'Jun', full: 'Juni' },
];

export default function RekapitulasiKas() {
  const toast = useToast();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [isMobile, setIsMobile] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiData = await fetchTreasuryRecap();
      if (apiData && Array.isArray(apiData)) {
        setData(apiData);
        if (apiData.length === 0) {
          toast.push('Data rekapitulasi kas masih kosong', 'info');
        }
      } else {
        setData([]);
        toast.push('Format data tidak valid', 'warning');
      }
    } catch (err) {
      // Error fetching treasury data
      setError('Gagal memuat data rekapitulasi kas dari server');
      setData([]);
      toast.push('Gagal memuat data rekapitulasi kas', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredData = data.filter((row) => row.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || row.jabatan?.toLowerCase().includes(searchTerm.toLowerCase()));

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortOrder === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
  });

  const calculateTotal = (row) => {
    return months.reduce((sum, m) => sum + (row[m.key] || 0), 0);
  };

  const grandTotal = sortedData.reduce((sum, row) => sum + calculateTotal(row), 0);
  const monthlyTotals = months.reduce((acc, m) => {
    acc[m.key] = sortedData.reduce((sum, row) => sum + (row[m.key] || 0), 0);
    return acc;
  }, {});

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatCurrencyShort = (value) => {
    if (!value || value === 0) return 'Rp0';
    if (value >= 1000000) {
      return 'Rp' + (value / 1000000).toFixed(1) + 'jt';
    }
    if (value >= 1000) {
      return 'Rp' + (value / 1000).toFixed(0) + 'rb';
    }
    return 'Rp' + value.toString();
  };

  // Mobile Card Component
  const MobileCard = ({ row, index }) => {
    const isExpanded = expandedRow === row.id;
    const total = calculateTotal(row);
    const initials = (row.nama || 'XX')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');

    return (
      <div className={`bg-white rounded-xl border border-slate-200/80 p-3 shadow-soft-sm transition-all duration-300 active:scale-[0.98] card-enter stagger-${Math.min(index + 1, 8)}`}>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="bg-primary-100 text-primary-700 text-caption-sm font-bold px-1.5 py-0.5 rounded flex-shrink-0">#{row.no || index + 1}</span>
              <h3 className="font-semibold text-slate-900 text-body-sm truncate">{row.nama}</h3>
            </div>
            <p className="text-caption-sm text-slate-500 truncate">{row.jabatan}</p>
          </div>

          <button onClick={() => setExpandedRow(isExpanded ? null : row.id)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all flex-shrink-0">
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

        {/* Total - always visible with clear styling */}
        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100">
          <span className="text-caption-sm font-medium text-slate-500">Total Kas:</span>
          <span className="text-sm font-bold text-primary-600">{formatCurrency(total)}</span>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 animate-slide-fade">
            <div className="grid grid-cols-3 gap-2">
              {months.map((month) => (
                <div key={month.key} className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-caption-sm text-slate-500 mb-0.5">{month.label}</div>
                  <div className="text-xs font-semibold text-slate-800">{formatCurrencyShort(row[month.key])}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <LoadingState message="Memuat data rekapitulasi kas..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="w-full max-w-full page-enter space-y-3 sm:space-y-4 md:space-y-6 -mx-3 sm:-mx-0 px-3 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-3 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-title-lg font-bold text-slate-900 tracking-tight">Rekapitulasi Kas</h1>
            <p className="text-subtitle text-slate-500 mt-0.5">Periode 2024-2025</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center justify-center p-2 sm:p-2.5 sm:px-4 bg-white border border-slate-200 hover:border-slate-300 rounded-lg sm:rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-soft-sm"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-4 animate-fade-in-up">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-5 text-white shadow-soft-lg card-enter stagger-1">
          <div className="flex items-center justify-center sm:justify-between mb-1.5 sm:mb-2 md:mb-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6" />
            </div>
            <span className="hidden md:block text-xs font-medium bg-white/20 px-2.5 py-1 rounded-lg">Anggota</span>
          </div>
          <p className="text-stat-sm font-bold text-center sm:text-left">{sortedData.length}</p>
          <p className="text-caption-sm text-blue-100 mt-0.5 text-center sm:text-left">Anggota</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-5 text-white shadow-soft-lg card-enter stagger-2">
          <div className="flex items-center justify-center sm:justify-between mb-1.5 sm:mb-2 md:mb-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center">
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6" />
            </div>
            <span className="hidden md:block text-xs font-medium bg-white/20 px-2.5 py-1 rounded-lg">9 Bulan</span>
          </div>
          <p className="text-stat-sm font-bold text-center sm:text-left truncate">{formatCurrencyShort(grandTotal)}</p>
          <p className="text-caption-sm text-emerald-100 mt-0.5 text-center sm:text-left">Total Kas</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 via-violet-600 to-purple-600 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-5 text-white shadow-soft-lg card-enter stagger-3">
          <div className="flex items-center justify-center sm:justify-between mb-1.5 sm:mb-2 md:mb-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6" />
            </div>
            <span className="hidden md:block text-xs font-medium bg-white/20 px-2.5 py-1 rounded-lg">Per Orang</span>
          </div>
          <p className="text-stat-sm font-bold text-center sm:text-left truncate">{sortedData.length > 0 ? formatCurrencyShort(grandTotal / sortedData.length) : 'Rp0'}</p>
          <p className="text-caption-sm text-violet-100 mt-0.5 text-center sm:text-left">Rata-rata</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative animate-fade-in-up stagger-4">
        <Search className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama atau jabatan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 sm:h-10 md:h-12 pl-8 sm:pl-10 md:pl-12 pr-8 sm:pr-10 md:pr-4 py-2 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-soft-sm"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-2.5 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 p-0.5 sm:p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <EmptyState icon="clipboard" title="Belum ada data rekapitulasi kas" description="Data rekapitulasi kas akan muncul di sini setelah ditambahkan oleh admin." variant="warning" />
      ) : (
        <>
          {/* Mobile View */}
          {isMobile ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-slate-500">{sortedData.length} anggota</p>
                <p className="text-xs font-medium text-primary-600">Total: {formatCurrencyShort(grandTotal)}</p>
              </div>
              {sortedData.map((row, index) => (
                <MobileCard key={row.id} row={row} index={index} />
              ))}

              {/* Mobile Total Summary */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white mt-4">
                <div className="text-xs text-slate-400 mb-1">Total Kas Keseluruhan</div>
                <div className="text-2xl font-bold">{formatCurrency(grandTotal)}</div>
              </div>
            </div>
          ) : (
            /* Desktop Table */
            <div className="bg-white rounded-2xl shadow-soft-md border border-slate-200/80 overflow-hidden card-enter stagger-5">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <th className="w-16 text-center font-semibold text-slate-600 py-4 px-3">No</th>
                      <th className="font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 px-4 py-4 text-left min-w-[200px] transition-colors" onClick={() => handleSort('nama')}>
                        <div className="flex items-center gap-2">
                          Nama Anggota
                          <ArrowUpDown className="w-4 h-4 text-slate-400" />
                        </div>
                      </th>
                      <th className="font-semibold text-slate-600 py-4 px-4 text-left min-w-[160px]">Jabatan</th>
                      {months.map((month) => (
                        <th key={month.key} className="text-center font-semibold text-slate-600 py-4 px-3 min-w-[90px]">
                          {month.label}
                        </th>
                      ))}
                      <th className="text-right font-semibold text-slate-600 py-4 px-4 min-w-[130px]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((row, index) => (
                      <tr key={row.id} className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors group">
                        <td className="text-center font-medium text-slate-500 py-4 px-3">{row.no || index + 1}</td>
                        <td className="font-medium text-slate-900 py-4 px-4">{row.nama}</td>
                        <td className="text-slate-600 py-4 px-4">{row.jabatan}</td>
                        {months.map((month) => (
                          <td key={month.key} className="text-right text-slate-700 py-4 px-3 font-medium">
                            {formatCurrency(row[month.key])}
                          </td>
                        ))}
                        <td className="text-right font-bold text-slate-900 bg-gradient-to-r from-transparent to-blue-50 py-4 px-4">{formatCurrency(calculateTotal(row))}</td>
                      </tr>
                    ))}

                    {/* Total Row */}
                    <tr className="bg-gradient-to-r from-slate-100 to-blue-100 font-semibold border-t-2 border-slate-300">
                      <td colSpan={3} className="text-slate-900 font-bold py-4 px-4 text-left">
                        TOTAL KESELURUHAN
                      </td>
                      {months.map((month) => (
                        <td key={month.key} className="text-right text-slate-800 font-bold py-4 px-3">
                          {formatCurrency(monthlyTotals[month.key])}
                        </td>
                      ))}
                      <td className="text-right font-bold text-primary-700 py-4 px-4">{formatCurrency(grandTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
