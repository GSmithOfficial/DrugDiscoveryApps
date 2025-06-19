document.addEventListener('DOMContentLoaded', function() {
  // Tool registry with improved names
  const tools = {
    'medchem': [
      {id: 'ic50-converter', name: 'IC50 Converter', icon: 'calculator', init: safe(window.initIC50Converter)},
      {id: 'efficiency-metrics', name: 'Efficiency Metrics', icon: 'chart-line', init: safe(window.initEfficiencyMetrics)},
      {id: 'concentration-converter', name: 'Concentration Converter', icon: 'flask', init: safe(window.initConcentrationConverter)}
    ],
    'pk': [
      {id: 'concentration-converter', name: 'Concentration Converter', icon: 'flask', init: safe(window.initConcentrationConverter)},
      {id: 'dose-calculator', name: 'Dose Calculator', icon: 'pills', init: safe(window.initDoseCalculator)}
    ],
    'molecular_drawer': [
      {id: 'molecular-drawer', name: 'Molecular Drawer', icon: 'atom', init: safe(window.initMolecularDrawer)}
    ],
    'spectroscopy': [
      {id: 'nmrium-viewer', name: 'NMR Viewer', icon: 'wave-square', init: safe(window.initNMRViewer)}
    ]
  };

  // SVG icon map - simplified icon set using unicode characters
  // You can replace these with actual SVG icons if preferred
  const ico = {
    'medchem': '<span class="tab-ico">⚗️</span>',
    'pk': '<span class="tab-ico">💊</span>',
    'molecular_drawer': '<span class="tab-ico">⚛️</span>',
    'spectroscopy': '<span class="tab-ico">📊</span>',
    'calculator': '<span class="tool-ico">🧮</span>',
    'chart-line': '<span class="tool-ico">📈</span>',
    'flask': '<span class="tool-ico">🧪</span>',
    'pills': '<span class="tool-ico">💊</span>',
    'atom': '<span class="tool-ico">⚛️</span>',
    'wave-square': '<span class="tool-ico">〰️</span>'
  };

  // References
  const header = document.querySelector('header');
  const toolHolder = document.getElementById('tool-content');

  // Build navigation
  const nav = document.createElement('nav');
  nav.className = 'top-nav';
  const ink = document.createElement('div');
  ink.className = 'ink-bar';
  nav.appendChild(ink);

  // Create tabs with icons
  Object.keys(tools).forEach(cat => {
    const tab = document.createElement('button');
    tab.className = 'tab';
    tab.dataset.category = cat;
    
    // Format category name nicely
    const formattedName = cat.replace('_', ' ').replace(/\b\w/g, s => s.toUpperCase());
    
    tab.innerHTML = `${ico[cat]}${formattedName}`;
    nav.appendChild(tab);
  });
  
  header.after(nav);

  // Create tool sheet
  const sheet = document.createElement('div');
  sheet.className = 'tool-sheet';
  nav.after(sheet);

  // Ink bar animation
  function moveInk(el) {
    const left = el.offsetLeft;
    const width = el.offsetWidth;
    
    ink.style.transform = `translateX(${left}px)`;
    ink.style.width = `${width}px`;
  }

  // Category opening
  function openCategory(cat) {
    // Update active tab
    [...nav.querySelectorAll('.tab')].forEach(t => 
      t.classList.toggle('active', t.dataset.category === cat)
    );
    
    // Move ink to active tab
    const active = nav.querySelector('.tab.active');
    moveInk(active);
    
    // Generate tool buttons
    sheet.innerHTML = '';
    tools[cat].forEach(tool => {
      const btn = document.createElement('button');
      btn.className = 'tool-btn';
      
      // Add icon if available
      const iconHTML = tool.icon ? ico[tool.icon] : '';
      btn.innerHTML = `${iconHTML}${tool.name}`;
      
      btn.dataset.toolId = tool.id;
      btn.onclick = () => loadTool(cat, tool.id);
      sheet.appendChild(btn);
    });
    
    // Animate sheet height
    sheet.style.height = `${sheet.scrollHeight}px`;
    
    // Load first tool by default
    loadTool(cat, tools[cat][0].id);
  }

  // Tool loading with animations
  function loadTool(cat, id) {
    const tool = tools[cat].find(t => t.id === id);
    if (!tool) return;
    
    // Add loading class
    toolHolder.innerHTML = '';
    toolHolder.classList.add('loading-tool');
    
    // Set active tool button
    [...sheet.children].forEach(b => 
      b.classList.toggle('active', b.dataset.toolId === id)
    );
    
    // Slight delay for loading animation
    setTimeout(() => {
      tool.init(toolHolder);
      toolHolder.classList.remove('loading-tool');
    }, 200);
  }

  // Event listeners
  nav.addEventListener('click', e => {
    if (e.target.closest('.tab')) {
      openCategory(e.target.closest('.tab').dataset.category);
    }
  });
  
  // Compact navigation on scroll
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('compact', y > 100);
    sheet.classList.toggle('compact', y > 100);
  });

  // Initialize with default category
  openCategory('medchem');
});
