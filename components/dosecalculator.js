/* In‑Vivo Dose Calculator – split‑pane UI, live results (2025‑05‑17)
   ------------------------------------------------------------------
   ▸ Replaces button‑based form with instant calculations
   ▸ Handles subject weight map + custom weight validation
   ▸ Shows two metric cards: total compound (mg) and per‑subject per‑day (mg)
*/

function initDoseCalculator(container) {
    container.innerHTML = `
      <div class="tool-section split-pane" id="dose-pane">
        <div class="inputs-pane">
          <h3>In‑Vivo Dose Calculator</h3>
          <p class="description">Calculate the total amount of compound required for an in‑vivo study.</p>
  
          <!-- Subject selector -->
          <div class="input-group">
            <label for="subject-type">Subject Type</label>
            <select id="subject-type">
              <option value="mouse">Mouse (20 g)</option>
              <option value="rat">Rat (250 g)</option>
              <option value="dog">Dog (12 kg)</option>
              <option value="monkey">Monkey (5 kg)</option>
              <option value="human">Human (85 kg)</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div class="input-group" id="custom-weight-row" hidden>
            <label for="custom-weight">Custom Weight (kg)</label>
            <input id="custom-weight" type="number" step="0.001" placeholder="e.g. 2.5" />
          </div>
  
          <!-- Study design -->
          <div class="input-group">
            <label for="subject-count">Number of Subjects</label>
            <input id="subject-count" type="number" min="1" step="1" placeholder="Enter number" />
          </div>
  
          <div class="input-group">
            <label for="dose-value">Dose (mg/kg)</label>
            <input id="dose-value" type="number" step="0.01" placeholder="Enter dose" />
          </div>
  
          <div class="input-group pill-layout" id="schedule-row">
            <div class="input-group">
              <label for="schedule">Dosing Schedule</label>
              <select id="schedule">
                <option value="1">Once daily</option>
                <option value="2">Twice daily</option>
                <option value="3">Three times daily</option>
              </select>
            </div>
            <div class="input-group">
              <label for="study-days">Number of Days</label>
              <input id="study-days" type="number" min="1" value="1" />
            </div>
          </div>
        </div>
  
        <!-- Results side -->
        <aside class="results-pane">
          <div class="metric-card"><h3>Total Compound (mg)</h3><p class="value" id="total-mg">–</p></div>
          <div class="metric-card"><h3>Per Subject · Day (mg)</h3><p class="value" id="per-mg">–</p></div>
        </aside>
      </div>`;
  
    /* ---------- element refs ---------- */
    const $ = q => container.querySelector(q);
    const selType  = $('#subject-type');
    const customRow= $('#custom-weight-row');
    const customWt = $('#custom-weight');
    const nSubj    = $('#subject-count');
    const doseVal  = $('#dose-value');
    const schedSel = $('#schedule');
    const daysInp  = $('#study-days');
    const outTot   = $('#total-mg');
    const outPer   = $('#per-mg');
  
    /* subject weight map (kg) */
    const weights = { mouse:0.02, rat:0.25, dog:12, monkey:5, human:85 };
  
    /* ---------- UI interactivity ---------- */
    selType.addEventListener('change', () => {
      customRow.hidden = selType.value !== 'custom';
      calc();
    });
    [customWt,nSubj,doseVal,schedSel,daysInp].forEach(el=>el.addEventListener('input', calc));
    selType.addEventListener('input', calc);
  
    function getWeight() {
      if (selType.value === 'custom') {
        const w = parseFloat(customWt.value);
        return isFinite(w) && w>0 ? w : NaN;
      }
      return weights[selType.value];
    }
  
    function calc() {
      /* gather inputs */
      const weight = getWeight();
      const count  = parseInt(nSubj.value,10);
      const dose   = parseFloat(doseVal.value); // mg/kg
      const freq   = parseInt(schedSel.value,10);
      const days   = parseInt(daysInp.value,10);
  
      const valid = isFinite(weight) && weight>0 && isFinite(count) && count>0 && isFinite(dose) && dose>0 && isFinite(freq) && freq>0 && isFinite(days) && days>0;
  
      if (!valid) {
        outTot.textContent = '–';
        outPer.textContent = '–';
        return;
      }
  
      const perSubjectPerDose = weight * dose;          // mg per dose per subject
      const perSubjectPerDay  = perSubjectPerDose * freq;
      const total             = perSubjectPerDay * days * count;
  
      outPer.textContent = perSubjectPerDay.toFixed(2);
      outTot.textContent = total.toFixed(2);
    }
  }
  
  /* expose globally */
  window.initDoseCalculator = initDoseCalculator;
  