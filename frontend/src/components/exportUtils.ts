export const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0){
        alert("Nu există date de exportat!");
        return;
    }

    const headerSet = new Set<string>();
    data.forEach(row => Object.keys(row).forEach(key => headerSet.add(key)));

    const headers = Array.from(headerSet).sort((a,b) => a === 'date' ? -1 : b === 'date' ? 1 : 0);

    const csvRows = [];
    const escapedHeaders = headers.map(header => `"${header.replace(/"/g, '\\"')}"`);
    csvRows.push(escapedHeaders.join(','));

    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
            const escaped = ('' + val).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download',`${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}