export function generateInstitutionPin(institutionName: string): string {
    if (!institutionName) return '';

    // Clean string and add a subtle salt for this specific project
    const cleanStr = institutionName.trim().toUpperCase() + "_SMILE_WJ";

    // Simple fast 32-bit integer DJB2 hash
    let hash = 5381;
    for (let i = 0; i < cleanStr.length; i++) {
        const char = cleanStr.charCodeAt(i);
        hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
        hash = hash & hash; // Convert to 32bit integer
    }

    // Convert positive value to base 36 (0-9, A-Z)
    let hashStr = Math.abs(hash).toString(36).toUpperCase();

    // Pad to ensure we have at least 6 characters
    while (hashStr.length < 6) {
        hashStr = "A" + hashStr;
    }

    return hashStr.substring(0, 6);
}
