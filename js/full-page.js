/* full-page.js – rail‑tab mega‑menu with icons + transform ink‑bar (2025‑05‑18) */

document.addEventListener('DOMContentLoaded', () => {
  /* helper: safe wrapper to avoid ReferenceErrors */
  const safe = fn => (typeof fn === 'function' ? fn : c => {
    c.innerHTML = '<p style="padding:24px;color:var(--accent-red);text-align:center">Tool unavailable (missing script)</p>';
  });

  /* tool registry */
  const tools = {
    medchem:[{id:'ic50-converter',name:'IC50 Converter',init:safe(window.initIC50Converter)},{id:'efficiency-metrics',name:'Efficiency Metrics',init:safe(window.initEfficiencyMetrics)},{id:'concentration-converter',name:'Conc. Converter',init:safe(window.initConcentrationConverter)}],
    pk:[{id:'concentration-converter',name:'Conc. Converter',init:safe(window.initConcentrationConverter)},{id:'dose-calculator',name:'Dose Calculator',init:safe(window.initDoseCalculator)}],
    molecular_drawer:[{id:'molecular-drawer',name:'Molecular Drawer',init:safe(window.initMolecularDrawer)}],
    spectroscopy:[{id:'nmrium-viewer',name:'NMR Viewer',init:safe(window.initNMRViewer)}]
  };

  /* svg icon map */
  const ico = {
    medchem: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2h18"/><path d="M8 2l3 8v11a2 2 0 0 0 4 0V10l3-8"/></svg>`,
    pk:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 12 5 12 9 3 15 21 19 12 23 12"/></svg>`,
    molecular_drawer:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-10 10L2 12l5-5 3 3-3 3 5 5z"/></svg>`,
    spectroscopy:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h4l3 8 4-16 3 8h4"/></svg>`
  };

  /* refs */
  const header=document.querySelector('header');
  const toolHolder=document.getElementById('tool-content');

  /* build nav */
  const nav=document.createElement('nav');nav.className='top-nav';
  const ink=document.createElement('div');ink.className='ink-bar';nav.appendChild(ink);

  Object.keys(tools).forEach(cat=>{
    const tab=document.createElement('button');tab.className='tab';tab.dataset.category=cat;
    tab.innerHTML=`<span class="tab-ico">${ico[cat]}</span><span class="tab-label">${cat.replace('_',' ').replace(/\b\w/g,s=>s.toUpperCase())}</span>`;
    nav.appendChild(tab);
  });
  header.after(nav);

  const sheet=document.createElement('div');sheet.className='tool-sheet';nav.after(sheet);

  /* functions */
  function moveInk(el){ink.style.transform=`translateX(${el.offsetLeft}px)`;ink.style.width=`${el.offsetWidth}px`;}

  function openCategory(cat){
    [...nav.querySelectorAll('.tab')].forEach(t=>t.classList.toggle('active',t.dataset.category===cat));
    const active=nav.querySelector('.tab.active');moveInk(active);
    sheet.innerHTML='';tools[cat].forEach(tool=>{
      const btn=document.createElement('button');btn.className='tool-btn';btn.textContent=tool.name;btn.dataset.toolId=tool.id;
      btn.onclick=()=>loadTool(cat,tool.id);
      sheet.appendChild(btn);
    });
    sheet.style.height=`${sheet.scrollHeight}px`;
    loadTool(cat,tools[cat][0].id);
  }

  function loadTool(cat,id){const tool=tools[cat].find(t=>t.id===id);if(!tool)return;toolHolder.innerHTML='';tool.init(toolHolder);[...sheet.children].forEach(b=>b.classList.toggle('active',b.dataset.toolId===id));}

  nav.addEventListener('click',e=>{if(e.target.closest('.tab'))openCategory(e.target.closest('.tab').dataset.category);});
  window.addEventListener('scroll',()=>{const y=window.scrollY;nav.classList.toggle('compact',y>100);sheet.classList.toggle('compact',y>100);});

  /* init */
  openCategory('medchem');
});
