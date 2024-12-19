function initIC50Converter(container) {
    container.innerHTML = `
        <h2>IC50 ↔ pIC50 Converter</h2>
        <p>Convert between IC50 and pIC50 values for enzyme inhibition studies.</p>
        <div class="converter-layout">
            <div class="input-group">
                <label for="ic50">IC50</label>
                <div class="input-with-select">
                    <input type="number" id="ic50" step="any" placeholder="Enter IC50">
                    <select id="ic50Unit">
                        <option value="nM" selected>nM</option>
                        <option value="µM">µM</option>
                    </select>
                </div>
            </div>
            <span class="operator">↔</span>
            <div class="input-group">
                <label for="pic50">pIC50</label>
                <input type="number" id="pic50" step="any" placeholder="Enter pIC50">
            </div>
        </div>
        <button id="convertIC50">Calculate</button>
        <div id="ic50Result" class="result-box"></div>
    `;

    const ic50Input = container.querySelector('#ic50');
    const ic50UnitSelect = container.querySelector('#ic50Unit');
    const pic50Input = container.querySelector('#pic50');
    const convertButton = container.querySelector('#convertIC50');
    const resultBox = container.querySelector('#ic50Result');

    convertButton.addEventListener('click', performConversion);
    ic50Input.addEventListener('input', () => pic50Input.value = '');
    pic50Input.addEventListener('input', () => ic50Input.value = '');

    function performConversion() {
        if (ic50Input.value && !isNaN(ic50Input.value)) {
            let ic50 = parseFloat(ic50Input.value);
            if (ic50UnitSelect.value === 'µM') {
                ic50 *= 1000; // Convert µM to nM
            }
            const pic50 = -Math.log10(ic50 * 1e-9);
            pic50Input.value = pic50.toFixed(2);
            resultBox.textContent = `pIC50: ${pic50.toFixed(2)}`;
        } else if (pic50Input.value && !isNaN(pic50Input.value)) {
            const pic50 = parseFloat(pic50Input.value);
            let ic50 = Math.pow(10, -pic50) * 1e9;
            if (ic50UnitSelect.value === 'µM') {
                ic50 /= 1000; // Convert nM to µM
            }
            ic50Input.value = ic50.toFixed(2);
            resultBox.textContent = `IC50: ${ic50.toFixed(2)} ${ic50UnitSelect.value}`;
        } else {
            resultBox.textContent = 'Please enter a valid value for either IC50 or pIC50.';
        }
    }
}

// Make it available globally
window.initIC50Converter = initIC50Converter;