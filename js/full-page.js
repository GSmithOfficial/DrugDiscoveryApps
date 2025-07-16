/* full-page.js – rail-tab mega-menu with icons + transform ink-bar  (2025-07-16) */

document.addEventListener('DOMContentLoaded', () => {
  /* ─── Safely call a tool’s init or show a fallback ───────────────────────── */
  const safe = fn => (typeof fn === 'function'
    ? fn
    : container => {
        container.innerHTML =
          '<p style="padding:24px;color:var(--accent-red);text-align:center">' +
          'Tool unavailable (missing script)</p>';
      });

  /* ─── TOOL REGISTRY – each category becomes a top-level tab ──────────────── */
  const tools = {
    /* 1 ── MEDICINAL CHEMISTRY */
    medchem: [
      { id: 'ic50-converter',        name: 'IC50 ↔ pIC50',     init: safe(window.initIC50Converter)  },
      { id: 'efficiency-metrics',   name: 'Efficiency Metrics',init: safe(window.initEfficiencyMetrics) }
    ],

    /* 2 ── PHARMACOKINETICS */
    pk: [
      { id: 'concentration-converter', name: 'Conc. Converter', init: safe(window.initConcentrationConverter) },
      { id: 'dose-calculator',         name: 'Dose Calculator', init: safe(window.initDoseCalculator) }
    ],

    /* 3 ── MOLECULAR DRAWER (single-tool tab) */
    molecular_drawer: [
      { id: 'molecular-drawer', name: 'Molecular Drawer', init: safe(window.initMolecularDrawer) }
    ],

    /* 4 ── SPECTROSCOPY (single-tool tab) */
    spectroscopy: [
      { id: 'nmrium-viewer', name: 'NMR Viewer', init: safe(window.initNMRViewer) }
    ],

    /* 5 ── NEW: VIEWER (no sub-menu) */
    viewer: [
      { id: 'nmrium-viewer', name: 'NMR Viewer', init: safe(window.initNMRViewer) }
    ]
  };

  /* ─── SVG ICONS – lightweight line icons (16 × 16) ──────────────────────── */
  const ico = {
    medchem:         `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                         <path d="M3 2h18M8 2l3 8v11a2 2 0 0 0 4 0V10l3-8"/>
                       </svg>`,
    pk:              `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                         <polyline points="1 12 5 12 9 3 15 21 19 12 23 12"/>
                       </svg>`,
    molecular_drawer:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                         <path d="M12 19l7-7 3 3-10 10L2 12l5-5 3 3-3 3 5 5z"/>
                       </svg>`,
    spectroscopy:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                         <path d="M2 12h4l3 8 4-16 3 8h4"/>
                       </svg>`,
    viewer:          `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                         <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
                         <circle cx="12" cy="12" r="3"/>
                       </svg>`
  };

  /* ─── DOM REFERENCES ────────────────────────────────────────────────────── */
  const header      = document.querySelector('header');
  const toolHolder  = document.getElementById('tool-content');

  /* ─── BUILD NAVIGATION BAR ──────────────────────────────────────────────── */
  const nav = document.createElement('nav');
  nav.className = 'top-nav';

  /* animated ink-bar */
  const ink = document.createElement('div');
  ink.className = 'ink-bar';
  nav.appendChild(ink);

  /* category tabs (in insertion order) */
  Object.keys(tools).forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.category = cat;
    btn.innerHTML = `
      <span class="tab-ico">${ico[cat]}</span>
      <span class="tab-label">${cat.replace('_', ' ')
                                    .replace(/\b\w/g, s => s.toUpperCase())}</span>`;
    nav.appendChild(btn);
  });

  header.after(nav);

  /* Sheet that holds per-category tool buttons (hidden when only one tool) */
  const sheet = document.createElement('div');
  sheet.className = 'tool-sheet';
  nav.after(sheet);

  /* ─── HELPERS ───────────────────────────────────────────────────────────── */
  const moveInk = el => {
    ink.style.transform = `translateX(${el.offsetLeft}px)`;
    ink.style.width     = `${el.offsetWidth}px`;
  };

  function openCategory(cat) {
    /* highlight active tab + animate ink-bar */
    [...nav.querySelectorAll('.tab')].forEach(t =>
      t.classList.toggle('active', t.dataset.category === cat)
    );
    moveInk(nav.querySelector('.tab.active'));

    /* clear previous sheet contents */
    sheet.innerHTML = '';

    /* if the category has more than one tool, build the mini-menu */
    if (tools[cat].length > 1) {
      tools[cat].forEach(tool => {
        const btn = document.createElement('button');
        btn.className = 'tool-btn';
        btn.textContent = tool.name;
        btn.dataset.toolId = tool.id;
        btn.onclick = () => loadTool(cat, tool.id);
        sheet.appendChild(btn);
      });
      sheet.style.height = `${sheet.scrollHeight}px`;
    } else {
      /* hide sheet when there’s only one tool */
      sheet.style.height = '0px';
    }

    /* auto-load the first (or only) tool */
    loadTool(cat, tools[cat][0].id);
  }

  function loadTool(cat, id) {
    const tool = tools[cat].find(t => t.id === id);
    if (!tool) return;

    /* show active state in sheet (if visible) */
    [...sheet.querySelectorAll('.tool-btn')].forEach(b =>
      b.classList.toggle('active', b.dataset.toolId === id)
    );

    /* (re)initialise tool */
    toolHolder.innerHTML = '';
    tool.init(toolHolder);
  }

  /* ─── EVENT LISTENERS ───────────────────────────────────────────────────── */
  nav.addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (tab) openCategory(tab.dataset.category);
  });

  /* compact header on scroll */
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('compact', y > 100);
    sheet.classList.toggle('compact', y > 100);
  });

  /* ─── INITIALISE (default to MedChem) ───────────────────────────────────── */
  openCategory('medchem');
});
