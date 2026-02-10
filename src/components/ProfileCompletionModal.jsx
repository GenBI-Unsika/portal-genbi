import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import Modal from './Modal.jsx';
import { MANDATORY_PROFILE_FIELDS } from '../utils/profile.js';

const MANDATORY_FIELDS = MANDATORY_PROFILE_FIELDS;

export default function ProfileCompletionModal({ isOpen, onClose, missingFields = [] }) {
    const navigate = useNavigate();

    const handleGoToProfile = () => {
        onClose();
        navigate('/profile');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Lengkapi Profil Anda" size="default">
            <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-amber-900 mb-1">Profil Belum Lengkap</h4>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Beberapa data penting belum diisi. Lengkapi profil Anda untuk mendapatkan akses penuh ke fitur portal (seperti pengajuan surat dispensasi).
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Data yang perlu dilengkapi:</p>
                    <div className="grid grid-cols-1 gap-2">
                        {MANDATORY_FIELDS.map((field) => {
                            const isMissing = missingFields.includes(field.key);
                            return (
                                <div
                                    key={field.key}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isMissing ? 'bg-white border-neutral-200' : 'bg-emerald-50 border-emerald-100'
                                        }`}
                                >
                                    {isMissing ? (
                                        <Circle className="w-4 h-4 text-neutral-300" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    )}
                                    <span className={`text-sm ${isMissing ? 'text-neutral-700' : 'text-emerald-700 font-medium'}`}>
                                        {field.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
                    >
                        Nanti Saja
                    </button>
                    <button
                        type="button"
                        onClick={handleGoToProfile}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
                    >
                        Lengkapi Sekarang
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Modal>
    );
}
