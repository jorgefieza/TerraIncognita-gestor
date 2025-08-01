// src/utils/csv.js

const jsonToCsv = (json) => {
    if (!json || json.length === 0) return '';

    const replacer = (key, value) => (value === null ? '' : value);
    const header = Object.keys(json[0]);
    let csv = json.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    return csv.join('\r\n');
};

const downloadCsv = (csvString, filename) => {
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export { jsonToCsv, downloadCsv };