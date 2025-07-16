// full-page.js – Adds new "Viewer" tab category with placeholder tool

document.addEventListener('DOMContentLoaded', function() {
  const categoryButtons = document.querySelectorAll('.category-button');
  const toolNavigation   = document.querySelector('.tool-navigation');
  const toolContent      = document.getElementById('tool-content');

  // ─── TOOL REGISTRY ──────────────────────────────────────────────
  // Each category contains an array of tools that will be shown in
  // the secondary navigation bar (toolNavigation). A tool entry
  // needs an id, display name, and an init() handler that receives
  // a DOM element where it should render its UI.
  // ----------------------------------------------------------------
  const tools = {
      // Medicinal chemistry calculators
      medchem: [
          { id: 'ic50-converter',       name: 'IC50&nbsp;Converter',    init: initIC50Converter },
          { id: 'efficiency-metrics',  name: 'Efficiency&nbsp;Metrics',init: initEfficiencyMetrics },
          { id: 'concentration-converter', name: 'Conc.&nbsp;Converter', init: initConcentrationConverter }
      ],

      // Pharmacokinetics utilities
      pk: [
          { id: 'dose-calculator',     name: 'Dose&nbsp;Calculator',   init: initDoseCalculator },
          { id: 'concentration-converter', name: 'Conc.&nbsp;Converter', init: initConcentrationConverter }
      ],

      // Stand‑alone molecular drawing page (Ketcher)
      ketcher: [
          { id: 'ketcher-iframe',      name: 'Ketcher',               init: initKetcher }
      ],

      // NEW ─── Viewer category (blank placeholder) ────────────────
      // This ships with a single placeholder tool so that the UI
      // logic that expects at least one tool can stay unchanged.
      viewer: [
          { id: 'viewer-placeholder',  name: 'Coming&nbsp;Soon',       init: initViewerPlaceholder }
      ]
  };

  // ─── NAVIGATION HELPERS ────────────────────────────────────────
  function populateToolNavigation(category) {
      toolNavigation.innerHTML = '';

      if (!tools[category] || tools[category].length === 0) return; // blank category safeguard

      tools[category].forEach((tool, idx) => {
          const btn = document.createElement('button');
          btn.classList.add('tool-button');
          btn.dataset.toolId = tool.id;
          btn.innerHTML = tool.name;
          if (idx === 0) btn.classList.add('active');
          toolNavigation.appendChild(btn);
      });
  }

  function loadTool(category, toolId) {
      // Guard against categories that do not yet have any published tools
      if (!tools[category] || tools[category].length === 0) {
          toolContent.innerHTML = '<p class="loading-tool">Tools for this category are coming soon.</p>';
          return;
      }

      const tool = tools[category].find(t => t.id === toolId);
      if (tool) {
          toolContent.innerHTML = '';
          tool.init(toolContent);
      }
  }

  // ─── TOOL INITIALISERS ─────────────────────────────────────────
  function initKetcher(container) {
      container.innerHTML = `
          <div class="ketcher-note">
              <p><strong>Note:</strong> Ketcher operates in stand‑alone mode. The “Save&nbsp;As” feature is not available here.</p>
          </div>
          <iframe id="ifKetcher" src="Ketcher/index.html" width="750" height="600"></iframe>
      `;
  }

  // Simple placeholder for the new Viewer tab
  function initViewerPlaceholder(container) {
      container.innerHTML = `
          <section class="tool-card">
              <h2>Viewer Tools</h2>
              <p>🚧 Viewer‑specific utilities will appear here soon. Stay tuned!</p>
          </section>`;
  }

  // ─── EVENT WIRING ──────────────────────────────────────────────
  categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
          const category = button.dataset.category;

          // Highlight active category
          categoryButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');

          // Populate secondary nav + load first tool (if any)
          populateToolNavigation(category);
          if (tools[category] && tools[category].length > 0) {
              loadTool(category, tools[category][0].id);
          } else {
              toolNavigation.innerHTML = '';
              toolContent.innerHTML = '<p class="loading-tool">Tools for this category are coming soon.</p>';
          }
      });
  });

  toolNavigation.addEventListener('click', evt => {
      if (!evt.target.classList.contains('tool-button')) return;

      const toolId   = evt.target.dataset.toolId;
      const category = document.querySelector('.category-button.active').dataset.category;

      // Highlight active tool
      toolNavigation.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('active'));
      evt.target.classList.add('active');

      loadTool(category, toolId);
  });

  // ─── DEEP LINK SUPPORT ────────────────────────────────────────
  const urlParams       = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'medchem';
  const initialTool     = urlParams.get('tool');

  const initialCategoryBtn = document.querySelector(`[data-category="${initialCategory}"]`) || categoryButtons[0];
  initialCategoryBtn.click();

  if (initialTool) {
      const initialToolBtn = toolNavigation.querySelector(`[data-tool-id="${initialTool}"]`);
      if (initialToolBtn) initialToolBtn.click();
  }
});
