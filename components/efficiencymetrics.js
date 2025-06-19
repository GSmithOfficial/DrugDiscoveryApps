/* Efficiency Metrics Module – split‑pane layout with live results */

function initEfficiencyMetrics(container) {
    container.innerHTML = `
      <div class="tool-section split-pane" id="eff-metrics-pane">
        <!-- ▸▸ Left: input accordions ▸▸ -->
        <div class="inputs-pane">
          <div class="accordion-item open" data-section="lle">
            <button class="accordion-header">Lipophilic Ligand Efficiency (LLE)</button>
            <div class="accordion-content">
              <p>LLE = pIC50 – cLogP</p>
              <div class="input-group">
                <label for="pic50">pIC50</label>
                <input id="pic50" type="number" step="0.01" placeholder="pIC50" />
              </div>
              <div class="input-group">
                <label for="clogp">cLogP</label>
                <input id="clogp" type="number" step="0.01" placeholder="cLogP" />
              </div>
              <button class="calc-btn" data-action="lle">Calculate LLE</button>
            </div>
          </div>
  
          <div class="accordion-item" data-section="le">
            <button class="accordion-header">Ligand Efficiency (LE)</button>
            <div class="accordion-content">
              <p>LE = −1.4 × pIC50 / heavy atoms</p>
              <div class="input-group">
                <label for="pic50-le">pIC50</label>
                <input id="pic50-le" type="number" step="0.01" placeholder="pIC50" />
              </div>
              <div class="input-group">
                <label for="formula-le">Chemical Formula</label>
                <input id="formula-le" type="text" placeholder="e.g. C6H12O6" />
              </div>
              <button class="calc-btn" data-action="le">Calculate LE</button>
            </div>
          </div>
  
          <div class="accordion-item" data-section="ge">
            <button class="accordion-header">Group Efficiency (GE)</button>
            <div class="accordion-content">
              <p>GE = −1.4 × ΔpIC50 / Δ heavy atoms</p>
              <div class="input-group">
                <label for="parent-pic50">Parent pIC50</label>
                <input id="parent-pic50" type="number" step="0.01" />
              </div>
              <div class="input-group">
                <label for="parent-formula">Parent Formula</label>
                <input id="parent-formula" type="text" placeholder="e.g. C6H12O6" />
              </div>
              <div class="input-group">
                <label for="mod-pic50">Modified pIC50</label>
                <input id="mod-pic50" type="number" step="0.01" />
              </div>
              <div class="input-group">
                <label for="mod-formula">Modified Formula</label>
                <input id="mod-formula" type="text" placeholder="e.g. C7H14O6" />
              </div>
              <button class="calc-btn" data-action="ge">Calculate GE</button>
            </div>
          </div>
        </div>
  
        <!-- ▸▸ Right: sticky results pane ▸▸ -->
        <aside class="results-pane" id="eff-metrics-results">
          <div class="metric-card" data-result="lle">
            <h3>LLE</h3>
            <p class="value">–</p>
          </div>
          <div class="metric-card" data-result="le">
            <h3>LE</h3>
            <p class="value">–</p>
          </div>
          <div class="metric-card" data-result="ge">
            <h3>GE</h3>
            <p class="value">–</p>
          </div>
        </aside>
      </div>`;
  
    /* ------- behaviour ------- */
    const pane = container.querySelector('#eff-metrics-pane');
  
    // accordion toggle
    pane.addEventListener('click', (e) => {
      if (e.target.classList.contains('accordion-header')) {
        const item = e.target.parentElement;
        item.classList.toggle('open');
      }
    });
  
    // calculations
    pane.addEventListener('click', (e) => {
      if (!e.target.classList.contains('calc-btn')) return;
      const action = e.target.dataset.action;
  
      switch (action) {
        case 'lle': {
          const pIC50 = parseFloat(pane.querySelector('#pic50').value);
          const clogp = parseFloat(pane.querySelector('#clogp').value);
          if (isFinite(pIC50) && isFinite(clogp)) {
            updateResult('lle', (pIC50 - clogp).toFixed(2));
          }
          break;
        }
        case 'le': {
          const pIC50 = parseFloat(pane.querySelector('#pic50-le').value);
          const formula = pane.querySelector('#formula-le').value.trim();
          const heavy = countHeavyAtoms(formula);
          if (isFinite(pIC50) && heavy > 0) {
            updateResult('le', (-1.4 * pIC50 / heavy).toFixed(3));
          }
          break;
        }
        case 'ge': {
          const pParent = parseFloat(pane.querySelector('#parent-pic50').value);
          const pMod    = parseFloat(pane.querySelector('#mod-pic50').value);
          const fParent = pane.querySelector('#parent-formula').value.trim();
          const fMod    = pane.querySelector('#mod-formula').value.trim();
          const deltaAtoms = countHeavyAtoms(fMod) - countHeavyAtoms(fParent);
          const deltaPIC50 = pMod - pParent;
          if (isFinite(deltaPIC50) && deltaAtoms !== 0) {
            updateResult('ge', (-1.4 * deltaPIC50 / deltaAtoms).toFixed(3));
          }
          break;
        }
      }
    });
  
    function updateResult(key, value) {
      const card = pane.querySelector(`[data-result="${key}"] .value`);
      card.textContent = value;
    }
  
    /** crude heavy‑atom counter (ignores isotope/charge) */
    function countHeavyAtoms(formula) {
      if (!formula) return 0;
      const tokens = formula.match(/([A-Z][a-z]*)(\d*)/g) || [];
      return tokens.reduce((sum, token) => {
        const [, elem, digits] = token.match(/([A-Z][a-z]*)(\d*)/);
        const n = digits ? parseInt(digits, 10) : 1;
        return elem === 'H' ? sum : sum + n;
      }, 0);
    }
  }
  
  /* register in global scope (if using modules, adjust export) */
  