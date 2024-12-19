function createResultTable(data) {
    const table = document.createElement('table');
    for (const [key, value] of Object.entries(data)) {
        const row = table.insertRow();
        const keyCell = row.insertCell(0);
        const valueCell = row.insertCell(1);
        keyCell.textContent = key;
        valueCell.textContent = value;
    }
    return table;
}
