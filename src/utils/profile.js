export const MANDATORY_PROFILE_FIELDS = [
    { key: 'name', label: 'Nama Lengkap' },
    { key: 'npm', label: 'NPM (Nomor Pokok Mahasiswa)' },
    { key: 'facultyId', label: 'Fakultas' },
    { key: 'studyProgramId', label: 'Program Studi' },
    { key: 'divisionId', label: 'Divisi GenBI' },
    { key: 'phone', label: 'Nomor WhatsApp' },
];

export function getMissingProfileFields(user) {
    if (!user?.profile) return MANDATORY_PROFILE_FIELDS.map(f => f.key);

    return MANDATORY_PROFILE_FIELDS
        .filter((field) => {
            const val = user.profile[field.key];
            // Check if null, undefined, or empty string
            return val === null || val === undefined || String(val).trim() === '';
        })
        .map(f => f.key);
}

export function isProfileComplete(user) {
    return getMissingProfileFields(user).length === 0;
}
