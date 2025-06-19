/* IC50 ↔ pIC50 Converter – split‑pane UI with inline unit pill & live sync (2025‑05‑16) */

/**
 * Public API used by full‑page.js:
 *   initIC50Converter(container: HTMLElement): void
 */

function initIC50Converter(container) {
    container.innerHTML = `
      <div class="tool-section split-pane" id="ic50-pane">
        <!-- ─── Inputs side ─── -->
        <div class="inputs-pane">
          <h3>IC50 ↔ pIC50 Converter</h3>
          <p class="description">Convert between IC50 and pIC50 values for enzyme inhibition studies.</p>
  
          <div class="converter-layout" id="ic50-row">
            <div class="input-group">
              <label for="ic50-val">IC50</label>
              <div class="input-with-select pill-mode">
                <input id="ic50-val" type="number" step="0.0001" placeholder="Enter IC50" />
                <button id="unit-pill" class="unit-pill" aria-haspopup="true" aria-expanded="false">nM ▼</button>
                <div id="unit-popover" class="unit-popover" role="menu" aria-label="Select unit">
                  <button data-unit="nM" role="menuitem">nM</button>
                  <button data-unit="µM" role="menuitem">µM</button>
                  <button data-unit="mM" role="menuitem">mM</button>
                </div>
              </div>
            </div>
  
            <span class="operator">↔</span>
  
            <div class="input-group">
              <label for="pic50-val">pIC50</label>
              <input id="pic50-val" type="number" step="0.01" placeholder="Enter pIC50" />
            </div>
          </div>
  
          <button class="calc-btn" id="ic50-convert-btn">Convert</button>
        </div>
  
        <!-- ─── Results side ─── -->
        <aside class="results-pane">
          <div class="metric-card">
            <h3>pIC50</h3>
            <p class="value" id="result-pic50">–</p>
          </div>
          <div class="metric-card">
            <h3>IC50 (nM)</h3>
            <p class="value" id="result-ic50">–</p>
          </div>
        </aside>
      </div>`;
  
    /* ---------------- util ---------------- */
    const $ = (sel) => container.querySelector(sel);
    const ic50Input   = $('#ic50-val');
    const pic50Input  = $('#pic50-val');
    const unitPill    = $('#unit-pill');
    const popover     = $('#unit-popover');
    const resultPic50 = $('#result-pic50');
    const resultIC50  = $('#result-ic50');
  
    /* ----------- conversion helpers ----------- */
    const toMolar = (value, unit) => {
      switch (unit) {
        case 'nM': return value * 1e-9;
        case 'µM': return value * 1e-6;
        case 'mM': return value * 1e-3;
        default:   return NaN;
      }
    };
    const molarToNM = (m) => m * 1e9;
  
    function calculate() {
      const unit = unitPill.dataset.unit || 'nM';
      const ic50Val = parseFloat(ic50Input.value);
      const pic50Val = parseFloat(pic50Input.value);
  
      let pic50Out = '–';
      let ic50Out  = '–';
  
      if (!isNaN(ic50Val)) {
        // IC50 → pIC50
        const molar = toMolar(ic50Val, unit);
        if (molar > 0) {
          pic50Out = (-Math.log10(molar)).toFixed(2);
          ic50Out  = molarToNM(molar).toFixed(2);
          pic50Input.placeholder = pic50Out;
        }
      } else if (!isNaN(pic50Val)) {
        // pIC50 → IC50
        const molar = Math.pow(10, -pic50Val);
        ic50Out  = molarToNM(molar).toFixed(2);
        pic50Out = pic50Val.toFixed(2);
        ic50Input.placeholder = ic50Out;
      }
  
      resultPic50.textContent = pic50Out;
      resultIC50.textContent  = ic50Out;
    }
  
    /* ---------- event wiring ---------- */
    [ic50Input, pic50Input].forEach(el => el.addEventListener('input', calculate));
    $('#ic50-convert-btn').addEventListener('click', calculate);
  
    // Unit pill popover
    unitPill.addEventListener('click', () => {
      const expanded = unitPill.getAttribute('aria-expanded') === 'true';
      unitPill.setAttribute('aria-expanded', !expanded);
      popover.hidden = expanded;
    });
    popover.addEventListener('click', (e) => {
      if (!e.target.dataset.unit) return;
      const unit = e.target.dataset.unit;
      unitPill.textContent = `${unit} ▼`;
      unitPill.dataset.unit = unit;
      unitPill.setAttribute('aria-expanded', 'false');
      popover.hidden = true;
      calculate();
    });
    // Close popover on Esc / outside click
    document.addEventListener('keydown', (e)=>{if(e.key==='Escape'){popover.hidden=true;unitPill.setAttribute('aria-expanded','false')}});
    document.addEventListener('click',(e)=>{if(!popover.contains(e.target)&&e.target!==unitPill){popover.hidden=true;unitPill.setAttribute('aria-expanded','false')}});
  }
  