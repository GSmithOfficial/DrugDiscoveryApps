
/* Enhanced IC50 ↔ pIC50 Converter with Modern UI */

function initIC50Converter(container) {
    container.innerHTML = `
        <div class="tool-container">
            <div class="tool-header">
                <h3>🔄 IC50 ↔ pIC50 Converter</h3>
                <p class="tool-description">Convert between IC50 and pIC50 values for enzyme inhibition studies</p>
            </div>

            <div class="converter-layout">
                <!-- Input Section -->
                <div class="input-section">
                    <div class="conversion-direction">
                        <div class="input-block">
                            <div class="input-header">
                                <label for="ic50-val">IC50 Value</label>
                                <div class="unit-selector">
                                    <button id="unit-pill" class="unit-button" data-unit="nM" aria-expanded="false">
                                        nM ▼
                                    </button>
                                    <div id="unit-popover" class="unit-dropdown" hidden>
                                        <button data-unit="nM" class="unit-option active">nM (nanomolar)</button>
                                        <button data-unit="µM" class="unit-option">µM (micromolar)</button>
                                        <button data-unit="mM" class="unit-option">mM (millimolar)</button>
                                    </div>
                                </div>
                            </div>
                            <input id="ic50-val" type="number" step="0.001" placeholder="Enter IC50 value" class="form-input large">
                            <div class="input-hint">Half maximal inhibitory concentration</div>
                        </div>

                        <div class="conversion-arrow">
                            <div class="arrow-symbol">⇄</div>
                            <div class="arrow-label">converts to</div>
                        </div>

                        <div class="input-block">
                            <div class="input-header">
                                <label for="pic50-val">pIC50 Value</label>
                                <div class="unit-display">
                                    <span class="fixed-unit">-log(M)</span>
                                </div>
                            </div>
                            <input id="pic50-val" type="number" step="0.01" placeholder="Enter pIC50 value" class="form-input large">
                            <div class="input-hint">Negative logarithm of IC50 in molar</div>
                        </div>
                    </div>

                    <div class="conversion-info">
                        <div class="info-card">
                            <h5>🧪 Conversion Formula</h5>
                            <code>pIC50 = -log10(IC50 in molar)</code>
                            <p>Higher pIC50 values indicate more potent compounds</p>
                        </div>
                    </div>
                </div>

                <!-- Results Section -->
                <div class="results-section">
                    <h4 class="section-title">Converted Values</h4>

                    <div class="result-cards">
                        <div class="result-card primary">
                            <div class="result-icon">📊</div>
                            <div class="result-content">
                                <div class="result-label">pIC50</div>
                                <div class="result-value" id="result-pic50">–</div>
                                <div class="result-unit">-log(M)</div>
                            </div>
                        </div>

                        <div class="result-card secondary">
                            <div class="result-icon">🧮</div>
                            <div class="result-content">
                                <div class="result-label">IC50</div>
                                <div class="result-value" id="result-ic50">–</div>
                                <div class="result-unit">nM</div>
                            </div>
                        </div>
                    </div>

                    <div class="potency-scale">
                        <h5>Potency Reference Scale</h5>
                        <div class="scale-bar">
                            <div class="scale-segment weak" data-range="< 4">
                                <span>Weak</span>
                                <small>pIC50 < 4</small>
                            </div>
                            <div class="scale-segment moderate" data-range="4-6">
                                <span>Moderate</span>
                                <small>pIC50 4-6</small>
                            </div>
                            <div class="scale-segment potent" data-range="6-8">
                                <span>Potent</span>
                                <small>pIC50 6-8</small>
                            </div>
                            <div class="scale-segment very-potent" data-range="> 8">
                                <span>Very Potent</span>
                                <small>pIC50 > 8</small>
                            </div>
                        </div>
                        <div class="current-potency" id="potency-indicator">
                            <div class="indicator-arrow">↑</div>
                            <span>Enter values to see potency</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    /* ─── Enhanced Helpers ─── */
    const $ = (s) => container.querySelector(s);
    const ic50Input = $('#ic50-val');
    const pic50Input = $('#pic50-val');
    const unitPill = $('#unit-pill');
    const popover = $('#unit-popover');
    const resPic50 = $('#result-pic50');
    const resIC50 = $('#result-ic50');
    const potencyIndicator = $('#potency-indicator');

    const toMolar = (v, u) => u === 'nM' ? v * 1e-9 : u === 'µM' ? v * 1e-6 : u === 'mM' ? v * 1e-3 : NaN;
    const nm = (m) => m * 1e9;

    function update() {
        const unit = unitPill.dataset.unit;
        const ic = parseFloat(ic50Input.value);
        const pic = parseFloat(pic50Input.value);

        let outPic = '–', outIC = '–';
        let currentPIC50 = null;

        if (!isNaN(ic)) {
            // IC50 provided
            const mol = toMolar(ic, unit);
            if (mol > 0) {
                outPic = (-Math.log10(mol)).toFixed(2);
                outIC = nm(mol).toFixed(2);
                currentPIC50 = parseFloat(outPic);
            }
            pic50Input.disabled = true;
            ic50Input.disabled = false;

            // Visual feedback
            ic50Input.closest('.input-block').classList.add('active-input');
            pic50Input.closest('.input-block').classList.remove('active-input');

        } else if (!isNaN(pic)) {
            const mol = Math.pow(10, -pic);
            outIC = nm(mol).toFixed(2);
            outPic = pic.toFixed(2);
            currentPIC50 = pic;

            ic50Input.disabled = true;
            pic50Input.disabled = false;

            // Visual feedback
            pic50Input.closest('.input-block').classList.add('active-input');
            ic50Input.closest('.input-block').classList.remove('active-input');

        } else {
            ic50Input.disabled = false;
            pic50Input.disabled = false;
            ic50Input.closest('.input-block').classList.remove('active-input');
            pic50Input.closest('.input-block').classList.remove('active-input');
        }

        // Update results with animation
        updateResultWithAnimation(resPic50, outPic);
        updateResultWithAnimation(resIC50, outIC);

        // Update potency indicator
        updatePotencyIndicator(currentPIC50);
    }

    function updateResultWithAnimation(element, value) {
        const card = element.closest('.result-card');
        const hasValue = value !== '–';

        element.textContent = value;
        card.classList.toggle('has-result', hasValue);

        if (hasValue) {
            card.classList.add('result-updated');
            setTimeout(() => card.classList.remove('result-updated'), 500);
        }
    }

    function updatePotencyIndicator(pic50Value) {
        const indicator = potencyIndicator;
        const arrow = indicator.querySelector('.indicator-arrow');
        const text = indicator.querySelector('span');

        if (pic50Value === null) {
            text.textContent = 'Enter values to see potency';
            indicator.className = 'current-potency';
            return;
        }

        let potencyClass = '';
        let potencyText = '';
        let position = 0;

        if (pic50Value < 4) {
            potencyClass = 'weak';
            potencyText = 'Weak inhibitor';
            position = 12.5;
        } else if (pic50Value < 6) {
            potencyClass = 'moderate';
            potencyText = 'Moderate inhibitor';
            position = 37.5;
        } else if (pic50Value < 8) {
            potencyClass = 'potent';
            potencyText = 'Potent inhibitor';
            position = 62.5;
        } else {
            potencyClass = 'very-potent';
            potencyText = 'Very potent inhibitor';
            position = 87.5;
        }

        indicator.className = `current-potency ${potencyClass}`;
        text.textContent = potencyText;
        indicator.style.left = `${position}%`;
    }

    /* ─── Enhanced Events ─── */
    ic50Input.addEventListener('input', () => {
        if (ic50Input.value) {
            pic50Input.value = '';
            pic50Input.classList.remove('error');
        }
        update();
    });

    pic50Input.addEventListener('input', () => {
        if (pic50Input.value) {
            ic50Input.value = '';
            ic50Input.classList.remove('error');
        }
        update();
    });

    // Enhanced unit selector
    unitPill.addEventListener('click', (e) => {
        e.stopPropagation();
        const expanded = unitPill.getAttribute('aria-expanded') === 'true';
        unitPill.setAttribute('aria-expanded', !expanded);
        popover.hidden = expanded;
        unitPill.classList.toggle('expanded', !expanded);
    });

    popover.addEventListener('click', (e) => {
        if (!e.target.dataset.unit) return;

        const selectedUnit = e.target.dataset.unit;

        // Update active state
        popover.querySelectorAll('.unit-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.unit === selectedUnit);
        });

        // Update button
        unitPill.textContent = `${selectedUnit} ▼`;
        unitPill.dataset.unit = selectedUnit;

        // Close dropdown
        popover.hidden = true;
        unitPill.setAttribute('aria-expanded', 'false');
        unitPill.classList.remove('expanded');

        // Update calculations
        update();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!popover.contains(e.target) && e.target !== unitPill) {
            popover.hidden = true;
            unitPill.setAttribute('aria-expanded', 'false');
            unitPill.classList.remove('expanded');
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            popover.hidden = true;
            unitPill.setAttribute('aria-expanded', 'false');
            unitPill.classList.remove('expanded');
        }
    });

    // Input validation
    [ic50Input, pic50Input].forEach(input => {
        input.addEventListener('blur', () => {
            const value = parseFloat(input.value);
            if (input.value && (isNaN(value) || value <= 0)) {
                input.classList.add('error');
                input.closest('.input-block').classList.add('error');
            } else {
                input.classList.remove('error');
                input.closest('.input-block').classList.remove('error');
            }
        });
    });

    // Initialize
    update();
}

/* Expose globally */
window.initIC50Converter = initIC50Converter;
