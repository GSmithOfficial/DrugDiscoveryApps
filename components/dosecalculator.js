
/* Enhanced Dose Calculator with Modern UI */

function initDoseCalculator(container) {
    container.innerHTML = `
        <div class="tool-container">
            <div class="tool-header">
                <h3>💊 In-Vivo Dose Calculator</h3>
                <p class="tool-description">Calculate the total amount of compound required for an in-vivo study</p>
            </div>

            <div class="calculator-grid">
                <!-- Subject Configuration -->
                <div class="input-section">
                    <h4 class="section-title">Subject Configuration</h4>

                    <div class="input-group">
                        <label for="subject-type">Subject Type</label>
                        <select id="subject-type" class="form-select">
                            <option value="mouse">Mouse (20 g)</option>
                            <option value="rat">Rat (250 g)</option>
                            <option value="dog">Dog (12 kg)</option>
                            <option value="monkey">Monkey (5 kg)</option>
                            <option value="human">Human (85 kg)</option>
                            <option value="custom">Custom Weight</option>
                        </select>
                    </div>

                    <div class="input-group" id="custom-weight-row" hidden>
                        <label for="custom-weight">Custom Weight (kg)</label>
                        <input id="custom-weight" type="number" step="0.001" placeholder="Enter weight in kg" class="form-input">
                    </div>

                    <div class="input-group">
                        <label for="subject-count">Number of Subjects</label>
                        <input id="subject-count" type="number" min="1" placeholder="Enter number of subjects" class="form-input">
                    </div>
                </div>

                <!-- Dosing Configuration -->
                <div class="input-section">
                    <h4 class="section-title">Dosing Configuration</h4>

                    <div class="input-group">
                        <label for="dose-value">Dose (mg/kg)</label>
                        <input id="dose-value" type="number" step="0.01" placeholder="Enter dose in mg/kg" class="form-input">
                    </div>

                    <div class="input-group">
                        <label for="schedule">Dosing Schedule</label>
                        <select id="schedule" class="form-select">
                            <option value="1">Once daily</option>
                            <option value="2">Twice daily</option>
                            <option value="3">Three times daily</option>
                        </select>
                    </div>

                    <div class="input-group">
                        <label for="study-days">Number of Days</label>
                        <input id="study-days" type="number" min="1" placeholder="Enter study duration" class="form-input">
                    </div>
                </div>

                <!-- Results Display -->
                <div class="results-section">
                    <h4 class="section-title">Calculation Results</h4>

                    <div class="result-cards">
                        <div class="result-card primary">
                            <div class="result-label">Total Compound Required</div>
                            <div class="result-value" id="total-mg">–</div>
                            <div class="result-unit">mg</div>
                        </div>

                        <div class="result-card secondary">
                            <div class="result-label">Per Subject · Per Day</div>
                            <div class="result-value" id="per-mg">–</div>
                            <div class="result-unit">mg</div>
                        </div>
                    </div>

                    <div class="calculation-info">
                        <small>Calculations are based on: (Weight × Dose × Frequency × Days × Subjects)</small>
                    </div>
                </div>
            </div>
        </div>
    `;

    /* ---------- Element References ---------- */
    const $ = q => container.querySelector(q);
    const selType = $('#subject-type');
    const customRow = $('#custom-weight-row');
    const customWt = $('#custom-weight');
    const nSubj = $('#subject-count');
    const doseVal = $('#dose-value');
    const schedSel = $('#schedule');
    const daysInp = $('#study-days');
    const outTot = $('#total-mg');
    const outPer = $('#per-mg');

    /* Subject weight map (kg) */
    const weights = { mouse: 0.02, rat: 0.25, dog: 12, monkey: 5, human: 85 };

    /* ---------- UI Interactivity ---------- */
    selType.addEventListener('change', () => {
        customRow.hidden = selType.value !== 'custom';
        customRow.classList.toggle('active', selType.value === 'custom');
        calc();
    });

    [customWt, nSubj, doseVal, schedSel, daysInp].forEach(el => {
        el.addEventListener('input', () => {
            calc();
            // Add visual feedback for active calculations
            el.classList.add('calculating');
            setTimeout(() => el.classList.remove('calculating'), 200);
        });
    });

    selType.addEventListener('input', calc);

    function getWeight() {
        if (selType.value === 'custom') {
            const w = parseFloat(customWt.value);
            return isFinite(w) && w > 0 ? w : NaN;
        }
        return weights[selType.value];
    }

    function calc() {
        /* Gather inputs */
        const weight = getWeight();
        const count = parseInt(nSubj.value, 10);
        const dose = parseFloat(doseVal.value); // mg/kg
        const freq = parseInt(schedSel.value, 10);
        const days = parseInt(daysInp.value, 10);

        const valid = isFinite(weight) && weight > 0 && 
                     isFinite(count) && count > 0 && 
                     isFinite(dose) && dose > 0 && 
                     isFinite(freq) && freq > 0 && 
                     isFinite(days) && days > 0;

        if (!valid) {
            outTot.textContent = '–';
            outPer.textContent = '–';
            outTot.parentElement.classList.remove('has-result');
            outPer.parentElement.classList.remove('has-result');
            return;
        }

        const perSubjectPerDose = weight * dose; // mg per dose per subject
        const perSubjectPerDay = perSubjectPerDose * freq;
        const total = perSubjectPerDay * days * count;

        // Animate result appearance
        outPer.textContent = perSubjectPerDay.toFixed(2);
        outTot.textContent = total.toFixed(2);

        outTot.parentElement.classList.add('has-result');
        outPer.parentElement.classList.add('has-result');

        // Add calculation success animation
        setTimeout(() => {
            outTot.parentElement.classList.add('result-updated');
            outPer.parentElement.classList.add('result-updated');
            setTimeout(() => {
                outTot.parentElement.classList.remove('result-updated');
                outPer.parentElement.classList.remove('result-updated');
            }, 500);
        }, 50);
    }

    // Initialize with default calculation
    calc();
}

/* Expose globally */
window.initDoseCalculator = initDoseCalculator;
