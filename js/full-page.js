/* full-page.js – mega-menu navigation with safe tool stubs (2025-05-18) */

document.addEventListener('DOMContentLoaded', () => {
  /* --------------------------------------------------
     helper to guard missing component scripts
     --------------------------------------------------*/
  const safe = fn => (typeof fn === 'function' ? fn : (c)=>{
    c.innerHTML = '<p style="padding:24px;color:var(--accent-red);text-align:center">Tool unavailable (missing script)</p>';
  });

  /* ---------- Tool registry ---------- */
  const tools = {
    medchem: [
      { id: 'ic50-converter',         name: 'IC50 Converter',     init: safe(window.initIC50Converter) },
      { id: 'efficiency-metrics',     name: 'Efficiency Metrics', init: safe(window.initEfficiencyMetrics) },
      { id: 'concentration-converter',name: 'Conc. Converter',    init: safe(window.initConcentrationConverter) }
    ],
    pk: [
      { id: 'concentration-converter',name: 'Conc. Converter',    init: safe(window.initConcentrationConverter) },
      { id: 'dose-calculator',        name: 'Dose Calculator',    init: safe(window.initDoseCalculator) }
    ],
    molecular_drawer: [
      { id: 'molecular-drawer',       name: 'Molecular Drawer',   init: safe(window.initMolecularDrawer) }
    ],
    spectroscopy: [
      { id: 'nmrium-viewer',          name: 'NMR Viewer',         init: safe(window.initNMRViewer) }
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
    [...nav.querySelectorAll('.tab')].forEach(t => t.classList.toggle('active', t.dataset.category===cat));
    const activeTab = nav.querySelector('.tab.active');
    ink.style.width  = `${activeTab.offsetWidth}px`;
    ink.style.left   = `${activeTab.offsetLeft}px`;

    sheet.innerHTML = '';
    tools[cat].forEach(tool => {
      const btn = document.createElement('button');
      btn.className = 'tool-btn';
      btn.textContent = tool.name;
      btn.dataset.toolId = tool.id;
      btn.addEventListener('click', () => loadTool(cat, tool.id));
      sheet.appendChild(btn);
    });
    sheet.style.height = `${sheet.scrollHeight}px`;

    loadTool(cat, tools[cat][0].id);
  }

  function loadTool(cat, toolId) {
    const tool = tools[cat].find(t=>t.id===toolId);
    if(!tool) return;
    toolHolder.innerHTML='';
    tool.init(toolHolder);
    [...sheet.querySelectorAll('.tool-btn')].forEach(b=>b.classList.toggle('active', b.dataset.toolId===toolId));
  }

  /* ---------- Event wiring ---------- */
  nav.addEventListener('click', e=>{
    if(e.target.classList.contains('tab')) {
      openCategory(e.target.dataset.category);
    }
  });

  let lastY=0;
  window.addEventListener('scroll',()=>{
    const y=window.scrollY;
    nav.classList.toggle('compact', y>100);
    sheet.classList.toggle('compact', y>100);
    lastY=y;
  });

  /* ---------- init ---------- */
  openCategory('medchem');
});
