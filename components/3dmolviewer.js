/* components/3dmolviewer.js  –  Ribbon revamp with contextual controls
   ①  Colour-picker shown only for cartoon / stick / sphere / cross
   ②  Surface selector (None/VDW/SAS/SES)
       • if surface ≠ None → viewer.addSurface(...) + setViewStyle('ao')
       • shows viewSelect dropdown so user may override AO/Outline
   ③  View-style dropdown hidden until a surface is present (or user chose AO/outline)
   All other rule-builder logic unchanged.
   2025-07-17
*/
(function () {

  /* ─── small util ─── */
  const loadScript = src => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(Error(`load ${src}`));
    document.head.appendChild(s);
  });
  
  /* ===================================================================== */
  window.init3DMolViewer = async function (container) {
    try {
      await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.5.1/3Dmol-min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js')
      ]);
      if (!window.$3Dmol) throw Error('3Dmol failed to load');
  
      /* ─── HTML skeleton (single flex row) ─── */
      container.innerHTML = `
        <div class="viewer-builder">
          <div class="controls" style="display:flex;flex-wrap:wrap;gap:6px">
            <input type="text" id="pdbInput" value="2POR" size="6" style="width:auto"/>
            <button id="loadBtn">Load</button>
  
            <select id="selType" style="width:auto">
              <option value="protein">Protein (hetflag:false)</option>
              <option value="ligand">Ligands (all het)</option>
              <option value="chain">Chain(s)…</option>
              <option value="custom">Custom AtomSpec…</option>
            </select>
            <select id="chainMulti" multiple size="1" style="display:none;width:auto"></select>
            <input type="text" id="customInput" placeholder="resi:19,23;chain:B"
                   size="16" style="display:none;width:auto"/>
  
            <select id="stylePreset" style="width:auto">
              <option value="cartoon">Cartoon</option>
              <option value="stick">Stick</option>
              <option value="sphere">Sphere</option>
              <option value="line">Line</option>
              <option value="cross">Cross</option>
              <option value="hide">Hide</option>
            </select>
  
            <input type="color" id="colorPicker" value="#ffffff" />
  
            <select id="surfaceSelect" title="Surface" style="width:auto">
              <option value="none">No Surface</option>
              <option value="VDW">VDW</option>
              <option value="SAS">SAS</option>
              <option value="SES">SES</option>
            </select>
  
            <select id="viewSelect" title="Render effect" style="display:none;width:auto">
              <option value="none">Default</option>
              <option value="ao">Ambient Occlusion</option>
              <option value="outline">Outline</option>
            </select>
  
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
  
      /* ─── viewer + refs ─── */
      const host       = container.querySelector('#viewerHost');
      const viewer     = $3Dmol.createViewer(host, { backgroundColor: 'white' });
  
      const pdbInput   = container.querySelector('#pdbInput');
      const loadBtn    = container.querySelector('#loadBtn');
      const selType    = container.querySelector('#selType');
      const chainMulti = container.querySelector('#chainMulti');
      const customIn   = container.querySelector('#customInput');
      const stylePre   = container.querySelector('#stylePreset');
      const colorPick  = container.querySelector('#colorPicker');
      const surfaceSel = container.querySelector('#surfaceSelect');
      const viewSel    = container.querySelector('#viewSelect');
      const addRuleBtn = container.querySelector('#addRuleBtn');
      const applyBtn   = container.querySelector('#applyBtn');
      const rulesList  = container.querySelector('#rulesList');
      const shareUrlEl = container.querySelector('#shareUrl');
  
      let rules = [], availableChains = [];
  
      /* ─── context-sensitive toggles ─── */
      function updateContextControls() {
        /* colour-picker visible only for colourable styles */
        const colourful = ['cartoon','stick','sphere','cross'].includes(stylePre.value);
        colorPick.hidden = !colourful;
  
        /* view selector only shown if surface present OR user explicitly chose AO/outline */
        const needView   = surfaceSel.value !== 'none' || viewSel.value !== 'none';
        viewSel.hidden   = !needView;
      }
  
      /* ─── view style helper ─── */
      function applyViewStyle() {
        if (viewSel.value === 'ao')
          viewer.setViewStyle({style:'ambientOcclusion',strength:1,radius:5});
        else if (viewSel.value === 'outline')
          viewer.setViewStyle({style:'outline',color:'black',width:0.1});
        else
          viewer.setViewStyle({style:'none'});
      }
  
      /* ─── surface helper ─── */
      function applySurface() {
        viewer.removeAllSurfaces();
        if (surfaceSel.value !== 'none') {
          viewer.addSurface($3Dmol.SurfaceType[surfaceSel.value],
                            {opacity:0.7,color:'white'}, {});
          /* auto-enable AO if user hasn’t chosen an override */
          if (viewSel.value === 'none') {
            viewSel.value = 'ao';
            applyViewStyle();
          }
        } else {
          /* if no surface, revert view style unless user chose outline */
          if (['ao'].includes(viewSel.value)) {
            viewSel.value = 'none';
            applyViewStyle();
          }
        }
        updateContextControls();
        viewer.render();
      }
  
      /* ─── selection helpers (unchanged) ─── */
      const populateChains = arr => chainMulti.innerHTML =
        arr.map(c=>`<option value="${c}">${c}</option>`).join('');
  
      function selectionFromUI(){
        switch(selType.value){
          case'protein':return{selStr:'{hetflag:false}',desc:'Protein',selObj:{hetflag:false}};
          case'ligand' :return{selStr:'{hetflag:true}', desc:'Ligands',selObj:{hetflag:true}};
          case'chain'  :const cs=[...chainMulti.selectedOptions].map(o=>o.value);
            return{selStr:`{chain:'${cs.join(',')}'}`,desc:`Chain(s) ${cs.join(',')}`,
                   selObj:{chain:cs.join(',')}}; 
          case'custom' :const raw=customIn.value.trim();
            return{selStr:raw,desc:`Custom:${raw}`,selObj:eval('('+raw+')')}; // eslint-disable-line
          default      :return{selStr:'{}',desc:'All atoms',selObj:{}};
        }
      }
  
      function styleFromUI(){
        const col=colorPick.value, p=stylePre.value;
        if(p==='hide')return{desc:'Hide',obj:{}};
        const o={}; o[p]=(p==='cartoon'||p==='stick'||p==='sphere'||p==='cross')?{color:col}:{};
        return{desc:`${p} (color ${col})`,obj:o};
      }
  
      /* ─── rule list UI & applyRules ─── */
      function refreshRuleList(){
        rulesList.innerHTML=rules.map((r,i)=>
          `<li class="rule-item" data-idx="${i}">
             <span class="handle">☰</span><span>${i+1}.</span>
             <code>${r.desc}</code><button class="del">✕</button></li>`).join('');
      }
  
      function applyRules(){
        viewer.setStyle({},{}); viewer.removeAllSurfaces();
        rules.forEach(r=>viewer.setStyle(r.selObj,r.styleObj));
        applySurface();           // may add surface + AO
        applyViewStyle();         // apply user-chosen or auto AO/outl.
        viewer.render(); viewer.zoomTo();
  
        /* share URL */
        const p=new URLSearchParams({pdb:pdbInput.value.trim()||'2POR'});
        rules.forEach((r,i)=>{p.set(`select${i+1}`,r.selStr);
                              p.set(`style${i+1}`,JSON.stringify(r.styleObj));});
        shareUrlEl.value=`${location.origin}${location.pathname}#${p.toString()}`;
      }
  
      /* ─── drag-n-drop, add / delete rules ─── */
      new Sortable(rulesList,{handle:'.handle',animation:150,
        onEnd:e=>{const[m]=rules.splice(e.oldIndex,1);
                  rules.splice(e.newIndex,0,m);refreshRuleList();applyRules();}});
      rulesList.addEventListener('click',e=>{
        if(e.target.classList.contains('del')){
          rules.splice(+e.target.closest('.rule-item').dataset.idx,1);
          refreshRuleList();applyRules();
        }
      });
  
      addRuleBtn.onclick=()=>{const s=selectionFromUI(),sty=styleFromUI();
        rules.push({selStr:s.selStr,selObj:s.selObj,styleObj:sty.obj,
                   desc:`${s.desc} → ${sty.desc}`});
        refreshRuleList();};
  
      applyBtn.onclick=applyRules;
  
      /* ─── context listeners ─── */
      stylePre.onchange = ()=>{updateContextControls();};
      surfaceSel.onchange=applySurface;
      viewSel.onchange   =()=>{applyViewStyle();updateContextControls();};
      selType.onchange   =()=>{chainMulti.style.display=selType.value==='chain'?'':'none';
                               customIn.style.display =selType.value==='custom'?'':'none';};
  
      /* ─── PDB loader ─── */
      async function loadPDB(id){
        viewer.clear(); rules=[];
        await $3Dmol.download(`pdb:${id}`,viewer,{});
        const atoms=viewer.selectedAtoms({});
        availableChains=[...new Set(atoms.filter(a=>a.chain).map(a=>a.chain))];
        populateChains(availableChains);
        rules=[{selStr:'{hetflag:false}',selObj:{hetflag:false},
                styleObj:{cartoon:{color:'spectrum'}},
                desc:'Protein → cartoon:spectrum'},
               {selStr:'{hetflag:true}', selObj:{hetflag:true},
                styleObj:{stick:{}},    desc:'Ligands → stick'},
               {selStr:'{resn:"HOH"}',  selObj:{resn:'HOH'},
                styleObj:{},            desc:'Hide water'}];
        refreshRuleList();applyRules();updateContextControls();
      }
      loadBtn.onclick=()=>loadPDB(pdbInput.value.trim()||'2POR');
  
      /* initial load */
      await loadPDB('2POR');
  
    } catch(e){container.innerHTML=`<p style="color:red;text-align:center">${e.message}</p>`;
               console.error(e);}
  };
  
  })();
  