import { useRef, useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Search as SearchIcon, BookOpen, ListTree, X, ExternalLink, ArrowUp } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function PusatInformasi() {
    const nav = useNavigate();
    const { hash } = useLocation();

    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState([]);
    const [loadError, setLoadError] = useState(null);
    const [openSec, setOpenSec] = useState({});
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [activeItemId, setActiveItemId] = useState(null);

    const containerRef = useRef(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoadError(null);
                const json = await apiFetch('/info-center');
                if (!alive) return;
                const secs = Array.isArray(json?.data?.sections) ? json.data.sections : [];
                setSections(secs);

                const defaults = Object.fromEntries(secs.map((s) => [s.id, true]));

                const firstSec = secs[0];
                const firstItem = firstSec?.items?.[0];
                let activeSecId = firstSec?.id || null;
                let activeItmId = firstItem?.id || null;

                const fromHashId = hash?.replace('#', '');
                if (fromHashId) {
                    const foundSec = secs.find((s) => (s.items || []).some((it) => it.id === fromHashId));
                    if (foundSec) {
                        activeSecId = foundSec.id;
                        activeItmId = fromHashId;
                    }
                }

                setOpenSec(defaults);
                setActiveSectionId(activeSecId);
                setActiveItemId(activeItmId);
            } catch (e) {
                if (!alive) return;
                setLoadError(e);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [hash]);

    const flatItems = useMemo(() => sections.flatMap((sec) => (sec.items || []).map((it) => ({ ...it, __sectionId: sec.id, __sectionTitle: sec.title }))), [sections]);

    const activeItem = useMemo(() => {
        const sec = sections.find((s) => s.id === activeSectionId);
        return sec?.items?.find((it) => it.id === activeItemId) || null;
    }, [sections, activeSectionId, activeItemId]);

    const results = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return [];
        return flatItems
            .filter((it) => {
                const hay = [it.title, it.summary, it.content, (it.tags || []).join(' ')].join(' ').toLowerCase() || '';
                return hay.includes(term);
            })
            .slice(0, 10);
    }, [flatItems, searchTerm]);

    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setSearchOpen((s) => !s);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const scrollContentToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return <div className="p-10 text-neutral-500 text-sm animate-pulse">Memuat dokumentasi...</div>;

    return (
        <div ref={containerRef} className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-30 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
                <div className="flex h-16 items-center justify-between px-6 md:px-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-lg shadow-primary-200">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-neutral-900">Pusat Informasi</h1>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">GenBI Documentation</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* K Search Button */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="hidden md:flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-2 text-sm text-neutral-500 transition-all hover:border-primary-300 hover:bg-white hover:shadow-sm group"
                        >
                            <SearchIcon size={16} className="group-hover:text-primary-600" />
                            <span className="flex-1 text-left">Cari dokumentasi...</span>
                            <kbd className="flex h-6 items-center gap-0.5 rounded-md border border-neutral-200 bg-white px-1.5 text-[10px] font-medium text-neutral-400">
                                <span className="text-xs">⌘</span>
                                <span>K</span>
                            </kbd>
                        </button>

                        <button
                            onClick={() => setSearchOpen(true)}
                            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600"
                        >
                            <SearchIcon size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex w-full max-w-[1440px]">
                {/* Sidebar Navigation */}
                <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-72 overflow-y-auto border-r border-neutral-100 bg-neutral-50/30 p-6 md:block scrollbar-thin scrollbar-thumb-neutral-200">
                    <div className="mb-8 pl-1">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                            <ListTree size={14} />
                            <span>Navigasi Dokumen</span>
                        </div>
                    </div>

                    <nav className="space-y-6">
                        {sections.map((sec) => {
                            const isOpen = !!openSec[sec.id];
                            const hasActiveChild = (sec.items || []).some(it => it.id === activeItemId);

                            return (
                                <div key={sec.id} className="space-y-1">
                                    <button
                                        onClick={() => setOpenSec(prev => ({ ...prev, [sec.id]: !prev[sec.id] }))}
                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${hasActiveChild ? 'text-primary-600 bg-primary-50/50' : 'text-neutral-700 hover:bg-neutral-100'
                                            }`}
                                    >
                                        <span>{sec.title}</span>
                                        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                                    </button>

                                    {isOpen && (
                                        <div className="ml-3 space-y-0.5 border-l border-neutral-200 pl-3">
                                            {(sec.items || []).map((it) => {
                                                const isActive = it.id === activeItemId;
                                                return (
                                                    <button
                                                        key={it.id}
                                                        onClick={() => {
                                                            setActiveSectionId(sec.id);
                                                            setActiveItemId(it.id);
                                                            scrollContentToTop();
                                                        }}
                                                        className={`flex w-full rounded-md px-3 py-1.5 text-xs text-left transition-all ${isActive
                                                                ? 'bg-primary-600 font-bold text-white shadow-md shadow-primary-200'
                                                                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                                                            }`}
                                                    >
                                                        {it.title}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="min-w-0 flex-1 px-6 py-10 md:px-16 lg:px-24">
                    {activeItem ? (
                        <div className="max-w-[800px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Breadcrumbs */}
                            <nav className="mb-8 flex items-center gap-2 text-xs font-medium text-neutral-400">
                                <span className="hover:text-neutral-600 cursor-pointer transition-colors" onClick={() => { setActiveSectionId(sections[0]?.id); setActiveItemId(sections[0]?.items?.[0]?.id); }}>Docs</span>
                                <ChevronRight size={12} />
                                <span className="truncate max-w-[120px]">{activeItem.__sectionTitle}</span>
                                <ChevronRight size={12} />
                                <span className="text-primary-600 font-bold truncate max-w-[150px]">{activeItem.title}</span>
                            </nav>

                            <div className="mb-10 border-b border-neutral-100 pb-10">
                                <h2 className="mb-4 text-4xl font-black tracking-tight text-neutral-900 md:text-5xl">
                                    {activeItem.title}
                                </h2>
                                {activeItem.summary && (
                                    <p className="text-lg leading-relaxed text-neutral-500 italic border-l-4 border-primary-500 pl-6 py-2 bg-primary-50/30 rounded-r-xl">
                                        {activeItem.summary}
                                    </p>
                                )}
                            </div>

                            {/* Content rendering */}
                            <div
                                className="prose prose-lg prose-neutral max-w-none
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-neutral-900
                prose-h1:text-4xl prose-h2:text-3xl prose-h2:mt-12 prose-h2:border-b prose-h2:border-neutral-100 prose-h2:pb-4
                prose-h3:text-2xl prose-h3:mt-8
                prose-p:leading-relaxed prose-p:text-neutral-700
                prose-a:text-primary-600 prose-a:no-underline prose-a:font-bold hover:prose-a:underline
                prose-strong:text-neutral-900 prose-strong:font-black
                prose-img:rounded-2xl prose-img:shadow-2xl
                prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:bg-primary-50/50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic
                prose-pre:bg-neutral-900 prose-pre:rounded-2xl prose-pre:shadow-xl
                prose-code:text-primary-600 prose-code:bg-primary-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                "
                                dangerouslySetInnerHTML={{ __html: activeItem.content }}
                            />

                            {/* Tags if any */}
                            {activeItem.tags && activeItem.tags.length > 0 && (
                                <div className="mt-16 flex flex-wrap gap-2 pt-8 border-t border-neutral-100">
                                    {activeItem.tags.map((tag, idx) => (
                                        <span key={idx} className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:bg-primary-100 hover:text-primary-700 transition-colors cursor-default">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Prev/Next Navigation */}
                            <div className="mt-20 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-100 pt-10">
                                {(() => {
                                    const idx = flatItems.findIndex((it) => it.id === activeItemId);
                                    const prev = flatItems[idx - 1];
                                    const next = flatItems[idx + 1];

                                    return (
                                        <>
                                            {prev ? (
                                                <button
                                                    onClick={() => { setActiveSectionId(prev.__sectionId); setActiveItemId(prev.id); scrollContentToTop(); }}
                                                    className="group flex w-full sm:w-auto flex-col items-start gap-2 rounded-2xl border border-neutral-100 p-6 transition-all hover:border-primary-200 hover:bg-primary-50/30 text-left"
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-primary-500">Previous Article</span>
                                                    <span className="text-lg font-bold text-neutral-700 group-hover:text-neutral-900 flex items-center gap-2">
                                                        <ChevronDown className="rotate-90" size={18} />
                                                        {prev.title}
                                                    </span>
                                                </button>
                                            ) : <div />}

                                            {next ? (
                                                <button
                                                    onClick={() => { setActiveSectionId(next.__sectionId); setActiveItemId(next.id); scrollContentToTop(); }}
                                                    className="group flex w-full sm:w-auto flex-col items-end gap-2 rounded-2xl border border-neutral-100 p-6 transition-all hover:border-primary-200 hover:bg-primary-50/30 text-right"
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-primary-500">Next Article</span>
                                                    <span className="text-lg font-bold text-neutral-700 group-hover:text-neutral-900 flex items-center gap-2">
                                                        {next.title}
                                                        <ChevronDown className="-rotate-90" size={18} />
                                                    </span>
                                                </button>
                                            ) : <div />}
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Footer Note */}
                            <footer className="mt-20 flex items-center justify-between border-t border-neutral-100 pt-10 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300">
                                <span>© {new Date().getFullYear()} Generasi Baru Indonesia</span>
                                <button onClick={scrollContentToTop} className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                                    Back to Top <ArrowUp size={12} />
                                </button>
                            </footer>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="h-20 w-20 rounded-3xl bg-neutral-50 flex items-center justify-center mb-6">
                                <SearchIcon size={40} className="text-neutral-300" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900">Pilih artikel untuk mulai membaca</h3>
                            <p className="mt-2 text-neutral-500">Gunakan sidebar atau fitur cari untuk menemukan informasi.</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Global Search Modal */}
            {searchOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-neutral-900/40 p-4 pt-[10vh] backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="relative flex items-center border-b border-neutral-100 p-4">
                            <SearchIcon className="absolute left-6 text-neutral-400" size={20} />
                            <input
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Apa yang ingin Anda pelajari?"
                                className="h-12 w-full bg-transparent pl-12 pr-12 text-lg focus:outline-none"
                            />
                            <button
                                onClick={() => setSearchOpen(false)}
                                className="absolute right-6 rounded-lg bg-neutral-100 p-1.5 text-neutral-500 hover:bg-neutral-200 transition-colors"
                                title="Tutup (Esc)"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
                            {searchTerm.trim() === '' ? (
                                <div className="p-10 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-50 text-neutral-300">
                                        <SearchIcon size={32} />
                                    </div>
                                    <p className="mt-4 text-sm font-medium text-neutral-400 lowercase tracking-widest">Ketik sesuatu untuk mulai mencari...</p>
                                    <div className="mt-8 flex flex-wrap justify-center gap-2">
                                        {['tutorial', 'kebijakan', 'kas', 'poin'].map(tag => (
                                            <button key={tag} onClick={() => setSearchTerm(tag)} className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:bg-primary-100 hover:text-primary-700 transition-all">#{tag}</button>
                                        ))}
                                    </div>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="grid gap-1">
                                    {results.map((it) => (
                                        <button
                                            key={it.id}
                                            onClick={() => {
                                                setActiveSectionId(it.__sectionId);
                                                setActiveItemId(it.id);
                                                setSearchOpen(false);
                                                setSearchTerm('');
                                                scrollContentToTop();
                                            }}
                                            className="group flex flex-col items-start rounded-2xl p-4 transition-colors hover:bg-primary-50/50 text-left"
                                        >
                                            <div className="flex w-full items-center justify-between">
                                                <span className="text-xs font-black uppercase tracking-widest text-primary-500 opacity-60 group-hover:opacity-100">{it.__sectionTitle}</span>
                                                <ExternalLink size={12} className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                            <h4 className="mt-1 text-base font-bold text-neutral-900 group-hover:text-primary-700">{it.title}</h4>
                                            {it.summary && <p className="mt-1 line-clamp-1 text-xs text-neutral-500">{it.summary}</p>}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center text-neutral-400">
                                    <p className="text-sm font-bold uppercase tracking-widest">Tidak ada hasil ditemukan</p>
                                    <p className="text-xs mt-1 lowercase tracking-widest">Coba kata kunci lain...</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-6 py-4">
                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                <div className="flex items-center gap-1.5"><kbd className="rounded border border-neutral-300 bg-white px-1 shadow-sm font-sans tracking-normal">ESC</kbd> <span>Close</span></div>
                                <div className="flex items-center gap-1.5"><kbd className="rounded border border-neutral-300 bg-white px-1 shadow-sm font-sans tracking-normal">↵</kbd> <span>Select</span></div>
                            </div>
                            <div className="text-[10px] font-black text-primary-600/50 uppercase tracking-[0.2em]">GenBI Docs Search</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
