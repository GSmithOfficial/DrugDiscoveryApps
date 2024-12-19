document.addEventListener('DOMContentLoaded', function () {
    const categoryButtons = document.querySelectorAll('.category-button');
    const toolNavigation = document.querySelector('.tool-navigation');
    const toolContent = document.getElementById('tool-content');

    const openFullPageButton = document.getElementById('open-full-page');
    openFullPageButton.addEventListener('click', () => {
        const activeCategory = document.querySelector('.category-button.active').dataset.category;
        const activeTool = document.querySelector('.tool-button.active')?.dataset.toolId;
        chrome.tabs.create({ url: `full-page.html?category=${activeCategory}&tool=${activeTool || ''}` });
    });

    const tools = {
        medchem: [
            { id: 'ic50-converter', name: 'IC50 Converter', init: initIC50Converter },
            { id: 'efficiency-metrics', name: 'Efficiency Metrics', init: initEfficiencyMetrics },
            { id: 'concentration-converter', name: 'Conc. Converter', init: initConcentrationConverter }
        ],
        pk: [
            { id: 'concentration-converter', name: 'Conc. Converter', init: initConcentrationConverter },
            { id: 'dose-calculator', name: 'Dose Calculator', init: initDoseCalculator },
        ],
        molecular_drawer: [
            { id: 'molecular-drawer', name: 'Molecular Drawer', init: initMolecularDrawer }
        ]
    };

    function initMolecularDrawer(container) {
        container.innerHTML = `
            <div class="drawer-selection">
                <button id="load-ketcher">Load Ketcher</button>
                <button id="print-smiles">Print SMILES</button>
            </div>
            <div id="drawer-container" style="margin-top: 10px;"></div>
            <h3>Enter SMILES String</h3>
            <input 
                type="text" 
                id="smiles-input" 
                placeholder="Paste SMILES here" 
                style="width: 100%; padding: 8px; margin: 10px 0;"
            >
            <button id="calculate-lipinski">Calculate Lipinski Properties</button>
            <div id="lipinski-results" class="result-box" style="display: none; margin-top: 15px;">
                <h3>Lipinski Rule of 5 Properties</h3>
                <div id="lipinski-output"></div>
            </div>
        `;

        const ketcherButton = container.querySelector('#load-ketcher');
        const printSmilesButton = container.querySelector('#print-smiles');
        const drawerContainer = container.querySelector('#drawer-container');
        const smilesInput = container.querySelector('#smiles-input');
        const lipinskiResults = container.querySelector('#lipinski-results');
        const lipinskiOutput = container.querySelector('#lipinski-output');

        let ketcherFrame;

        ketcherButton.addEventListener('click', () => loadKetcher(drawerContainer));
        printSmilesButton.addEventListener('click', () => printSmiles());
        container.querySelector('#calculate-lipinski').addEventListener('click', () => calculateLipinski(smilesInput.value));

        function loadKetcher(container) {
            container.innerHTML = `
                <h3>Ketcher Editor</h3>
                <iframe id="ketcher-frame" src="Ketcher/index.html" width="100%" height="500"></iframe>
            `;
            ketcherFrame = document.getElementById('ketcher-frame');
        }

        function printSmiles() {
            if (!ketcherFrame) {
                alert('Please load Ketcher first.');
                return;
            }
            try {
                ketcherFrame.contentWindow.ketcher.getSmiles()
                    .then(smiles => {
                        console.log('SMILES:', smiles);
                        alert(`SMILES: ${smiles}\nCopy and paste this into the input box.`);
                    })
                    .catch(err => {
                        console.error('Error generating SMILES:', err);
                        alert('Could not generate SMILES. Ensure a molecule is drawn.');
                    });
            } catch (error) {
                console.error('Ketcher not available:', error);
                alert('Could not communicate with Ketcher.');
            }
        }

        function calculateLipinski(smiles) {
            if (!smiles.trim()) {
                alert('Please enter a valid SMILES string.');
                return;
            }

            try {
                const molecule = OCL.Molecule.fromSmiles(smiles);
                const molecularWeight = molecule.getMolecularWeight();
                const logP = molecule.getLogP();
                const tpsa = molecule.getTPSA();
                const hBondDonors = molecule.getHydrogenBondDonorCount();
                const hBondAcceptors = molecule.getHydrogenBondAcceptorCount();

                const violations = calculateLipinskiViolations(molecularWeight, logP, hBondDonors, hBondAcceptors);

                // Display Lipinski properties
                lipinskiResults.style.display = 'block';
                lipinskiOutput.innerHTML = `
                    <p><strong>Molecular Weight:</strong> ${molecularWeight.toFixed(2)} g/mol</p>
                    <p><strong>LogP:</strong> ${logP.toFixed(2)}</p>
                    <p><strong>TPSA:</strong> ${tpsa.toFixed(2)} Å²</p>
                    <p><strong>H-Bond Donors:</strong> ${hBondDonors}</p>
                    <p><strong>H-Bond Acceptors:</strong> ${hBondAcceptors}</p>
                    <p><strong>Rule of 5 Violation Count:</strong> ${violations}</p>
                `;
            } catch (error) {
                console.error('Invalid SMILES:', error);
                alert('The SMILES string entered is invalid. Please check and try again.');
            }
        }

        function calculateLipinskiViolations(mw, logP, donors, acceptors) {
            let violations = 0;
            if (mw > 500) violations++;
            if (logP > 5) violations++;
            if (donors > 5) violations++;
            if (acceptors > 10) violations++;
            return violations;
        }
    }

    function populateToolNavigation(category) {
        toolNavigation.innerHTML = '';
        tools[category].forEach((tool, index) => {
            const button = document.createElement('button');
            button.textContent = tool.name;
            button.classList.add('tool-button');
            if (index === 0) button.classList.add('active');
            button.dataset.toolId = tool.id;
            toolNavigation.appendChild(button);
        });
    }

    function loadTool(category, toolId) {
        const tool = tools[category].find(t => t.id === toolId);
        if (tool) {
            toolContent.innerHTML = '';
            tool.init(toolContent);
        }
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            populateToolNavigation(category);
            loadTool(category, tools[category][0].id);
        });
    });

    toolNavigation.addEventListener('click', (event) => {
        if (event.target.classList.contains('tool-button')) {
            const toolId = event.target.dataset.toolId;
            const category = document.querySelector('.category-button.active').dataset.category;

            toolNavigation.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            loadTool(category, toolId);
        }
    });

    // Initialize with Medchem Tools and first tool
    categoryButtons[0].click();
});
