/* full-page.js – mega-menu with dynamic tabs & ink-bar (2025-07-16) */

document.addEventListener('DOMContentLoaded', () => {
  /* ─── Helpers ──────────────────────────────────────────────── */
  const safe = fn =>
    typeof fn === 'function'
      ? fn
      : el =>
          (el.innerHTML =
            '<p style="padding:24px;color:var(--accent-red);text-align:center">Tool unavailable (missing script)</p>');

  /* ─── Tool registry (category → array<tool>) ───────────────── */
  const tools = {
    medchem: [
      { id: 'ic50-converter', name: 'IC50 Converter', init: safe(window.initIC50Converter) },
      { id: 'efficiency-metrics', name: 'Efficiency Metrics', init: safe(window.initEfficiencyMetrics) }
    ],

    pk: [
      { id: 'concentration-converter', name: 'Conc. Converter', init: safe(window.initConcentrationConverter) },
      { id: 'dose-calculator', name: 'Dose Calculator', init: safe(window.initDoseCalculator) }
    ],

    viewer: [
      { id: 'molecular-drawer', name: 'Molecular Drawer', init: safe(window.initMolecularDrawer) },
      { id: 'nmrium-viewer', name: 'NMR Viewer',        init: safe(window.initNMRViewer) }
    ]
  };

  /* ─── SVG icon map ─────────────────────────────────────────── */
  const ico = {
    medchem: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 2h18" /><path d="M8 2l3 8v11a2 2 0 0 0 4 0V10l3-8" /></svg>`,
    pk: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 12 5 12 9 3 15 21 19 12 23 12" /></svg>`,
    viewer: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <circle cx="12" cy="12" r="3" />
                 <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /></svg>`
  };

  /* ─── DOM references ───────────────────────────────────────── */
  const header = document.querySelector('header');
  const main   = document.getElementById('tool-content');

  /* ─── Build navigation bar ─────────────────────────────────── */
  const nav = document.createElement('nav');
  nav.className = 'top-nav';

  const ink = document.createElement('div');
  ink.className = 'ink-bar';
  nav.appendChild(ink);

  Object.keys(tools).forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.category = cat;
    btn.innerHTML = `
      <span class="tab-ico">${ico[cat]}</span>
      <span class="tab-label">${cat.replace('_', ' ').replace(/\b\w/g, s => s.toUpperCase())}</span>`;
    nav.appendChild(btn);
  });

  header.after(nav);

  /* ─── Sliding sheet for tool buttons ───────────────────────── */
  const sheet = document.createElement('div');
  sheet.className = 'tool-sheet';
  nav.after(sheet);

  /* ─── Core functions ───────────────────────────────────────── */
  function moveInk(el) {
    ink.style.transform = `translateX(${el.offsetLeft}px)`;
    ink.style.width = `${el.offsetWidth}px`;
  }

  function openCategory(cat) {
    // highlight active tab & move ink-bar
    nav.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.category === cat));
    moveInk(nav.querySelector(`.tab[data-category="${cat}"]`));

    // populate sheet with tool buttons
    sheet.innerHTML = '';
    tools[cat].forEach(tool => {
      const btn = document.createElement('button');
      btn.className = 'tool-button';
      btn.dataset.toolId = tool.id;
      btn.textContent = tool.name;
      btn.addEventListener('click', () => loadTool(cat, tool.id));
      sheet.appendChild(btn);
    });

    // auto-select first tool
    loadTool(cat, tools[cat][0].id);
  }

  function loadTool(cat, id) {
    sheet.querySelectorAll('.tool-button').forEach(b => b.classList.toggle('active', b.dataset.toolId === id));

    const tool = tools[cat].find(t => t.id === id);
    if (!tool) return;

    main.innerHTML = '';              // clear workspace
    const container = document.createElement('div');
    container.className = 'tool-container';
    main.appendChild(container);

    tool.init(container);             // run tool’s init
  }

  /* ─── Event listeners ──────────────────────────────────────── */
  nav.addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab) openCategory(tab.dataset.category);
  });

  window.addEventListener('scroll', () => {
    const compact = window.scrollY > 100;
    header.classList.toggle('compact', compact);
    nav.classList.toggle('compact', compact);
    sheet.classList.toggle('compact', compact);
  });

  /* ─── Bootstrap ────────────────────────────────────────────── */
  openCategory('medchem');  // default landing tab
});
