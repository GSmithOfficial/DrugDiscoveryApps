document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.category-button');
    const toolNavigation = document.querySelector('.tool-navigation');
    const toolContent = document.getElementById('tool-content');

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
                <button id="load-chemdoodle">Load ChemDoodle</button>
            </div>
            <div id="drawer-container"></div>
            <button id="get-smiles" style="display:none;">Get SMILES</button>
            <div id="smiles-output" style="margin: 10px 0;"></div>
        `;

        const ketcherButton = container.querySelector('#load-ketcher');
        const chemdoodleButton = container.querySelector('#load-chemdoodle');
        const drawerContainer = container.querySelector('#drawer-container');
        const getSmilesButton = container.querySelector('#get-smiles');
        const smilesOutput = container.querySelector('#smiles-output');

        ketcherButton.addEventListener('click', () => {
            loadKetcher(drawerContainer);
            getSmilesButton.style.display = 'block';
        });
        
        chemdoodleButton.addEventListener('click', () => {
            loadChemDoodle(drawerContainer);
            getSmilesButton.style.display = 'none';
        });

        getSmilesButton.addEventListener('click', async () => {
            const ketcherFrame = document.getElementById('ifKetcher');
            try {
                const ketcher = ketcherFrame.contentWindow.ketcher;
                const smiles = await ketcher.getSmiles();
                smilesOutput.innerHTML = `<strong>SMILES:</strong> ${smiles}`;
            } catch (error) {
                console.error('Error getting SMILES from Ketcher:', error);
                smilesOutput.innerHTML = '<p>Error retrieving SMILES</p>';
            }
        });
    }

    function loadKetcher(container) {
        container.innerHTML = `
            <h3>Ketcher Editor</h3>
            <iframe id="ifKetcher" src="Ketcher/index.html" width="100%" height="500"></iframe>
        `;
    }

    function loadChemDoodle(container) {
        container.innerHTML = `
            <h3>ChemDoodle Editor</h3>
            <canvas id="chemdoodle-sketcher" width="900" height="600"></canvas>
        `;

        let sketcher = new ChemDoodle.SketcherCanvas('chemdoodle-sketcher', 900, 600, {
            useServices: false,
            oneMolecule: false,
            includeToolbar: true,
            includeAtomSketcher: true,
            includeCopyPaste: true
        });

        sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true;
        sketcher.styles.atoms_useJMOLColors = true;
        sketcher.styles.bonds_clearOverlaps_2D = true;
        sketcher.repaint();
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

    // Initialize with URL parameters or default to Medchem Tools and first tool
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || 'medchem';
    const initialTool = urlParams.get('tool') || tools[initialCategory][0].id;

    document.querySelector(`[data-category="${initialCategory}"]`).click();
    document.querySelector(`[data-tool-id="${initialTool}"]`)?.click();
});