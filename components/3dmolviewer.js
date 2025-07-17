/* components/3dmolviewer.js
   ──────────────────────────────────────────────────────────────────────────
   Adds:
     • <select id="surfaceSelect">   → choose molecular surface   (None/VDW/SAS/SES)
     • <select id="viewSelect">      → choose global view style   (Default/AO/Outline)
   Keeps existing rule-builder UI untouched.
   2025-07-17
*/

(function () {

  /* ---------- tiny utilities ---------- */
  function loadScript(src) {
    return new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) return res();
      const s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = () => rej(new Error(`Could not load ${src}`));
      document.head.appendChild(s);
    });
  }
  
  /* ---------- inject once CSS already exists from previous version ---------- */
  function injectStyles() { /* no change – styles shipped previously */ }
  
  /* ======================================================================= */
  /*                           MAIN INITIALISER                              */
  /* ======================================================================= */
  window.init3DMolViewer = async function (container) {
    try {
      /* 1 – ensure libs ---------------------------------------------------- */
      await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.5.1/3Dmol-min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js')
      ]);
      if (!window.$3Dmol) throw new Error('$3Dmol global missing');
  
      /* 2 – skeleton HTML -------------------------------------------------- */
      injectStyles();
      container.innerHTML = `
        <div class="viewer-builder">
          <div class="controls">
            <input type="text" id="pdbInput" value="2POR" size="6" aria-label="PDB id"/>
            <button id="loadBtn">Load</button>
  
            <select id="selType">
              <option value="protein">Protein (hetflag:false)</option>
              <option value="ligand">Ligands (all het)</option>
              <option value="chain">Chain(s)…</option>
              <option value="custom">Custom AtomSpec…</option>
            </select>
            <select id="chainMulti" multiple size="1" style="display:none"></select>
            <input  type="text" id="customInput" placeholder="resi:19,23;chain:B" size="16"
                    style="display:none"/>
  
            <select id="stylePreset">
              <option value="cartoon">Cartoon</option>
              <option value="stick">Stick</option>
              <option value="sphere">Sphere</option>
              <option value="line">Line</option>
              <option value="cross">Cross</option>
              <option value="hide">Hide</option>
            </select>
            <input type="color" id="colorPicker" value="#ffffff"/>
  
            <!-- NEW: molecular surface selector -->
            <select id="surfaceSelect" title="Molecular surface">
              <option value="none">No Surface</option>
              <option value="VDW">VDW Surface</option>
              <option value="SAS">SAS Surface</option>
              <option value="SES">SES Surface</option>
            </select>
  
            <!-- NEW: view style selector -->
            <select id="viewSelect" title="Rendering effect">
              <option value="none">Default View</option>
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
  
        <div id="viewerHost"
             style="width:100%;height:600px;position:relative;margin-top:.75rem"></div>
      `;
  
      /* 3 – viewer + DOM refs --------------------------------------------- */
      const host         = container.querySelector('#viewerHost');
      const viewer       = $3Dmol.createViewer(host, { backgroundColor: 'white' });
  
      const pdbInput     = container.querySelector('#pdbInput');
      const loadBtn      = container.querySelector('#loadBtn');
      const selType      = container.querySelector('#selType');
      const chainMulti   = container.querySelector('#chainMulti');
      const customIn     = container.querySelector('#customInput');
      const stylePre     = container.querySelector('#stylePreset');
      const colorPick    = container.querySelector('#colorPicker');
      const surfaceSel   = container.querySelector('#surfaceSelect');   // NEW
      const viewSel      = container.querySelector('#viewSelect');      // NEW
      const addRuleBtn   = container.querySelector('#addRuleBtn');
      const applyBtn     = container.querySelector('#applyBtn');
      const rulesList    = container.querySelector('#rulesList');
      const shareUrlEl   = container.querySelector('#shareUrl');
  
      /* 4 – data stores ---------------------------------------------------- */
      let availableChains = [];
      let rules = [];
  
      /* ---------- helper: update global view style ------------------------ */
      function applyViewStyle() {
        switch (viewSel.value) {
          case 'ao':
            viewer.setViewStyle({ style: 'ambientOcclusion', strength: 1.0, radius: 5 });
            break;
          case 'outline':
            viewer.setViewStyle({ style: 'outline', color: 'black', width: 0.1 });
            break;
          default:
            viewer.setViewStyle({ style: 'none' });
        }
        viewer.render();
      }
  
      /* ---------- helper: update molecular surface ----------------------- */
      function applySurface() {
        viewer.removeAllSurfaces();
        if (surfaceSel.value !== 'none') {
          const type = $3Dmol.SurfaceType[surfaceSel.value];
          /* surface over entire current model set */
          viewer.addSurface(type,
            { opacity: 0.7, color: 'white' },
            {} /* atom selection – all atoms */
          );
        }
        viewer.render();
      }
  
      /* ---------- selection + style helpers (unchanged) ------------------ */
      function populateChains(arr) { chainMulti.innerHTML = arr.map(c =>
        `<option value="${c}">${c}</option>`).join(''); }
  
      function selectionFromUI() {
        switch (selType.value) {
          case 'protein': return { selStr: '{hetflag:false}', desc: 'Protein',
                                   selObj: { hetflag: false } };
          case 'ligand':  return { selStr: '{hetflag:true}', desc: 'Ligands',
                                   selObj: { hetflag: true } };
          case 'chain':   const cs = [...chainMulti.selectedOptions].map(o => o.value);
                          return { selStr: `{chain:'${cs.join(',')}'}`,
                                   desc: `Chain(s) ${cs.join(',')}`,
                                   selObj: { chain: cs.join(',') } };
          case 'custom':  const raw = customIn.value.trim();
                          return { selStr: raw, desc: `Custom: ${raw}`,
                                   selObj: eval('(' + raw + ')') }; // eslint-disable-line
          default:        return { selStr: '{}', desc: 'All atoms', selObj: {} };
        }
      }
  
      function styleFromUI() {
        const col = colorPick.value, p = stylePre.value;
        if (p === 'hide') return { desc: 'Hide', obj: {} };
        const o = {}; o[p] = (p === 'cartoon' || p === 'stick' ||
                              p === 'sphere'  || p === 'cross')
                            ? { color: col } : {};
        return { desc: `${p} (color ${col})`, obj: o };
      }
  
      /* ---------- rule list and applyRules (surface + view) -------------- */
      function refreshRuleList() {
        rulesList.innerHTML = rules.map((r,i) =>
          `<li class="rule-item" data-idx="${i}">
             <span class="handle">☰</span><span>${i+1}.</span>
             <code>${r.desc}</code><button class="del">✕</button></li>`).join('');
      }
  
      function applyRules() {
        viewer.setStyle({}, {});
        viewer.removeAllSurfaces(); // will be re-added below
  
        rules.forEach(r => viewer.setStyle(r.selObj, r.styleObj));
  
        /* surfaces & view style */
        applySurface();
        applyViewStyle();
  
        viewer.render();
        viewer.zoomTo();
  
        /* share URL */
        const p = new URLSearchParams({ pdb: pdbInput.value.trim() || '2POR' });
        rules.forEach((r,i) => { p.set(`select${i+1}`, r.selStr);
                                 p.set(`style${i+1}`,  JSON.stringify(r.styleObj)); });
        shareUrlEl.value = `${location.origin}${location.pathname}#${p.toString()}`;
      }
  
      /* ---------- drag-and-drop, rule add/del (unchanged) ---------------- */
      new Sortable(rulesList,{
        handle:'.handle', animation:150,
        onEnd:e=>{const[m]=rules.splice(e.oldIndex,1);
                  rules.splice(e.newIndex,0,m); refreshRuleList(); applyRules();}
      });
      rulesList.addEventListener('click', e=>{
        if(e.target.classList.contains('del')){
          const idx=+e.target.closest('.rule-item').dataset.idx;
          rules.splice(idx,1); refreshRuleList(); applyRules();
        }
      });
  
      addRuleBtn.onclick = () => {
        const s=selectionFromUI(), sty=styleFromUI();
        rules.push({ selStr:s.selStr, selObj:s.selObj,
                     styleObj:sty.obj, desc:`${s.desc} → ${sty.desc}` });
        refreshRuleList();
      };
      applyBtn.onclick   = applyRules;
      surfaceSel.onchange = applySurface;   // NEW
      viewSel.onchange    = applyViewStyle; // NEW
  
      selType.onchange = () => {
        chainMulti.style.display = selType.value==='chain' ? '' : 'none';
        customIn.style.display   = selType.value==='custom'? '' : 'none';
      };
  
      /* ---------- PDB loader (defaults + chains) ------------------------- */
      async function loadPDB(id){
        viewer.clear(); rules=[];
        await $3Dmol.download(`pdb:${id}`, viewer, {});
        const atoms = viewer.selectedAtoms({});
        availableChains = [...new Set(atoms.filter(a=>a.chain).map(a=>a.chain))];
        populateChains(availableChains);
  
        /* default rules */
        rules.push({ selStr:'{hetflag:false}',  selObj:{hetflag:false},
                     styleObj:{cartoon:{color:'spectrum'}},
                     desc:'Protein → cartoon:spectrum'});
        rules.push({ selStr:'{hetflag:true}',   selObj:{hetflag:true},
                     styleObj:{stick:{}}, desc:'Ligands → stick'});
        rules.push({ selStr:'{resn:"HOH"}',     selObj:{resn:'HOH'},
                     styleObj:{}, desc:'Hide water'});
        refreshRuleList(); applyRules();
      }
  
      loadBtn.onclick = () => loadPDB(pdbInput.value.trim()||'2POR');
  
      /* ---------- deep-link or default load ------------------------------ */
      if(location.hash.includes('pdb=')){
        const p=new URLSearchParams(location.hash.slice(1));
        pdbInput.value = p.get('pdb') || '2POR';
        await loadPDB(pdbInput.value);
        let i=1; while(p.has(`select${i}`)&&p.has(`style${i}`)){
          try { rules[i-1] = { selStr:p.get(`select${i}`),
                               selObj:eval('('+p.get(`select${i}`)+')'),
                               styleObj:JSON.parse(p.get(`style${i}`)),
                               desc:`Rule ${i} (from URL)` }; }
          catch{} i++; }
        refreshRuleList(); applyRules();
      } else {
        await loadPDB('2POR');
      }
  
    } catch(err){
      container.innerHTML =
        `<p style="color:red;text-align:center">${err.message}</p>`;
      console.error(err);
    }
  };
  
  })();
  