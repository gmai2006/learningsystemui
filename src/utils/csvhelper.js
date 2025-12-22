// utils/csvExport.js
export const exportExperiencesToCSV = (data) => {
    if (!data || data.length === 0) return;

    // 1. Identify all unique metadata keys present in the current view
    const metadataKeys = new Set();
    data.forEach(item => {
        if (item.typeSpecificData) {
            Object.keys(item.typeSpecificData).forEach(key => metadataKeys.add(key));
        }
    });
    const metaHeaderArray = Array.from(metadataKeys);

    // 2. Define headers
    const headers = [
        "Record ID", "Student ID", "Type", "Title", "Organization", 
        "Status", "Is Verified", "Verified Date", "Start Date", "End Date",
        ...metaHeaderArray.map(key => `Meta: ${key}`)
    ];

    // 3. Map rows and handle CSV escaping
    const rows = data.map(exp => [
        exp.id,
        exp.studentId,
        exp.type,
        `"${(exp.title || "").replace(/"/g, '""')}"`,
        `"${(exp.organizationName || "").replace(/"/g, '""')}"`,
        exp.status,
        exp.isVerified ? "TRUE" : "FALSE",
        exp.verifiedAt || "N/A",
        exp.startDate || "",
        exp.endDate || "",
        ...metaHeaderArray.map(key => {
            const val = exp.typeSpecificData?.[key];
            return val !== undefined ? `"${String(val).replace(/"/g, '""')}"` : "";
        })
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EWU_Experience_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};