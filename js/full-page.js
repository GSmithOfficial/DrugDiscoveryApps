// full-page.js – consolidated version with full-width toggle for Spectroscopy
// ---------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const categoryButtons = document.querySelectorAll('.category-button');
  const toolNavigation  = document.querySelector('.tool-navigation');
  const toolContent     = document.getElementById('tool-content');

  /* ---------- Tool registry ---------- */
  const tools = {
    medchem: [
      { id: 'ic50-converter',         name: 'IC50 Converter',     init: initIC50Converter },
      { id: 'efficiency-metrics',     name: 'Efficiency Metrics', init: initEfficiencyMetrics },
      { id: 'concentration-converter',name: 'Conc. Converter',    init: initConcentrationConverter }
    ],
    pk: [
      { id: 'concentration-converter',name: 'Conc. Converter',    init: initConcentrationConverter },
      { id: 'dose-calculator',        name: 'Dose Calculator',    init: initDoseCalculator }
    ],
    molecular_drawer: [
      { id: 'molecular-drawer',       name: 'Molecular Drawer',   init: initMolecularDrawer }
    ],
    spectroscopy: [
      { id: 'nmrium-viewer',          name: 'NMR Viewer',         init: initNMRViewer }
    ]
  };

  /* ---------- UI helpers ---------- */
  function populateToolNavigation(category) {
    toolNavigation.innerHTML = '';
    tools[category].forEach((tool, index) => {
      const btn = document.createElement('button');
      btn.textContent    = tool.name;
      btn.className      = 'tool-button';
      btn.dataset.toolId = tool.id;
      if (index === 0) btn.classList.add('active');
      toolNavigation.appendChild(btn);
    });
  }

  function loadTool(category, toolId) {
    const tool = tools[category].find(t => t.id === toolId);
    if (!tool) return;
    toolContent.innerHTML = '';
    tool.init(toolContent);
  }

  /* ---------- Category navigation with full-width toggle ---------- */
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;

      // Toggle full-width layout on the root wrapper
      const pageWrapper = document.querySelector('.full-page');
      if (category === 'spectroscopy') {
        pageWrapper.classList.add('spectroscopy-fullwidth');
      } else {
        pageWrapper.classList.remove('spectroscopy-fullwidth');
      }

      // Activate button UI
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Populate and load first tool in category
      populateToolNavigation(category);
      loadTool(category, tools[category][0].id);
    });
  });

  /* ---------- Tool navigation ---------- */
  toolNavigation.addEventListener('click', e => {
    if (!e.target.classList.contains('tool-button')) return;

    const category = document.querySelector('.category-button.active').dataset.category;
    const toolId   = e.target.dataset.toolId;

    toolNavigation.querySelectorAll('.tool-button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    loadTool(category, toolId);
  });

  /* ---------- Initial deep‑link ---------- */
  const params        = new URLSearchParams(window.location.search);
  const startCategory = params.get('category') || 'medchem';
  const startTool     = params.get('tool')     || tools[startCategory][0].id;

  document.querySelector(`[data-category="${startCategory}"]`)?.click();
  document.querySelector(`[data-tool-id="${startTool}"]`)?.click();
});

/* =====================================================================
   Existing tool factories – unchanged from your earlier version.
   --------------------------------------------------------------------- */
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

  const ketcherButton   = container.querySelector('#load-ketcher');
  const chemdoodleButton= container.querySelector('#load-chemdoodle');
  const drawerContainer = container.querySelector('#drawer-container');
  const getSmilesButton = container.querySelector('#get-smiles');
  const smilesOutput    = container.querySelector('#smiles-output');

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
      const smiles  = await ketcher.getSmiles();
      smilesOutput.innerHTML = `<strong>SMILES:</strong> ${smiles}`;
    } catch (err) {
      console.error('Error getting SMILES from Ketcher:', err);
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

  const sketcher = new ChemDoodle.SketcherCanvas('chemdoodle-sketcher', 900, 600, {
    useServices: false,
    oneMolecule: false,
    includeToolbar: true,
    includeAtomSketcher: true,
    includeCopyPaste: true
  });

  sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true;
  sketcher.styles.atoms_useJMOLColors                 = true;
  sketcher.styles.bonds_clearOverlaps_2D              = true;
  sketcher.repaint();
}
