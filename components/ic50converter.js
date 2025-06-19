/* IC50 ↔ pIC50 Converter – inline pill, live sync, no convert button (2025‑05‑17) */

function initIC50Converter(container) {
    container.innerHTML = `
      <div class="tool-section split-pane" id="ic50-pane">
        <div class="inputs-pane">
          <h3>IC50 ↔ pIC50 Converter</h3>
          <p class="description">Convert between IC50 and pIC50 values for enzyme inhibition studies.</p>
  
          <div class="converter-layout pill-layout">
            <div class="input-group">
              <label for="ic50-val">IC50</label>
              <div class="input-with-select pill-mode">
                <input id="ic50-val" type="number" step="0.0001" placeholder="Enter IC50" />
                <button id="unit-pill" class="unit-pill" aria-haspopup="true" aria-expanded="false" data-unit="nM">nM ▼</button>
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
        </div>
  
        <aside class="results-pane">
          <div class="metric-card"><h3>pIC50</h3><p class="value" id="result-pic50">–</p></div>
          <div class="metric-card"><h3>IC50 (nM)</h3><p class="value" id="result-ic50">–</p></div>
        </aside>
      </div>`;
  
    /* ─── Helpers ─── */
    const $ = (s) => container.querySelector(s);
    const ic50Input  = $('#ic50-val');
    const pic50Input = $('#pic50-val');
    const unitPill   = $('#unit-pill');
    const popover    = $('#unit-popover');
    const resPic50   = $('#result-pic50');
    const resIC50    = $('#result-ic50');
  
    const toMolar = (v,u)=>u==='nM'?v*1e-9:u==='µM'?v*1e-6:u==='mM'?v*1e-3:NaN;
    const nm = (m)=>m*1e9;
  
    function update() {
      const unit = unitPill.dataset.unit;
      const ic   = parseFloat(ic50Input.value);
      const pic  = parseFloat(pic50Input.value);
  
      let outPic = '–', outIC='–';
  
      if (!isNaN(ic)) {
        // IC50 provided
        const mol = toMolar(ic,unit);
        if (mol>0){outPic=(-Math.log10(mol)).toFixed(2);outIC=nm(mol).toFixed(2);} 
        pic50Input.disabled=true; ic50Input.disabled=false;
      } else if (!isNaN(pic)) {
        const mol=Math.pow(10,-pic);
        outIC=nm(mol).toFixed(2);outPic=pic.toFixed(2);
        ic50Input.disabled=true; pic50Input.disabled=false;
      } else {
        ic50Input.disabled=false; pic50Input.disabled=false;
      }
  
      resPic50.textContent=outPic; resIC50.textContent=outIC;
    }
  
    /* ─── Events ─── */
    ic50Input.addEventListener('input',()=>{if(ic50Input.value) pic50Input.value=''; update();});
    pic50Input.addEventListener('input',()=>{if(pic50Input.value) ic50Input.value=''; update();});
  
    unitPill.addEventListener('click',()=>{
      const exp=unitPill.getAttribute('aria-expanded')==='true';
      unitPill.setAttribute('aria-expanded',!exp); popover.hidden=exp;
    });
    popover.addEventListener('click',(e)=>{
      if(!e.target.dataset.unit) return;
      const u=e.target.dataset.unit;
      unitPill.textContent=`${u} ▼`; unitPill.dataset.unit=u;
      popover.hidden=true; unitPill.setAttribute('aria-expanded','false');
      update();
    });
    document.addEventListener('click',(e)=>{if(!popover.contains(e.target)&&e.target!==unitPill){popover.hidden=true; unitPill.setAttribute('aria-expanded','false');}});
    document.addEventListener('keydown',(e)=>{if(e.key==='Escape'){popover.hidden=true; unitPill.setAttribute('aria-expanded','false');}});
  }
  