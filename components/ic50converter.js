/* ============================================================================
   Live IC50 ↔ pIC50 converter  +  KPI bar  +  Fold-difference
   KPI bar now appears under the converter, above the divider
   ===========================================================================*/
   function initIC50Converter(container) {
    /* -------------------------------------------------------------------- */
    /*  MARK-UP (order changed)                                             */
    /* -------------------------------------------------------------------- */
    container.innerHTML = `
        <!-- CONVERTER (auto) -->
        <h2>IC50 ↔ pIC50 Converter</h2>
        <p>Convert between IC50 and pIC50 values for enzyme inhibition studies.</p>

        <div class="converter-layout">
            <div class="input-group ic50-group">
                <label for="ic50">IC50</label>
                <div class="input-with-select horizontal">
                    <input type="number" id="ic50" step="any" placeholder="e.g. 50">
                    <select id="ic50Unit">
                        <option value="nM" selected>nM</option>
                        <option value="µM">µM</option>
                    </select>
                </div>
            </div>

            <span class="operator">↔</span>

            <div class="input-group">
                <label for="pic50">pIC50</label>
                <input type="number" id="pic50" step="any" placeholder="auto-fills">
            </div>
        </div>

        <!-- KPI BAR (moved down) -->
        <div class="kpi-bar">
            <div class="kpi-block">
                <span class="kpi-label">pIC50</span>
                <span id="summaryPic50" class="kpi-value">–</span>
            </div>
            <div class="kpi-block">
                <span class="kpi-label">IC50 (nM)</span>
                <span id="summaryIc50" class="kpi-value">–</span>
            </div>
        </div>

        <!-- Fold-difference card (unchanged) -->
        <hr />
        <h3>pIC50 Fold Difference</h3>
        <p>Enter two pIC50 values to calculate the potency fold-change (<em>fold = 10<sup>ΔpIC50</sup></em>).</p>

        <div class="converter-layout">
            <div class="input-group">
                <label for="pic50A">pIC50 A</label>
                <input type="number" id="pic50A" step="any" placeholder="e.g. 6.2">
            </div>

            <span class="operator">→</span>

            <div class="input-group">
                <label for="pic50B">pIC50 B</label>
                <input type="number" id="pic50B" step="any" placeholder="e.g. 7.2">
            </div>
        </div>

        <button id="calcFold" disabled>Calculate Fold</button>
        <div id="foldResult" class="result-box"></div>
    `;

    /* -------------------------------------------------------------------- */
    /*  ELEMENT HANDLES                                                     */
    /* -------------------------------------------------------------------- */
    const ic50Input      = container.querySelector('#ic50');
    const ic50UnitSelect = container.querySelector('#ic50Unit');
    const pic50Input     = container.querySelector('#pic50');

    const summaryPic50   = container.querySelector('#summaryPic50');
    const summaryIc50    = container.querySelector('#summaryIc50');

    // Fold-difference (unchanged)
    const pic50AInput    = container.querySelector('#pic50A');
    const pic50BInput    = container.querySelector('#pic50B');
    const calcFoldBtn    = container.querySelector('#calcFold');
    const foldResultBox  = container.querySelector('#foldResult');

    /* -------------------------------------------------------------------- */
    /*  LIVE CONVERSION HELPERS                                             */
    /* -------------------------------------------------------------------- */
    const debounce = (fn, delay = 250) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), delay);
        };
    };

    function format(num, decimals = 2) {
        return parseFloat(num).toFixed(decimals);
    }

    /* -------------------------------------------------------------------- */
    /*  CONVERSION LOGIC (auto)                                             */
    /* -------------------------------------------------------------------- */
    const handleIc50Input  = debounce(() => {
        if (ic50Input.value === '') { resetKPI(); pic50Input.value = ''; return; }

        let ic50 = parseFloat(ic50Input.value);
        if (isNaN(ic50) || ic50 <= 0) { resetKPI(); return; }

        if (ic50UnitSelect.value === 'µM') ic50 *= 1000;          // standardise to nM

        const pic50 = -Math.log10(ic50 * 1e-9);

        pic50Input.value        = format(pic50);
        summaryPic50.textContent = format(pic50);
        summaryIc50.textContent  = format(ic50);
    });

    const handlePic50Input = debounce(() => {
        if (pic50Input.value === '') { resetKPI(); ic50Input.value = ''; return; }

        const pic50 = parseFloat(pic50Input.value);
        if (isNaN(pic50)) { resetKPI(); return; }

        let ic50nM = Math.pow(10, -pic50) * 1e9;

        let displayIc50 = ic50nM;
        if (ic50UnitSelect.value === 'µM') displayIc50 = ic50nM / 1000;

        ic50Input.value          = format(displayIc50);
        summaryPic50.textContent = format(pic50);
        summaryIc50.textContent  = format(ic50nM);
    });

    /* -------------------------------------------------------------------- */
    /*  EVENT BINDINGS                                                      */
    /* -------------------------------------------------------------------- */
    ic50Input.addEventListener('input',  () => { pic50Input.dataset.last = ''; handleIc50Input(); });
    pic50Input.addEventListener('input', () => { ic50Input.dataset.last = ''; handlePic50Input(); });
    ic50UnitSelect.addEventListener('change', () => {
        // Recalculate based on whichever field currently has content
        if (ic50Input.value) handleIc50Input();
        else if (pic50Input.value) handlePic50Input();
    });

    function resetKPI() {
        summaryPic50.textContent = '–';
        summaryIc50.textContent  = '–';
    }

    /* -------------------------------------------------------------------- */
    /*  FOLD-DIFFERENCE LOGIC (unchanged)                                   */
    /* -------------------------------------------------------------------- */
    [pic50AInput, pic50BInput].forEach(el =>
        el.addEventListener('input', () => {
            calcFoldBtn.disabled = !(pic50AInput.value && pic50BInput.value);
            foldResultBox.textContent = '';
        })
    );

    calcFoldBtn.addEventListener('click', () => {
        const a = parseFloat(pic50AInput.value);
        const b = parseFloat(pic50BInput.value);
        if (isNaN(a) || isNaN(b)) {
            foldResultBox.textContent = 'Please enter two valid pIC50 values.';
            return;
        }
        const delta = b - a;                     // ΔpIC50
if (delta === 0) {
    foldResultBox.textContent = 'Fold difference: 1× (no change)';
} else {
    const fold = Math.pow(10, Math.abs(delta));
    if (delta > 0) {
        foldResultBox.textContent = `Fold difference: ${format(fold, 1)}× more potent`;
    } else {
        foldResultBox.textContent = `Fold difference: ${format(1 / fold, 2)}× less potent`;
        /*  or, if you prefer the reciprocal form:
            foldResultBox.textContent = \`Fold difference: ${format(fold,1)}× decrease\`;
        */
    }
}

    });
}

/* -------------------------------------------------------------------- */
window.initIC50Converter = initIC50Converter;
