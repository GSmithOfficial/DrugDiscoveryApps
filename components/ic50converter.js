
function initIC50Converter(container) {
    container.innerHTML = `
        <div class="drug-calc-card">
            <!-- Header Section -->
            <div class="calc-header">
                <div class="calc-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="16 18 22 12 16 6"/>
                        <polyline points="8 6 2 12 8 18"/>
                        <circle cx="12" cy="12" r="2"/>
                    </svg>
                </div>
                <div class="calc-title">
                    <h2>IC50 ↔ pIC50 Converter</h2>
                    <p>Seamless interconversion for potency analysis</p>
                </div>
            </div>

            <!-- Converter Interface -->
            <div class="converter-interface">
                <!-- IC50 Input Section -->
                <div class="converter-section">
                    <div class="section-header">
                        <h3>IC50 Value</h3>
                        <div class="unit-selector">
                            <button class="unit-button active" data-unit="nM">nM</button>
                            <button class="unit-button" data-unit="µM">µM</button>
                            <button class="unit-button" data-unit="mM">mM</button>
                        </div>
                    </div>
                    <div class="floating-input large">
                        <input type="number" id="ic50-input" class="form-control" step="any" min="0">
                        <label>Enter IC50 value</label>
                    </div>
                </div>

                <!-- Conversion Arrow -->
                <div class="conversion-arrow">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="7 13 12 18 17 13"/>
                        <polyline points="17 11 12 6 7 11"/>
                    </svg>
                </div>

                <!-- pIC50 Input Section -->
                <div class="converter-section">
                    <div class="section-header">
                        <h3>pIC50 Value</h3>
                        <div class="info-tooltip">
                            <span class="tooltip-icon">?</span>
                            <div class="tooltip-content">
                                pIC50 = -log10(IC50 in molar)
                                <br>Higher values indicate greater potency
                            </div>
                        </div>
                    </div>
                    <div class="floating-input large">
                        <input type="number" id="pic50-input" class="form-control" step="0.01">
                        <label>Enter pIC50 value</label>
                    </div>
                </div>
            </div>

            <!-- Results Display -->
            <div class="results-panel">
                <div class="result-cards-grid">
                    <div class="result-card primary">
                        <div class="result-header">
                            <span class="result-icon">🎯</span>
                            <span class="result-title">IC50</span>
                        </div>
                        <div class="result-value" id="result-ic50">–</div>
                        <div class="result-unit">nM</div>
                    </div>

                    <div class="result-card primary">
                        <div class="result-header">
                            <span class="result-icon">📊</span>
                            <span class="result-title">pIC50</span>
                        </div>
                        <div class="result-value" id="result-pic50">–</div>
                        <div class="result-unit"></div>
                    </div>
                </div>

                <!-- Potency Classification -->
                <div class="potency-meter">
                    <div class="potency-header">
                        <h4>Potency Classification</h4>
                    </div>
                    <div class="potency-scale">
                        <div class="potency-range weak">
                            <span class="range-label">Weak</span>
                            <span class="range-values">pIC50 < 5</span>
                        </div>
                        <div class="potency-range moderate">
                            <span class="range-label">Moderate</span>
                            <span class="range-values">5-7</span>
                        </div>
                        <div class="potency-range strong">
                            <span class="range-label">Strong</span>
                            <span class="range-values">7-9</span>
                        </div>
                        <div class="potency-range very-strong">
                            <span class="range-label">Very Strong</span>
                            <span class="range-values">> 9</span>
                        </div>
                        <div class="potency-indicator" id="potency-indicator"></div>
                    </div>
                    <div class="potency-description" id="potency-description">
                        Enter values to see potency classification
                    </div>
                </div>

                <!-- Clear Button -->
                <button class="clear-button" onclick="clearConverter()">
                    <span class="button-icon">🗑️</span>
                    Clear All
                </button>
            </div>
        </div>
    `;

    setupIC50Converter(container);
}

function setupIC50Converter(container) {
    const $ = q => container.querySelector(q);
    const ic50Input = $('#ic50-input');
    const pic50Input = $('#pic50-input');
    const resultIC50 = $('#result-ic50');
    const resultPIC50 = $('#result-pic50');
    const potencyIndicator = $('#potency-indicator');
    const potencyDescription = $('#potency-description');

    let currentUnit = 'nM';
    let isConverting = false;

    // Unit selector functionality
    const unitButtons = container.querySelectorAll('.unit-button');
    unitButtons.forEach(button => {
        button.addEventListener('click', () => {
            unitButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentUnit = button.dataset.unit;
            if (!isConverting) {
                convertValues();
            }
        });
    });

    // Input event handlers
    ic50Input.addEventListener('input', () => {
        if (!isConverting && ic50Input.value) {
            pic50Input.value = '';
            pic50Input.disabled = true;
            ic50Input.disabled = false;
            convertFromIC50();
        } else if (!ic50Input.value) {
            pic50Input.disabled = false;
            clearResults();
        }
    });

    pic50Input.addEventListener('input', () => {
        if (!isConverting && pic50Input.value) {
            ic50Input.value = '';
            ic50Input.disabled = true;
            pic50Input.disabled = false;
            convertFromPIC50();
        } else if (!pic50Input.value) {
            ic50Input.disabled = false;
            clearResults();
        }
    });

    // Focus effects
    [ic50Input, pic50Input].forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    function convertFromIC50() {
        const ic50Value = parseFloat(ic50Input.value);
        if (!isFinite(ic50Value) || ic50Value <= 0) {
            clearResults();
            return;
        }

        isConverting = true;

        // Convert to molar
        let molarValue;
        switch (currentUnit) {
            case 'nM': molarValue = ic50Value * 1e-9; break;
            case 'µM': molarValue = ic50Value * 1e-6; break;
            case 'mM': molarValue = ic50Value * 1e-3; break;
            default: molarValue = ic50Value * 1e-9;
        }

        const pic50Value = -Math.log10(molarValue);
        const ic50InNM = molarValue * 1e9;

        // Animate results
        animateValue(resultPIC50, 0, pic50Value, 300, 2);
        animateValue(resultIC50, 0, ic50InNM, 300, 2);

        updatePotencyMeter(pic50Value);

        setTimeout(() => {
            isConverting = false;
        }, 350);
    }

    function convertFromPIC50() {
        const pic50Value = parseFloat(pic50Input.value);
        if (!isFinite(pic50Value)) {
            clearResults();
            return;
        }

        isConverting = true;

        const molarValue = Math.pow(10, -pic50Value);
        const ic50InNM = molarValue * 1e9;

        // Animate results
        animateValue(resultIC50, 0, ic50InNM, 300, 2);
        animateValue(resultPIC50, 0, pic50Value, 300, 2);

        updatePotencyMeter(pic50Value);

        setTimeout(() => {
            isConverting = false;
        }, 350);
    }

    function updatePotencyMeter(pic50Value) {
        let position = 0;
        let description = '';
        let className = '';

        if (pic50Value < 5) {
            position = 12.5;
            description = 'Weak inhibitory activity - may require optimization';
            className = 'weak';
        } else if (pic50Value < 7) {
            position = 37.5;
            description = 'Moderate inhibitory activity - promising for further development';
            className = 'moderate';
        } else if (pic50Value < 9) {
            position = 62.5;
            description = 'Strong inhibitory activity - excellent potency';
            className = 'strong';
        } else {
            position = 87.5;
            description = 'Very strong inhibitory activity - exceptionally potent';
            className = 'very-strong';
        }

        potencyIndicator.style.left = position + '%';
        potencyIndicator.className = 'potency-indicator ' + className;
        potencyDescription.textContent = description;
    }

    function animateValue(element, start, end, duration, decimals = 0) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (end - start) * easeOutCubic(progress);
            element.textContent = current.toFixed(decimals);
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function clearResults() {
        resultIC50.textContent = '–';
        resultPIC50.textContent = '–';
        potencyIndicator.style.left = '0%';
        potencyIndicator.className = 'potency-indicator';
        potencyDescription.textContent = 'Enter values to see potency classification';
    }

    window.clearConverter = function() {
        ic50Input.value = '';
        pic50Input.value = '';
        ic50Input.disabled = false;
        pic50Input.disabled = false;
        clearResults();
    };
}

// Global exposure
window.initIC50Converter = initIC50Converter;
