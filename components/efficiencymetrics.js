
/* Enhanced Efficiency Metrics Module – Modern Split-Pane Layout */

function initEfficiencyMetrics(container) {
    container.innerHTML = `
        <div class="tool-container">
            <div class="tool-header">
                <h3>📊 Efficiency Metrics Calculator</h3>
                <p class="tool-description">Calculate ligand efficiency metrics for drug optimization</p>
            </div>

            <div class="efficiency-layout">
                <!-- Input Panel -->
                <div class="inputs-panel">
                    <div class="metric-accordion">
                        <!-- LLE Section -->
                        <div class="accordion-item active" data-section="lle">
                            <button class="accordion-header">
                                <span class="metric-icon">⚗️</span>
                                <span class="metric-name">Lipophilic Ligand Efficiency (LLE)</span>
                                <span class="accordion-arrow">▼</span>
                            </button>
                            <div class="accordion-content">
                                <div class="formula-display">
                                    <code>LLE = pIC50 - cLogP</code>
                                </div>

                                <div class="input-row">
                                    <div class="input-group">
                                        <label for="pic50">pIC50 Value</label>
                                        <input id="pic50" type="number" step="0.01" placeholder="Enter pIC50" class="form-input">
                                        <span class="input-hint">Negative log of IC50 in molar</span>
                                    </div>

                                    <div class="input-group">
                                        <label for="clogp">cLogP Value</label>
                                        <input id="clogp" type="number" step="0.01" placeholder="Enter cLogP" class="form-input">
                                        <span class="input-hint">Calculated lipophilicity</span>
                                    </div>
                                </div>

                                <button class="calc-btn primary" data-action="lle">
                                    Calculate LLE
                                </button>
                            </div>
                        </div>

                        <!-- LE Section -->
                        <div class="accordion-item" data-section="le">
                            <button class="accordion-header">
                                <span class="metric-icon">🧮</span>
                                <span class="metric-name">Ligand Efficiency (LE)</span>
                                <span class="accordion-arrow">▶</span>
                            </button>
                            <div class="accordion-content">
                                <div class="formula-display">
                                    <code>LE = -1.4 × pIC50 / heavy atoms</code>
                                </div>

                                <div class="input-row">
                                    <div class="input-group">
                                        <label for="pic50-le">pIC50 Value</label>
                                        <input id="pic50-le" type="number" step="0.01" placeholder="Enter pIC50" class="form-input">
                                    </div>

                                    <div class="input-group">
                                        <label for="formula-le">Chemical Formula</label>
                                        <input id="formula-le" type="text" placeholder="e.g. C6H12O6" class="form-input">
                                        <span class="input-hint">Heavy atoms calculated automatically</span>
                                    </div>
                                </div>

                                <button class="calc-btn primary" data-action="le">
                                    Calculate LE
                                </button>
                            </div>
                        </div>

                        <!-- GE Section -->
                        <div class="accordion-item" data-section="ge">
                            <button class="accordion-header">
                                <span class="metric-icon">📈</span>
                                <span class="metric-name">Group Efficiency (GE)</span>
                                <span class="accordion-arrow">▶</span>
                            </button>
                            <div class="accordion-content">
                                <div class="formula-display">
                                    <code>GE = -1.4 × ΔpIC50 / Δ heavy atoms</code>
                                </div>

                                <div class="comparison-grid">
                                    <div class="compound-group">
                                        <h5>Parent Compound</h5>
                                        <div class="input-group">
                                            <label for="parent-pic50">pIC50</label>
                                            <input id="parent-pic50" type="number" step="0.01" class="form-input">
                                        </div>
                                        <div class="input-group">
                                            <label for="parent-formula">Formula</label>
                                            <input id="parent-formula" type="text" placeholder="e.g. C6H12O6" class="form-input">
                                        </div>
                                    </div>

                                    <div class="vs-divider">→</div>

                                    <div class="compound-group">
                                        <h5>Modified Compound</h5>
                                        <div class="input-group">
                                            <label for="mod-pic50">pIC50</label>
                                            <input id="mod-pic50" type="number" step="0.01" class="form-input">
                                        </div>
                                        <div class="input-group">
                                            <label for="mod-formula">Formula</label>
                                            <input id="mod-formula" type="text" placeholder="e.g. C7H14O6" class="form-input">
                                        </div>
                                    </div>
                                </div>

                                <button class="calc-btn primary" data-action="ge">
                                    Calculate GE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Results Panel -->
                <div class="results-panel">
                    <div class="panel-header">
                        <h4>📋 Results</h4>
                        <p>Live calculations update as you type</p>
                    </div>

                    <div class="results-grid">
                        <div class="metric-result-card" data-result="lle">
                            <div class="metric-header">
                                <h5>LLE</h5>
                                <span class="metric-badge lle">Lipophilic</span>
                            </div>
                            <div class="metric-value">–</div>
                            <div class="metric-interpretation">
                                <small>Optimal: > 5</small>
                            </div>
                        </div>

                        <div class="metric-result-card" data-result="le">
                            <div class="metric-header">
                                <h5>LE</h5>
                                <span class="metric-badge le">Efficiency</span>
                            </div>
                            <div class="metric-value">–</div>
                            <div class="metric-interpretation">
                                <small>Good: > 0.3</small>
                            </div>
                        </div>

                        <div class="metric-result-card" data-result="ge">
                            <div class="metric-header">
                                <h5>GE</h5>
                                <span class="metric-badge ge">Group</span>
                            </div>
                            <div class="metric-value">–</div>
                            <div class="metric-interpretation">
                                <small>Improvement: > 0</small>
                            </div>
                        </div>
                    </div>

                    <div class="interpretation-guide">
                        <h6>Quick Reference</h6>
                        <ul>
                            <li><strong>LLE:</strong> Higher values indicate better balance of potency and lipophilicity</li>
                            <li><strong>LE:</strong> Efficiency of binding per heavy atom</li>
                            <li><strong>GE:</strong> Efficiency gain from structural modifications</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    /* -------- Behavior -------- */
    const pane = container.querySelector('.efficiency-layout');

    // Enhanced accordion toggle with smooth animations
    pane.addEventListener('click', (e) => {
        if (e.target.closest('.accordion-header')) {
            const header = e.target.closest('.accordion-header');
            const item = header.parentElement;
            const isActive = item.classList.contains('active');

            // Close all other accordions
            pane.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-arrow').textContent = '▶';
                }
            });

            // Toggle current accordion
            item.classList.toggle('active', !isActive);
            header.querySelector('.accordion-arrow').textContent = !isActive ? '▼' : '▶';
        }
    });

    // Enhanced calculations with real-time updates
    pane.addEventListener('click', (e) => {
        if (!e.target.classList.contains('calc-btn')) return;

        const button = e.target;
        const action = button.dataset.action;

        // Add loading state
        button.classList.add('calculating');
        button.textContent = 'Calculating...';

        setTimeout(() => {
            performCalculation(action);
            button.classList.remove('calculating');
            button.textContent = button.textContent.replace('Calculating...', 
                action === 'lle' ? 'Calculate LLE' :
                action === 'le' ? 'Calculate LE' : 'Calculate GE'
            );
        }, 300);
    });

    // Real-time input validation and hints
    pane.addEventListener('input', (e) => {
        if (e.target.matches('input')) {
            e.target.closest('.input-group').classList.add('has-input');

            // Auto-calculate for certain inputs
            const section = e.target.closest('.accordion-item').dataset.section;
            if (section && hasValidInputs(section)) {
                setTimeout(() => performCalculation(section), 500);
            }
        }
    });

    function performCalculation(action) {
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
                const pMod = parseFloat(pane.querySelector('#mod-pic50').value);
                const fParent = pane.querySelector('#parent-formula').value.trim();
                const fMod = pane.querySelector('#mod-formula').value.trim();
                const deltaAtoms = countHeavyAtoms(fMod) - countHeavyAtoms(fParent);
                const deltaPIC50 = pMod - pParent;
                if (isFinite(deltaPIC50) && deltaAtoms !== 0) {
                    updateResult('ge', (-1.4 * deltaPIC50 / deltaAtoms).toFixed(3));
                }
                break;
            }
        }
    }

    function hasValidInputs(section) {
        switch (section) {
            case 'lle':
                return pane.querySelector('#pic50').value && pane.querySelector('#clogp').value;
            case 'le':
                return pane.querySelector('#pic50-le').value && pane.querySelector('#formula-le').value;
            case 'ge':
                return pane.querySelector('#parent-pic50').value && 
                       pane.querySelector('#mod-pic50').value &&
                       pane.querySelector('#parent-formula').value && 
                       pane.querySelector('#mod-formula').value;
            default:
                return false;
        }
    }

    function updateResult(key, value) {
        const card = pane.querySelector(`[data-result="${key}"]`);
        const valueElement = card.querySelector('.metric-value');

        valueElement.textContent = value;
        card.classList.add('has-result', 'result-updated');

        // Interpret results with color coding
        const numValue = parseFloat(value);
        card.classList.remove('excellent', 'good', 'poor');

        if (key === 'lle' && numValue > 5) card.classList.add('excellent');
        else if (key === 'le' && numValue > 0.3) card.classList.add('good');
        else if (key === 'ge' && numValue > 0) card.classList.add('good');
        else card.classList.add('poor');

        setTimeout(() => card.classList.remove('result-updated'), 500);
    }

    /** Enhanced heavy-atom counter */
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

/* Register globally */
window.initEfficiencyMetrics = initEfficiencyMetrics;
