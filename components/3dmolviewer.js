/* components/3dmolviewer.js  –  Plan B with refined defaults
   • Protein = cartoon
   • All HET groups = stick
   • Water = hidden
   • Visual rule-builder UI & SortableJS remain unchanged
   2025-07-16
*/
(function () {
    /* ─── utilities ────────────────────────────────────────────────────────── */
    function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error(`Could not load ${src}`));document.head.appendChild(s);});}
    function injectStyles(){if(document.getElementById('viewer-builder-css'))return;const css=`
    .viewer-builder{font:400 14px/1.4 system-ui}
    .viewer-builder .controls{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem}
    .viewer-builder input[type=text],.viewer-builder select{padding:.25rem .5rem;border:1px solid #ccc;border-radius:4px;min-height:30px}
    .viewer-builder button{padding:.25rem .75rem;border:0;border-radius:4px;background:#0d6efd;color:#fff;cursor:pointer;min-height:30px}
    .viewer-builder button.secondary{background:#6c757d}
    .viewer-builder label{display:flex;align-items:center;gap:.25rem}
    .rule-list{list-style:none;padding:0;margin:.5rem 0;display:flex;flex-direction:column;gap:.25rem}
    .rule-item{display:flex;align-items:center;gap:.5rem;padding:.25rem .5rem;background:#f8f9fa;border:1px solid #e0e0e0;border-radius:4px;cursor:grab}
    .rule-item .handle{font-weight:700;cursor:grab}
    .rule-item .del{margin-left:auto;background:#dc3545}
    .share-url{width:100%;padding:.25rem .5rem;font-size:12px;border:1px solid #ccc;border-radius:4px}
    `;const style=document.createElement('style');style.id='viewer-builder-css';style.textContent=css;document.head.appendChild(style);}
    
    /* ─── main init ───────────────────────────────────────────────────────── */
    window.init3DMolViewer=async function(container){
    try{
    await Promise.all([
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.5.1/3Dmol-min.js'),
    loadScript('https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js')
    ]);
    if(!window.$3Dmol)throw new Error('$3Dmol global missing');
    
    /* skeleton */
    injectStyles();
    container.innerHTML=`
      <div class="viewer-builder">
        <div class="controls">
          <input type="text" id="pdbInput" value="2POR" size="6" aria-label="PDB id"/>
          <button id="loadBtn">Load</button>
    
          <select id="selType">
            <option value="protein">Protein (all)</option>
            <option value="ligand">Ligands (all het)</option>
            <option value="chain">Chain(s)…</option>
            <option value="custom">Custom AtomSpec…</option>
          </select>
          <select id="chainMulti" multiple size="1" style="display:none"></select>
          <input type="text" id="customInput" placeholder="resi:19,23;chain:B" size="16" style="display:none"/>
    
          <select id="stylePreset">
            <option value="cartoon">Cartoon</option>
            <option value="stick">Stick</option>
            <option value="sphere">Sphere</option>
            <option value="line">Line</option>
            <option value="hide">Hide</option>
          </select>
          <input type="color" id="colorPicker" value="#ffffff"/>
          <button id="addRuleBtn">Add rule</button>
          <button id="applyBtn" class="secondary">Apply</button>
        </div>
    
        <ul id="rulesList" class="rule-list"></ul>
    
        <label style="font-size:12px">Share URL
          <input type="text" id="shareUrl" class="share-url" readonly />
        </label>
      </div>
    
      <div id="viewerHost" style="width:100%;height:600px;position:relative;margin-top:.75rem"></div>
    `;
    
    /* viewer */
    const host=container.querySelector('#viewerHost');
    const viewer=$3Dmol.createViewer(host,{backgroundColor:'white'});
    
    /* refs */
    const pdbInput   =container.querySelector('#pdbInput');
    const loadBtn    =container.querySelector('#loadBtn');
    const selType    =container.querySelector('#selType');
    const chainMulti =container.querySelector('#chainMulti');
    const customIn   =container.querySelector('#customInput');
    const stylePre   =container.querySelector('#stylePreset');
    const colorPick  =container.querySelector('#colorPicker');
    const addRuleBtn =container.querySelector('#addRuleBtn');
    const applyBtn   =container.querySelector('#applyBtn');
    const rulesList  =container.querySelector('#rulesList');
    const shareUrlEl =container.querySelector('#shareUrl');
    
    /* data */
    let availableChains=[];
    let rules=[];
    
    /* helpers */
    function populateChains(arr){chainMulti.innerHTML='';arr.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;chainMulti.appendChild(o);});}
    function selectionFromUI(){
    switch(selType.value){
        case 'protein':
            return { selStr: '{hetflag:false}', desc: 'Protein', selObj: { hetflag: false } };
          
    case'ligand': return{selStr:'{hetflag:true}',desc:'Ligands (het)',selObj:{hetflag:true}};
    case'chain':  const cs=[...chainMulti.selectedOptions].map(o=>o.value);return{selStr:`{chain:'${cs.join(',')}'}`,desc:`Chain(s) ${cs.join(',')}`,selObj:{chain:cs.join(',')}};
    case'custom': const raw=customIn.value.trim();return{selStr:raw,desc:`Custom: ${raw}`,selObj:eval('('+raw+')')}; // eslint-disable-line
    default:      return{selStr:'{}',desc:'All atoms',selObj:{}};
    }}
    function styleFromUI(){const col=colorPick.value,p=stylePre.value;if(p==='hide')return{desc:'Hide',obj:{}};const o={};o[p]=(p==='cartoon'||p==='stick'||p==='sphere')?{color:col}:{};
    return{desc:`${p} (color ${col})`,obj:o};}
    function refreshRuleList(){rulesList.innerHTML='';rules.forEach((r,i)=>{const li=document.createElement('li');li.className='rule-item';li.dataset.idx=i;li.innerHTML=`<span class="handle">☰</span><span>${i+1}.</span><code>${r.desc}</code><button class="del">✕</button>`;rulesList.appendChild(li);});}
    function applyRules(){
    viewer.setStyle({},{});viewer.removeAllSurfaces();
    rules.forEach(r=>viewer.setStyle(r.selObj,r.styleObj));
    viewer.render();viewer.zoomTo();
    const p=new URLSearchParams({pdb:pdbInput.value.trim()||'2POR'});rules.forEach((r,i)=>{p.set(`select${i+1}`,r.selStr);p.set(`style${i+1}`,JSON.stringify(r.styleObj));});shareUrlEl.value=`${location.origin}${location.pathname}#${p.toString()}`;}
    /* drag reorder */
    new Sortable(rulesList,{handle:'.handle',animation:150,onEnd:e=>{const[m]=rules.splice(e.oldIndex,1);rules.splice(e.newIndex,0,m);refreshRuleList();applyRules();}});
    rulesList.addEventListener('click',e=>{if(e.target.classList.contains('del')){const idx=+e.target.closest('.rule-item').dataset.idx;rules.splice(idx,1);refreshRuleList();applyRules();}});
    addRuleBtn.onclick=()=>{const s=selectionFromUI(),sty=styleFromUI();rules.push({selStr:s.selStr,selObj:s.selObj,styleObj:sty.obj,desc:`${s.desc} → ${sty.desc}`});refreshRuleList();};
    applyBtn.onclick=applyRules;
    selType.onchange=()=>{chainMulti.style.display=selType.value==='chain'?'':'none';customIn.style.display=selType.value==='custom'?'':'none';};
    
    /* PDB loader with refined defaults */
    async function loadPDB(id){
    viewer.clear();rules=[];
    await $3Dmol.download(`pdb:${id}`,viewer,{});
    const atoms=viewer.selectedAtoms({});availableChains=[...new Set(atoms.filter(a=>a.chain).map(a=>a.chain))];populateChains(availableChains);
   /* default rules */
rules.push({
    selStr: '{hetflag:false}',
    selObj: { hetflag: false },
    styleObj: { cartoon: { color: 'spectrum' } },
    desc: 'Protein → cartoon:spectrum'
  });
  rules.push({
    selStr: '{hetflag:true}',
    selObj: { hetflag: true },
    styleObj: { stick: {} },
    desc: 'Ligands → stick'
  });
  rules.push({
    selStr: '{resn:"HOH"}',
    selObj: { resn: "HOH" },
    styleObj: {},
    desc: 'Hide water'
  });
  
    refreshRuleList();applyRules();}
    loadBtn.onclick=()=>loadPDB(pdbInput.value.trim()||'2POR');
    
    /* deep-link support */
    if(location.hash.includes('pdb=')){const p=new URLSearchParams(location.hash.slice(1));pdbInput.value=p.get('pdb')||'2POR';await loadPDB(pdbInput.value);let i=1;while(p.has(`select${i}`)&&p.has(`style${i}`)){try{rules[i-1]={selStr:p.get(`select${i}`),selObj:eval('('+p.get(`select${i}`)+')'),styleObj:JSON.parse(p.get(`style${i}`)),desc:`Rule ${i} (from URL)`};}catch{}i++;}refreshRuleList();applyRules();}else{await loadPDB('2POR');}
    
    }catch(err){container.innerHTML=`<p style="color:red;text-align:center">${err.message}</p>`;console.error(err);}};
    })();
    