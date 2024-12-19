function initDoseCalculator(container) {
    container.innerHTML = `
        <h2>In-Vivo Dose Calculator</h2>
        <p>Calculate the total amount of compound needed for in-vivo studies.</p>
        <div class="input-group">
            <label for="animalType">Subject Type</label>
            <select id="animalType">
                <option value="mouse">Mouse (20g)</option>
                <option value="rat">Rat (250g)</option>
                <option value="dog">Dog (12kg)</option>
                <option value="monkey">Monkey (5kg)</option>
                <option value="human">Human (85kg)</option>
                <option value="custom">Custom</option>
            </select>
        </div>
        <div id="customWeightGroup" class="input-group" style="display: none;">
            <label for="customWeight">Custom Weight (kg)</label>
            <input type="number" id="customWeight" step="0.001" placeholder="Enter weight in kg">
        </div>
        <div class="input-group">
            <label for="animalCount">Number of Subjects</label>
            <input type="number" id="animalCount" min="1" placeholder="Enter number of subjects">
        </div>
        <div class="input-group">
            <label for="doseType">Dose Type</label>
            <select id="doseType">
                <option value="simple">Simple (mg/kg)</option>
                <option value="advanced">Advanced (IC50/IC90 coverage)</option>
            </select>
        </div>
        <div id="simpleDoseGroup" class="input-group">
            <label for="simpleDose">Dose (mg/kg)</label>
            <input type="number" id="simpleDose" step="any" placeholder="Enter dose">
        </div>
        <div id="advancedDoseGroup" style="display: none;">
            <div class="input-group">
                <label for="coverageType">Coverage Type</label>
                <select id="coverageType">
                    <option value="IC50">IC50</option>
                    <option value="IC90">IC90</option>
                </select>
            </div>
            <div class="input-group">
                <label for="foldCoverage">Fold Coverage</label>
                <input type="number" id="foldCoverage" step="any" placeholder="Enter fold coverage">
            </div>
            <div class="input-group">
                <label for="concentration">Concentration (ng/mL)</label>
                <input type="number" id="concentration" step="any" placeholder="Enter concentration">
            </div>
            <div class="input-group">
                <label for="molecularWeight">Molecular Weight (g/mol)</label>
                <input type="number" id="molecularWeight" step="any" placeholder="Enter molecular weight">
            </div>
        </div>
        <div class="input-group">
            <label for="dosingSchedule">Dosing Schedule</label>
            <select id="dosingSchedule">
                <option value="1">Once daily</option>
                <option value="2">Twice daily</option>
                <option value="3">Three times daily</option>
            </select>
        </div>
        <div class="input-group">
            <label for="studyDays">Number of Days</label>
            <input type="number" id="studyDays" min="1" value="1" placeholder="Enter study duration">
        </div>
        <button id="calculateDose">Calculate Dose</button>
        <div id="doseResult" class="result-box"></div>
    `;

    const animalTypeSelect = container.querySelector('#animalType');
    const customWeightGroup = container.querySelector('#customWeightGroup');
    const doseTypeSelect = container.querySelector('#doseType');
    const simpleDoseGroup = container.querySelector('#simpleDoseGroup');
    const advancedDoseGroup = container.querySelector('#advancedDoseGroup');
    const calculateButton = container.querySelector('#calculateDose');
    const resultBox = container.querySelector('#doseResult');

    animalTypeSelect.addEventListener('change', () => {
        customWeightGroup.style.display = animalTypeSelect.value === 'custom' ? 'block' : 'none';
    });

    doseTypeSelect.addEventListener('change', () => {
        simpleDoseGroup.style.display = doseTypeSelect.value === 'simple' ? 'block' : 'none';
        advancedDoseGroup.style.display = doseTypeSelect.value === 'advanced' ? 'block' : 'none';
    });

    calculateButton.addEventListener('click', calculateDose);

    function calculateDose() {
        const animalType = animalTypeSelect.value;
        const animalCount = parseInt(container.querySelector('#animalCount').value);
        const doseType = doseTypeSelect.value;
        const dosingSchedule = parseInt(container.querySelector('#dosingSchedule').value);
        const studyDays = parseInt(container.querySelector('#studyDays').value);

        let weight, dose;

        // Determine weight
        switch (animalType) {
            case 'mouse': weight = 0.02; break;
            case 'rat': weight = 0.25; break;
            case 'dog': weight = 12; break;
            case 'monkey': weight = 5; break;
            case 'human': weight = 85; break;
            case 'custom': weight = parseFloat(container.querySelector('#customWeight').value); break;
        }

        // Calculate dose
        if (doseType === 'simple') {
            dose = parseFloat(container.querySelector('#simpleDose').value);
        } else {
            const coverageType = container.querySelector('#coverageType').value;
            const foldCoverage = parseFloat(container.querySelector('#foldCoverage').value);
            const concentration = parseFloat(container.querySelector('#concentration').value);
            const molecularWeight = parseFloat(container.querySelector('#molecularWeight').value);

            // Advanced dose calculation (this is a simplified example)
            dose = (concentration * foldCoverage * molecularWeight) / (1e6 * weight);
        }

        // Calculate total amount
        const totalAmount = dose * weight * animalCount * dosingSchedule * studyDays;

        // Display result
        resultBox.textContent = `Total amount needed: ${totalAmount.toFixed(2)} mg`;
    }
}

// Make it available globally
window.initDoseCalculator = initDoseCalculator;