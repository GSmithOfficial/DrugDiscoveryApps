/* full-page.js – mega‑menu navigation (2025‑05‑17)
   ──────────────────────────────────────────────────────────────────
   • Single sticky tab row (categories) with ink‑bar
   • Slide‑down sheet reveals tools for active category on click / hover
   • Re‑uses existing tool registry and init functions
*/

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Data ---------- */
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

  /* ---------- DOM refs ---------- */
  const header     = document.querySelector('header');
  const main       = document.querySelector('main');
  const toolHolder = document.getElementById('tool-content');

  /* ---------- Build top nav ---------- */
  const nav = document.createElement('nav');
  nav.className = 'top-nav';
  const ink = document.createElement('div');
  ink.className = 'ink-bar';
  nav.appendChild(ink);

  Object.keys(tools).forEach(cat => {
    const tab = document.createElement('button');
    tab.className = 'tab';
    tab.textContent = cat.replace('_',' ').replace(/\b\w/g, s=>s.toUpperCase());
    tab.dataset.category = cat;
    nav.appendChild(tab);
  });
  header.after(nav);

  /* tool sheet */
  const sheet = document.createElement('div');
  sheet.className = 'tool-sheet';
  nav.after(sheet);

  /* ---------- Functions ---------- */
  function openCategory(cat) {
    // highlight tab & move ink
    [...nav.querySelectorAll('.tab')].forEach(t => t.classList.toggle('active', t.dataset.category===cat));
    const activeTab = nav.querySelector('.tab.active');
    ink.style.width  = `${activeTab.offsetWidth}px`;
    ink.style.left   = `${activeTab.offsetLeft}px`;

    // populate sheet
    sheet.innerHTML = '';
    tools[cat].forEach(tool => {
      const btn = document.createElement('button');
      btn.className = 'tool-btn';
      btn.textContent = tool.name;
      btn.dataset.toolId = tool.id;
      btn.addEventListener('click', () => loadTool(cat, tool.id));
      sheet.appendChild(btn);
    });
    sheet.style.height = `${sheet.scrollHeight}px`; // slide‑down

    // load first tool initially
    loadTool(cat, tools[cat][0].id);
  }

  function loadTool(cat, toolId) {
    const tool = tools[cat].find(t=>t.id===toolId);
    if(!tool) return;
    toolHolder.innerHTML='';
    tool.init(toolHolder);

    // highlight active tool button
    [...sheet.querySelectorAll('.tool-btn')].forEach(b=>b.classList.toggle('active', b.dataset.toolId===toolId));
  }

  /* ---------- Event wiring ---------- */
  nav.addEventListener('click', e=>{
    if(e.target.classList.contains('tab')) {
      openCategory(e.target.dataset.category);
    }
  });

  // collapse sheet on scroll down (simple)
  let lastY = window.scrollY;
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    nav.classList.toggle('compact', y>100);
    sheet.classList.toggle('compact', y>100);
    lastY = y;
  });

  // initial state
  openCategory('medchem');
});
