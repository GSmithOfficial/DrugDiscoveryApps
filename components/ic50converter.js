/* ============================================================================
   IC50 / pIC50 tools – live summary + fold-difference
   Exports:  window.initIC50Converter(containerElement)
   ===========================================================================*/
   function initIC50Converter(container) {
    /* -----------------------------------------------------------------------
       Mark-up
       -------------------------------------------------------------------- */
    container.innerHTML = `
        <!-- ── live summary cards ── -->
        <div class="result-summary">
            <div class="result-large">
                <div class="result-title">pIC50</div>
                <div id="summaryPic50" class="result-value">–</div>
            </div>
            <div class="result-large">
                <div class="result-title">IC50 (nM)</div>
                <div id="summaryIc50" class="result-value">–</div>
            </div>
        </div>

        <!-- ── converter section ── -->
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

        <hr>

        <!-- ── pIC50 fold-difference section ── -->
        <h3>pIC50 Fold Difference</h3>
        <p>Enter two pIC50 values to calculate the potency fold-change ( fold = 10<sup>(ΔpIC50)</sup> ).</p>

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

    /* -----------------------------------------------------------------------
       Element handles
       -------------------------------------------------------------------- */
    /* converter */
    const ic50Input       = container.querySelector('#ic50');
    const ic50UnitSelect  = container.querySelector('#ic50Unit');
    const pic50Input      = container.querySelector('#pic50');
    const convertBtn      = container.querySelector('#convertIC50');
    const resultBox       = container.querySelector('#ic50Result');

    /* live summary */
    const summaryPic50    = container.querySelector('#summaryPic50');
    const summaryIc50     = container.querySelector('#summaryIc50');

    /* fold-difference */
    const pic50AInput     = container.querySelector('#pic50A');
    const pic50BInput     = container.querySelector('#pic50B');
    const calcFoldBtn     = container.querySelector('#calcFold');
    const foldResultBox   = container.querySelector('#foldResult');

    /* -----------------------------------------------------------------------
       IC50 ↔ pIC50 logic
       -------------------------------------------------------------------- */
    convertBtn.addEventListener('click', convertIC50);

    ic50Input.addEventListener('input', () => {
        pic50Input.value      = '';
        resultBox.textContent = '';
        resetSummary();
    });

    pic50Input.addEventListener('input', () => {
        ic50Input.value       = '';
        resultBox.textContent = '';
        resetSummary();
    });

    function convertIC50() {
        /* ── IC50 → pIC50 ── */
        if (ic50Input.value !== '') {
            let ic50 = parseFloat(ic50Input.value);
            if (isNaN(ic50) || ic50 <= 0) {
                resultBox.textContent = 'Please enter a valid IC50 value.';
                return;
            }
            if (ic50UnitSelect.value === 'µM') ic50 *= 1000;  // µM → nM

            const pic50 = -Math.log10(ic50 * 1e-9);          // nM ⇒ M then -log10
            pic50Input.value      = pic50.toFixed(2);
            resultBox.textContent = `pIC50: ${pic50.toFixed(2)}`;

            /* live summary */
            summaryPic50.textContent = pic50.toFixed(2);
            summaryIc50.textContent  = ic50.toFixed(2);

        /* ── pIC50 → IC50 ── */
        } else if (pic50Input.value !== '') {
            const pic50 = parseFloat(pic50Input.value);
            if (isNaN(pic50)) {
                resultBox.textContent = 'Please enter a valid pIC50 value.';
                return;
            }
            let ic50 = Math.pow(10, -pic50) * 1e9;           // nM
            let displayIc50 = ic50;

            if (ic50UnitSelect.value === 'µM') {
                displayIc50 = ic50 / 1000;                   // show µM if selected
            }
            ic50Input.value       = displayIc50.toFixed(2);
            resultBox.textContent = `IC50: ${displayIc50.toF
