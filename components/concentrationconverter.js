// ================================================================
// Concentration Unit Converter - Enhanced Version (2025)
// ---------------------------------------------------------------- 
// Modern UI enhancements applied to the original component
// ================================================================

window.initConcentrationConverter = function(container) {
  // Enhanced HTML template with modern styling
  container.innerHTML = `
    <div class="tool-card">
      <div class="tool-header">
        <h3>🧪 Concentration Unit Converter</h3>
        <p>Convert between mass and molar concentration units using molecular weight.</p>
      </div>

      <div class="split-pane">
        <div class="inputs-pane">
          <!-- Molecular Weight Input -->
          <div class="input-group">
            <label for="mw-val">Molecular Weight (g/mol)</label>
            <input 
              type="number" 
              id="mw-val" 
              placeholder="Enter molecular weight..."
              min="1"
              step="0.01"
              required
            />
          </div>

          <!-- Concentration Converter Layout -->
          <div class="converter-layout">
            <div class="input-group">
              <label for="conc-val">Input Concentration</label>
              <div class="input-with-select pill-mode">
                <input 
                  type="number" 
                  id="conc-val" 
                  placeholder="Enter value..."
                  step="any"
                  required
                />
                <button 
                  type="button" 
                  class="unit-pill" 
                  id="in-pill" 
                  data-unit="nM"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  nM ▼
                </button>
                <div class="unit-popover" id="in-pop" hidden role="menu">
                  <button type="button" data-unit="nM" role="menuitem">nM</button>
                  <button type="button" data-unit="µM" role="menuitem">µM</button>
                  <button type="button" data-unit="mM" role="menuitem">mM</button>
                  <button type="button" data-unit="ng/mL" role="menuitem">ng/mL</button>
                  <button type="button" data-unit="mg/mL" role="menuitem">mg/mL</button>
                </div>
              </div>
            </div>

            <div class="operator">→</div>

            <div class="input-group">
              <label for="out-unit">Output Unit</label>
              <div class="pill-only">
                <button 
                  type="button" 
                  class="unit-pill" 
                  id="out-pill" 
                  data-unit="µM"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  µM ▼
                </button>
                <div class="unit-popover" id="out-pop" hidden role="menu">
                  <button type="button" data-unit="nM" role="menuitem">nM</button>
                  <button type="button" data-unit="µM" role="menuitem">µM</button>
                  <button type="button" data-unit="mM" role="menuitem">mM</button>
                  <button type="button" data-unit="ng/mL" role="menuitem">ng/mL</button>
                  <button type="button" data-unit="mg/mL" role="menuitem">mg/mL</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <button type="button" id="calculate-btn" class="btn-primary">
            <span class="btn-icon">🧮</span>
            Calculate Conversion
          </button>
        </div>

        <div class="results-pane">
          <div class="metric-card result-card">
            <h3>Converted Value</h3>
            <div class="value" id="result-conc">–</div>
            <div class="unit-label" id="out-unit-label">µM</div>
          </div>

          <div class="metric-card info-card">
            <h3>Conversion Factor</h3>
            <div class="value conversion-factor" id="conversion-factor">–</div>
          </div>

          <div class="metric-card info-card">
            <h3>Formula Used</h3>
            <div class="formula-display" id="formula-display">
              <small>Select units to see formula</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ─── ENHANCED SELECTORS ─── 
  const $ = s => container.querySelector(s);
  const mwInput = $('#mw-val');
  const concInput = $('#conc-val');
  const inPill = $('#in-pill');
  const outPill = $('#out-pill');
  const inPop = $('#in-pop');
  const outPop = $('#out-pop');
  const resultDisplay = $('#result-conc');
  const resultLabel = $('#out-unit-label');
  const calculateBtn = $('#calculate-btn');
  const conversionFactorDisplay = $('#conversion-factor');
  const formulaDisplay = $('#formula-display');

  // ─── CONVERSION CONSTANTS ─── 
  const toMolar = {
    'nM': v => v * 1e-9,
    'µM': v => v * 1e-6,
    'mM': v => v * 1e-3,
    'ng/mL': (v, mw) => v * 1e-9 / mw,
    'mg/mL': (v, mw) => v * 1e-3 / mw
  };

  const fromMolar = {
    'nM': m => m * 1e9,
    'µM': m => m * 1e6,
    'mM': m => m * 1e3,
    'ng/mL': (m, mw) => m * mw * 1e9,
    'mg/mL': (m, mw) => m * mw * 1e3
  };

  const isMassUnit = unit => unit.includes('/');

  // ─── ENHANCED CALCULATION FUNCTION ─── 
  function calculate() {
    // Get values
    const mw = parseFloat(mwInput.value);
    const concValue = parseFloat(concInput.value);
    const inputUnit = inPill.dataset.unit;
    const outputUnit = outPill.dataset.unit;

    // Enhanced validation
    const isMwRequired = isMassUnit(inputUnit) || isMassUnit(outputUnit);

    if (isNaN(concValue) || concValue <= 0) {
      showError('Please enter a valid concentration value');
      return;
    }

    if (isMwRequired && (isNaN(mw) || mw <= 0)) {
      showError('Molecular weight is required for mass/volume units');
      return;
    }

    try {
      // Show loading state
      if (window.UIEnhancements) {
        window.UIEnhancements.showLoading(calculateBtn);
      }

      // Convert to molar first
      const molarValue = toMolar[inputUnit](concValue, mw);

      // Convert from molar to output unit
      const result = fromMolar[outputUnit](molarValue, mw);

      // Calculate conversion factor
      const factor = result / concValue;

      // Update displays with animation
      setTimeout(() => {
        updateResults(result, outputUnit, factor, inputUnit, outputUnit);

        if (window.UIEnhancements) {
          window.UIEnhancements.hideLoading(calculateBtn);
          window.UIEnhancements.showResultSuccess(resultDisplay);
        }
      }, 200);

    } catch (error) {
      console.error('Calculation error:', error);
      showError('Calculation failed. Please check your inputs.');
    }
  }

  // ─── RESULT DISPLAY FUNCTIONS ─── 
  function updateResults(result, unit, factor, inputUnit, outputUnit) {
    // Format result with appropriate precision
    const formattedResult = formatNumber(result);
    const formattedFactor = formatNumber(factor);

    resultDisplay.textContent = formattedResult;
    resultLabel.textContent = unit;
    conversionFactorDisplay.textContent = formattedFactor;

    // Update formula display
    updateFormulaDisplay(inputUnit, outputUnit);

    // Clear any error states
    clearError();
  }

  function formatNumber(num) {
    if (num === 0) return '0';
    if (num < 0.001) return num.toExponential(3);
    if (num > 1000000) return num.toExponential(3);
    return parseFloat(num.toPrecision(6)).toString();
  }

  function updateFormulaDisplay(inputUnit, outputUnit) {
    const isMwNeeded = isMassUnit(inputUnit) || isMassUnit(outputUnit);
    let formula = '';

    if (isMwNeeded) {
      if (isMassUnit(inputUnit) && !isMassUnit(outputUnit)) {
        formula = `Molarity = (${inputUnit} ÷ MW) × conversion factor`;
      } else if (!isMassUnit(inputUnit) && isMassUnit(outputUnit)) {
        formula = `${outputUnit} = Molarity × MW × conversion factor`;
      } else {
        formula = `${outputUnit} = (${inputUnit} ÷ MW₁) × MW₂ × factors`;
      }
    } else {
      formula = `${outputUnit} = ${inputUnit} × conversion factor`;
    }

    formulaDisplay.innerHTML = `<small>${formula}</small>`;
  }

  function showError(message) {
    resultDisplay.textContent = 'Error';
    resultDisplay.className = 'value error';
    formulaDisplay.innerHTML = `<small class="error-text">${message}</small>`;

    if (window.UIEnhancements) {
      window.UIEnhancements.hideLoading(calculateBtn);
    }
  }

  function clearError() {
    resultDisplay.className = 'value';
    formulaDisplay.querySelector('.error-text')?.remove();
  }

  // ─── POPOVER HANDLERS ─── 
  function togglePopover(pill, popover) {
    const isOpen = pill.getAttribute('aria-expanded') === 'true';
    pill.setAttribute('aria-expanded', !isOpen);
    popover.hidden = isOpen;

    // Close other popovers
    if (!isOpen) {
      [inPop, outPop].forEach(pop => {
        if (pop !== popover) {
          pop.hidden = true;
          pop.previousElementSibling.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  function selectUnit(pill, popover, unit) {
    pill.dataset.unit = unit;
    pill.textContent = `${unit} ▼`;
    popover.hidden = true;
    pill.setAttribute('aria-expanded', 'false');

    // Update result label if this is output unit
    if (pill === outPill) {
      resultLabel.textContent = unit;
    }

    // Auto-calculate if all inputs are valid
    if (concInput.value && (mwInput.value || (!isMassUnit(inPill.dataset.unit) && !isMassUnit(outPill.dataset.unit)))) {
      calculate();
    }
  }

  // ─── EVENT LISTENERS ─── 

  // Pill button clicks
  inPill.addEventListener('click', () => togglePopover(inPill, inPop));
  outPill.addEventListener('click', () => togglePopover(outPill, outPop));

  // Unit selection
  inPop.addEventListener('click', e => {
    if (e.target.dataset.unit) {
      selectUnit(inPill, inPop, e.target.dataset.unit);
    }
  });

  outPop.addEventListener('click', e => {
    if (e.target.dataset.unit) {
      selectUnit(outPill, outPop, e.target.dataset.unit);
    }
  });

  // Calculate button
  calculateBtn.addEventListener('click', calculate);

  // Live calculation on input
  [mwInput, concInput].forEach(input => {
    input.addEventListener('input', () => {
      // Clear previous results while typing
      if (input.value === '') {
        resultDisplay.textContent = '–';
        conversionFactorDisplay.textContent = '–';
        formulaDisplay.innerHTML = '<small>Enter values to see calculation</small>';
      }

      // Debounced calculation
      clearTimeout(input.calcTimeout);
      input.calcTimeout = setTimeout(() => {
        if (input.value && concInput.value) {
          calculate();
        }
      }, 500);
    });

    // Validation on blur
    input.addEventListener('blur', () => {
      if (window.UIEnhancements) {
        const min = input.getAttribute('min') ? parseFloat(input.getAttribute('min')) : null;
        window.UIEnhancements.validateNumericInput(input, min);
      }
    });
  });

  // Close popovers on outside click
  document.addEventListener('click', e => {
    [inPop, outPop].forEach(popover => {
      const pill = popover.previousElementSibling;
      if (!popover.hidden && !popover.contains(e.target) && e.target !== pill) {
        popover.hidden = true;
        pill.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      [inPop, outPop].forEach(popover => {
        popover.hidden = true;
        popover.previousElementSibling.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // ─── INITIALIZATION ─── 
  console.log('🧪 Enhanced Concentration Converter loaded');

  // Set initial formula display
  updateFormulaDisplay(inPill.dataset.unit, outPill.dataset.unit);

  // Focus first input
  setTimeout(() => concInput.focus(), 100);
};
