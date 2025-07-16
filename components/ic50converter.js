/* ============================================================================
   IC50 / pIC50 tools – KPI bar + fold-difference
   Exports:  window.initIC50Converter(containerElement)
   ===========================================================================*/
   function initIC50Converter(container) {
    /* -------------------------------------------------------------------- */
    /*  MARK-UP                                                             */
    /* -------------------------------------------------------------------- */
    container.innerHTML = `
        <!-- ── KPI BAR ── -->
        <div class="kpi-bar">
            <div class="kpi-block" data-target="pic50">
                <span class="kpi-label">pIC50</span>
                <span id="summaryPic50" class="kpi-value">–</span>
            </div>
            <div class="kpi-block" data-target="ic50">
                <span class="kpi-label">IC50 (nM)</span>
                <span id="summaryIc50" class="kpi-value">–</span>
            </div>
        </div>

        <!-- ── CONVERTER SECTION ── -->
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

        <hr />

        <!-- ── pIC50 FOLD-DIFFERENCE SECTION ── -->
        <h3>pIC50 Fold Difference</h3>
        <p>Enter two pIC50 values to calculate the potency fold-change (<em>fold&nbsp;=&nbsp;10<sup>ΔpIC50</sup></em>).</p>

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
    // Converter
    const ic50Input      = container.querySelector('#ic50');
    const ic50UnitSelect = container.querySelector('#ic50Unit');
    const pic50Input     = container.querySelector('#pic50');
    const convertBtn     = container.querySelector('#convertIC50');
    const resultBox      = container.querySelector('#ic50Result');

    // KPI bar
    const summaryPic50   = container.querySelector('#summaryPic50');
    const summaryIc50    = container.querySelector('#summaryIc50');
    const kpiBlocks      = container.querySelectorAll('.kpi-block');

    // Fold-difference
    const pic50AInput    = container.querySelector('#pic50A');
    const pic50BInput    = container.querySelector('#pic50B');
    const calcFoldBtn    = container.querySelector('#calcFold');
    const foldResultBox  = container.querySelector('#foldResult');

    /* -------------------------------------------------------------------- */
    /*  KPI BAR MICRO-INTERACTIONS                                          */
    /* -------------------------------------------------------------------- */
    kpiBlocks.forEach(block => {
        // Hover raise
        block.addEventListener('mouseenter', () => block.classList.add('raised'));
        block.addEventListener('mouseleave', () => block.classList.remove('raised'));

        // Click → copy value to clipboard
        block.addEventListener('click', () => {
            const valSpan = block.querySelector('.kpi-value');
            if (!valSpan) return;
            navigator.clipboard.writeText(valSpan.textContent).then(() => {
                block.classList.add('copied');
                setTimeout(() => block.classList.remove('copied'), 1200);
            });
        });
    });

    /* -------------------------------------------------------------------- */
    /*  IC50 ↔ pIC50 LOGIC                                                  */
    /* -------------------------------------------------------------------- */
    convertBtn.addEventListener('click', convertIC50);

    ic50Input.addEventListener('input', () => {   // clear opposite field
        pic50Input.value      = '';
        resultBox.textContent = '';
        resetKPI();
    });
    pic50Input.addEventListener('input', () => {
        ic50Input.value       = '';
        resultBox.textContent = '';
        resetKPI();
    });

    function convertIC50() {
        /* ---- IC50 ➜ pIC50 ---- */
        if (ic50Input.value !== '') {
            let ic50 = parseFloat(ic50Input.value);
            if (isNaN(ic50) || ic50 <= 0) {
                resultBox.textContent = 'Please enter a valid IC50 value.';
                return;
            }
            if (ic50UnitSelect.value === 'µM') ic50 *= 1000;         // µM ➜ nM
            const pic50 = -Math.log10(ic50 * 1e-9);                 // nM ⟶ M → –log10

            pic50Input.value      = pic50.toFixed(2);
            resultBox.textContent = `pIC50: ${pic50.toFixed(2)}`;

            summaryPic50.textContent = pic50.toFixed(2);
            summaryIc50.textContent  = ic50.toFixed(2);

        /* ---- pIC50 ➜ IC50 ---- */
        } else if (pic50Input.value !== '') {
            const pic50 = parseFloat(pic50Input.value);
            if (isNaN(pic50)) {
                resultBox.textContent = 'Please enter a valid pIC50 value.';
                return;
            }
            let ic50nM = Math.pow(10, -pic50) * 1e9;                // nM
            let displayIc50 = ic50nM;

            if (ic50UnitSelect.value === 'µM') displayIc50 = ic50nM / 1000;

            ic50Input.value       = displayIc50.toFixed(2);
            resultBox.textContent = `IC50: ${displayIc50.toFixed(2)} ${ic50UnitSelect.value}`;

            summaryPic50.textContent = pic50.toFixed(2);
            summaryIc50.textContent  = ic50nM.toFixed(2);           // always nM in KPI
        } else {
            resultBox.textContent = 'Please enter a value for either IC50 or pIC50.';
        }
    }

    function resetKPI() {
        summaryPic50.textContent = '–';
        summaryIc50.textContent  = '–';
    }

    /* -------------------------------------------------------------------- */
    /*  pIC50 FOLD-DIFFERENCE LOGIC                                         */
    /* -------------------------------------------------------------------- */
    [pic50AInput, pic50BInput].forEach(el =>
        el.addEventListener('input', () => {
            calcFoldBtn.disabled   = !(pic50AInput.value && pic50BInput.value);
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
        const fold = Math.pow(10, b - a);
        foldResultBox.textContent = `Fold difference: ${fold.toFixed(1)}×`;
    });
}

/* ------------------------------------------------------------------------
   EXPORT
   --------------------------------------------------------------------- */
window.initIC50Converter = initIC50Converter;
