/* Concentration Unit Converter – split‑pane UI, dual unit pills, live sync (2025‑05‑17) */

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
  
          <!-- Concentration row → arrow → output unit pill -->
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
  
        <!-- results side -->
        <aside class="results-pane">
          <div class="metric-card"><h3 id="out-unit-label">ng/mL</h3><p class="value" id="result-conc">–</p></div>
        </aside>
      </div>`;
  
    /* util shortcut */
    const $=s=>container.querySelector(s);
    const mwInput=$('#mw-val');
    const concInput=$('#conc-val');
    const inPill=$('#in-pill');
    const outPill=$('#out-pill');
    const inPop=$('#in-pop');
    const outPop=$('#out-pop');
    const res=$('#result-conc');
    const resLabel=$('#out-unit-label');
  
    /* conversion maps */
    const toMolar={ // multiplier to M
      'nM':v=>v*1e-9,
      'µM':v=>v*1e-6,
      'mM':v=>v*1e-3,
      'ng/mL':(v,mw)=>v*1e-9/mw, // (ng/mL → g/L) / MW
      'mg/mL':(v,mw)=>v*1e-3/mw
    };
    const fromMolar={ // convert M to unit
      'nM':m=>m*1e9,
      'µM':m=>m*1e6,
      'mM':m=>m*1e3,
      'ng/mL':(m,mw)=>m*mw*1e9,
      'mg/mL':(m,mw)=>m*mw*1e3
    };
  
    function calc(){
      const mw=parseFloat(mwInput.value);
      const val=parseFloat(concInput.value);
      const inUnit=inPill.dataset.unit;
      const outUnit=outPill.dataset.unit;
  
      if(isNaN(val)|| (isMassUnit(inUnit)||isMassUnit(outUnit)?isNaN(mw)||mw<=0:false)){
        res.textContent='–';
        return;
      }
      // to molar
      const molar=toMolar[inUnit](val,mw);
      const out=fromMolar[outUnit](molar,mw);
      res.textContent=parseFloat(out.toPrecision(6));
      resLabel.textContent=outUnit;
    }
  
    const isMassUnit=u=>u.includes('/');
  
    /* pill popover wiring (reuse helper) */
    function pillToggle(pill,pop){const open=pill.getAttribute('aria-expanded')==='true';pill.setAttribute('aria-expanded',!open);pop.hidden=open;}
    inPill.addEventListener('click',()=>pillToggle(inPill,inPop));
    outPill.addEventListener('click',()=>pillToggle(outPill,outPop));
    function pickUnit(e,pill,pop){if(!e.target.dataset.unit) return; pill.dataset.unit=e.target.dataset.unit; pill.textContent=`${e.target.dataset.unit} ▼`; pill.setAttribute('aria-expanded','false'); pop.hidden=true; calc();}
    inPop.addEventListener('click',e=>pickUnit(e,inPill,inPop));
    outPop.addEventListener('click',e=>pickUnit(e,outPill,outPop));
    document.addEventListener('click',e=>{[inPop,outPop].forEach(pop=>{const pill=pop.previousElementSibling; if(!pop.hidden&&!pop.contains(e.target)&&e.target!==pill){pop.hidden=true;pill.setAttribute('aria-expanded','false');}})});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){[inPop,outPop].forEach(pop=>{pop.hidden=true; pop.previousElementSibling.setAttribute('aria-expanded','false');});}});
  
    /* live calc events */
    [mwInput,concInput].forEach(el=>el.addEventListener('input',calc));
  }
  