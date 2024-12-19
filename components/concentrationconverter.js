function initConcentrationConverter(container) {
    container.innerHTML = `
        <h2>Concentration Unit Converter</h2>
        <p>Convert between different concentration units using molecular weight.</p>
        <div class="input-group">
            <label for="mw">Molecular Weight (g/mol)</label>
            <input type="number" id="mw" step="any" required placeholder="Enter MW">
        </div>
        <div class="converter-layout">
            <div class="input-group">
                <label for="inputConc">Input Concentration</label>
                <div class="input-with-select">
                    <input type="number" id="inputConc" step="any" placeholder="Enter value">
                    <select id="inputUnit">
                        <option value="M">M</option>
                        <option value="mM">mM</option>
                        <option value="µM">µM</option>
                        <option value="nM" selected>nM</option>
                        <option value="mg/mL">mg/mL</option>
                        <option value="µg/mL">µg/mL</option>
                        <option value="ng/mL">ng/mL</option>
                    </select>
                </div>
            </div>
            <div class="input-group">
                <label for="outputUnit">Output Unit</label>
                <select id="outputUnit">
                    <option value="M">M</option>
                    <option value="mM">mM</option>
                    <option value="µM">µM</option>
                    <option value="nM">nM</option>
                    <option value="mg/mL">mg/mL</option>
                    <option value="µg/mL">µg/mL</option>
                    <option value="ng/mL" selected>ng/mL</option>
                </select>
            </div>
        </div>
        <button id="convertConc">Convert</button>
        <div id="concResult" class="result-box"></div>
    `;

    const mwInput = container.querySelector('#mw');
    const inputConcInput = container.querySelector('#inputConc');
    const inputUnitSelect = container.querySelector('#inputUnit');
    const outputUnitSelect = container.querySelector('#outputUnit');
    const convertButton = container.querySelector('#convertConc');
    const resultBox = container.querySelector('#concResult');

    convertButton.addEventListener('click', performConversion);

    function performConversion() {
        const mw = parseFloat(mwInput.value);
        const inputConc = parseFloat(inputConcInput.value);
        const inputUnit = inputUnitSelect.value;
        const outputUnit = outputUnitSelect.value;

        if (isNaN(mw) || mw <= 0) {
            resultBox.textContent = 'Please enter a valid Molecular Weight.';
            return;
        }

        if (isNaN(inputConc) || inputConc < 0) {
            resultBox.textContent = 'Please enter a valid concentration value.';
            return;
        }

        let molarConc = convertToMolar(inputConc, inputUnit, mw);
        let outputConc = convertFromMolar(molarConc, outputUnit, mw);

        resultBox.textContent = `${inputConc} ${inputUnit} = ${formatOutput(outputConc)} ${outputUnit}`;
    }

    function convertToMolar(value, unit, mw) {
        switch (unit) {
            case 'M': return value;
            case 'mM': return value * 1e-3;
            case 'µM': return value * 1e-6;
            case 'nM': return value * 1e-9;
            case 'mg/mL': return value / mw;
            case 'µg/mL': return value * 1e-3 / mw;
            case 'ng/mL': return value * 1e-6 / mw;
        }
    }

    function convertFromMolar(molarValue, unit, mw) {
        switch (unit) {
            case 'M': return molarValue;
            case 'mM': return molarValue * 1e3;
            case 'µM': return molarValue * 1e6;
            case 'nM': return molarValue * 1e9;
            case 'mg/mL': return molarValue * mw;
            case 'µg/mL': return molarValue * mw * 1e3;
            case 'ng/mL': return molarValue * mw * 1e6;
        }
    }

    function formatOutput(value) {
        if (value >= 1e5 || value <= 1e-5) {
            return value.toExponential(4);
        }
        return value.toPrecision(5);
    }
}

// Make it available globally
window.initConcentrationConverter = initConcentrationConverter;