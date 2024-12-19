function initEfficiencyMetrics(container) {
    container.innerHTML = `
        <h2>Efficiency Metrics Calculator</h2>
        <div class="accordion">
            <div class="accordion-item">
                <div class="accordion-header">
                    Lipophilic Ligand Efficiency (LLE)
                </div>
                <div class="accordion-content" id="lle-content">
                    <p>LLE = pIC50 - cLogP</p>
                    <div class="input-group">
                        <input type="number" id="lle-pic50" step="any" placeholder="pIC50">
                        <input type="number" id="clogp" step="any" placeholder="cLogP">
                    </div>
                    <button id="calculateLLE">Calculate LLE</button>
                    <div id="lle-result" class="result-box"></div>
                </div>
            </div>
            <div class="accordion-item">
                <div class="accordion-header">
                    Ligand Efficiency (LE)
                </div>
                <div class="accordion-content" id="le-content">
                    <p>LE = -1.4 * pIC50 / number of heavy atoms</p>
                    <div class="input-group">
                        <input type="number" id="le-pic50" step="any" placeholder="pIC50">
                        <input type="text" id="le-formula" placeholder="Chemical Formula (e.g., C6H12O6)">
                    </div>
                    <button id="calculateLE">Calculate LE</button>
                    <div id="le-result" class="result-box"></div>
                </div>
            </div>
            <div class="accordion-item">
                <div class="accordion-header">
                    Group Efficiency (GE)
                </div>
                <div class="accordion-content" id="ge-content">
                    <p>GE = -1.4 * ΔpIC50 / Δ heavy atom count</p>
                    <div class="input-group">
                        <input type="number" id="parent-pic50" step="any" placeholder="Parent pIC50">
                        <input type="text" id="parent-formula" placeholder="Parent Formula">
                    </div>
                    <div class="input-group">
                        <input type="number" id="modified-pic50" step="any" placeholder="Modified pIC50">
                        <input type="text" id="modified-formula" placeholder="Modified Formula">
                    </div>
                    <button id="calculateGE">Calculate GE</button>
                    <div id="ge-result" class="result-box"></div>
                </div>
            </div>
        </div>
    `;

    // LLE calculation
    const calculateLLEButton = container.querySelector('#calculateLLE');
    calculateLLEButton.addEventListener('click', () => {
        const pic50 = parseFloat(container.querySelector('#lle-pic50').value);
        const clogp = parseFloat(container.querySelector('#clogp').value);
        const lleResult = container.querySelector('#lle-result');

        if (!isNaN(pic50) && !isNaN(clogp)) {
            const lle = pic50 - clogp;
            lleResult.textContent = `LLE: ${lle.toFixed(2)}`;
        } else {
            lleResult.textContent = 'Please enter valid values for pIC50 and cLogP.';
        }
    });

    // LE calculation
    const calculateLEButton = container.querySelector('#calculateLE');
    calculateLEButton.addEventListener('click', () => {
        const pic50 = parseFloat(container.querySelector('#le-pic50').value);
        const formula = container.querySelector('#le-formula').value;
        const leResult = container.querySelector('#le-result');

        const heavyAtoms = countHeavyAtoms(formula);
        if (!isNaN(pic50) && heavyAtoms > 0) {
            const le = (-1.4 * pic50) / heavyAtoms;
            leResult.textContent = `LE: ${le.toFixed(3)} kcal/mol per heavy atom`;
        } else {
            leResult.textContent = 'Please enter a valid pIC50 and chemical formula.';
        }
    });

    // GE calculation
    const calculateGEButton = container.querySelector('#calculateGE');
    calculateGEButton.addEventListener('click', () => {
        const parentPic50 = parseFloat(container.querySelector('#parent-pic50').value);
        const modifiedPic50 = parseFloat(container.querySelector('#modified-pic50').value);
        const parentFormula = container.querySelector('#parent-formula').value;
        const modifiedFormula = container.querySelector('#modified-formula').value;
        const geResult = container.querySelector('#ge-result');

        const parentHeavyAtoms = countHeavyAtoms(parentFormula);
        const modifiedHeavyAtoms = countHeavyAtoms(modifiedFormula);
        const deltaHeavyAtoms = modifiedHeavyAtoms - parentHeavyAtoms;
        const deltaPic50 = modifiedPic50 - parentPic50;

        if (!isNaN(parentPic50) && !isNaN(modifiedPic50) && deltaHeavyAtoms !== 0) {
            const ge = (-1.4 * deltaPic50) / deltaHeavyAtoms;
            geResult.textContent = `GE: ${ge.toFixed(3)} kcal/mol per heavy atom`;
        } else {
            geResult.textContent = 'Please enter valid pIC50 values and chemical formulas.';
        }
    });
}

function countHeavyAtoms(formula) {
    const elementCounts = {};
    const elementRegex = /([A-Z][a-z]?)(\d*)/g;
    let match;

    while ((match = elementRegex.exec(formula)) !== null) {
        const element = match[1];
        const count = match[2] ? parseInt(match[2]) : 1;
        elementCounts[element] = (elementCounts[element] || 0) + count;
    }

    // Sum all non-hydrogen atoms
    return Object.entries(elementCounts).reduce((sum, [element, count]) => {
        return element !== 'H' ? sum + count : sum;
    }, 0);
}

// Make it available globally
window.initEfficiencyMetrics = initEfficiencyMetrics;