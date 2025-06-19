/* Concentration Unit Converter – split‑pane UI, dual unit pills, live sync  (bug‑fix 2025‑05‑17)
   ▸ Fixes: output pill width & click, wrapper div .pill-only                           */

   function initConcentrationConverter(container) {
    container.innerHTML = `
      <div class="tool-section split-pane" id="conc-pane">
        <div class="inputs-pane">
          <h3>Concentration Unit Converter</h3>
          <p class="description">Convert between mass and molar concentration units using molecular weight.</p>
  
          <!-- MW row -->
          <div class="input-group">
            <label for="mw-val">Molecular Weight (g/mol)</label>
            <input id="mw-val" type="number" step="0.01" placeholder="Enter MW" />
          </div>
  
          <!-- Concentration row with input pill + output pill -->
          <div class="converter-layout pill-layout" id="conc-row">
            <div class="input-group">
              <label for="conc-val">Input Concentration</label>
              <div class="input-with-select pill-mode">
                <input id="conc-val" type="number" step="0.0001" placeholder="Enter value" />
                <button id="in-pill" class="unit-pill" aria-haspopup="true" aria-expanded="false" data-unit="nM">nM ▼</button>
                <div id="in-pop" class="unit-popover" role="menu" hidden>
                  <button data-unit="nM">nM</button>
                  <button data-unit="µM">µM</button>
                  <button data-unit="mM">mM</button>
                  <button data-unit="ng/mL">ng/mL</button>
                  <button data-unit="mg/mL">mg/mL</button>
                </div>
              </div>
            </div>
  
            <span class="operator">→</span>
  
            <div class="input-group">
              <label for="out-pill">Output Unit</label>
              <div class="pill-only">
                <button id="out-pill" class="unit-pill" aria-haspopup="true" aria-expanded="false" data-unit="ng/mL">ng/mL ▼</button>
                <div id="out-pop" class="unit-popover" role="menu" hidden>
                  <button data-unit="nM">nM</button>
                  <button data-unit="µM">µM</button>
                  <button data-unit="mM">mM</button>
                  <button data-unit="ng/mL">ng/mL</button>
                  <button data-unit="mg/mL">mg/mL</button>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Results side -->
        <aside class="results-pane">
          <div class="metric-card"><h3 id="out-unit-label">ng/mL</h3><p class="value" id="result-conc">–</p></div>
        </aside>
      </div>`;
  
    /* ---------- helpers ---------- */
    const $ = s => container.querySelector(s);
    const mwInput  = $('#mw-val');
    const concInput= $('#conc-val');
    const inPill   = $('#in-pill');
    const outPill  = $('#out-pill');
    const inPop    = $('#in-pop');
    const outPop   = $('#out-pop');
    const res      = $('#result-conc');
    const resLbl   = $('#out-unit-label');
  
    const toM = {
      'nM': v=>v*1e-9,
      'µM': v=>v*1e-6,
      'mM': v=>v*1e-3,
      'ng/mL': (v,m)=>v*1e-9/m,
      'mg/mL': (v,m)=>v*1e-3/m
    };
    const fromM = {
      'nM': m=>m*1e9,
      'µM': m=>m*1e6,
      'mM': m=>m*1e3,
      'ng/mL': (m,mw)=>m*mw*1e9,
      'mg/mL': (m,mw)=>m*mw*1e3
    };
    const isMass = u=>u.includes('/');
  
    function calc() {
      const mw=parseFloat(mwInput.value);
      const val=parseFloat(concInput.value);
      const inU=inPill.dataset.unit;
      const outU=outPill.dataset.unit;
  
      if(isNaN(val)|| (isMass(inU)||isMass(outU)?(isNaN(mw)||mw<=0):false)){
        res.textContent='–';
        return;
      }
      const mol= toM[inU](val,mw);
      const out= fromM[outU](mol,mw);
      res.textContent=parseFloat(out.toPrecision(9)).toString();
      resLbl.textContent=outU;
    }
  
    /* Popover handlers */
    function toggle(pill,pop){const open=pill.getAttribute('aria-expanded')==='true';pill.setAttribute('aria-expanded',!open);pop.hidden=open;}
    function pick(e,pill,pop){if(!e.target.dataset.unit) return; pill.dataset.unit=e.target.dataset.unit; pill.textContent=`${e.target.dataset.unit} ▼`; pop.hidden=true; pill.setAttribute('aria-expanded','false'); calc();}
  
    inPill.addEventListener('click',()=>toggle(inPill,inPop));
    outPill.addEventListener('click',()=>toggle(outPill,outPop));
    inPop.addEventListener('click',e=>pick(e,inPill,inPop));
    outPop.addEventListener('click',e=>pick(e,outPill,outPop));
    document.addEventListener('click',e=>{[inPop,outPop].forEach(pop=>{const pill=pop.previousElementSibling; if(!pop.hidden&&!pop.contains(e.target)&&e.target!==pill){pop.hidden=true; pill.setAttribute('aria-expanded','false');}})});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){[inPop,outPop].forEach(pop=>{pop.hidden=true; pop.previousElementSibling.setAttribute('aria-expanded','false');});}});
  
    /* live calc */
    [mwInput, concInput].forEach(el=>el.addEventListener('input', calc));
  }
  