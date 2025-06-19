/* IC50 ↔ pIC50 Converter – split‑pane UI with live metric cards */

function initIC50Converter(container) {
    container.innerHTML = `
      <div class="tool-section split-pane" id="ic50-pane">
        <!-- ▸ Inputs pane ▸ -->
        <div class="inputs-pane">
          <h3>IC50 ↔ pIC50 Converter</h3>
          <p class="description">Convert between IC50 and pIC50 values for enzyme inhibition studies.</p>
  
          <div class="converter-layout">
            <div class="input-group">
              <label for="ic50-val">IC50</label>
              <div class="input-with-select">
                <input id="ic50-val" type="number" step="0.0001" placeholder="Enter IC50" />
                <select id="ic50-unit">
                  <option value="nM">nM</option>
                  <option value="µM">µM</option>
                  <option value="mM">mM</option>
                </select>
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
  
        <!-- ▸ Sticky results pane ▸ -->
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
  
    /* ------- calculations ------- */
    const $ = (sel) => container.querySelector(sel);
  
    $('#ic50-convert-btn').addEventListener('click', () => {
      const ic50Input = parseFloat($('#ic50-val').value);
      const unit      = $('#ic50-unit').value;
      const pIC50In   = parseFloat($('#pic50-val').value);
  
      // Conversion helpers
      const toMolar = (value, unit) => {
        switch (unit) {
          case 'nM': return value * 1e-9;
          case 'µM': return value * 1e-6;
          case 'mM': return value * 1e-3;
          default:   return NaN;
        }
      };
      const molarToNM = (valueM) => valueM * 1e9;
  
      let pic50Out = '–';
      let ic50Out  = '–';
  
      if (!isNaN(ic50Input)) {
        // User entered IC50 → compute pIC50
        const ic50M = toMolar(ic50Input, unit);
        if (ic50M > 0) {
          pic50Out = (-Math.log10(ic50M)).toFixed(2);
          ic50Out  = molarToNM(ic50M).toFixed(2);
        }
      } else if (!isNaN(pIC50In)) {
        // User entered pIC50 → compute IC50 in nM
        const ic50M = Math.pow(10, -pIC50In);
        ic50Out  = molarToNM(ic50M).toFixed(2);
        pic50Out = pIC50In.toFixed(2);
      }
  
      $('#result-pic50').textContent = pic50Out;
      $('#result-ic50').textContent  = ic50Out;
    });
  }
  
  /* If using modules, export here; otherwise global is fine within the project. */
  