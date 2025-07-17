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
    if (document.querySelector(`script[src=\"${src}\"]`)) return res();
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = () => rej(Error(`load ${src}`));
    document.head.append(s);
  });

  window.init3DMolViewer = async container => {
    try {
      await loadScript('https://3dmol.org/build/3Dmol-min.js');

      /* ─── HTML skeleton (single flex row) ─── */
      container.innerHTML = `
        <div class=\"viewer-builder\">
          <div class=\"controls\" style=\"display:flex;flex-wrap:wrap;gap:6px\">
            <input type=\"text\" id=\"pdbInput\" value=\"2POR\" size=\"6\" style=\"width:auto\"/>
            <button id=\"loadBtn\">Load</button>

            <select id=\"selType\" style=\"width:auto\">
              <option value=\"protein\">Protein (hetflag:false)</option>
              <option value=\"ligand\">Ligands (all het)</option>
              <option value=\"chain\">Chain(s)…</option>
              <option value=\"custom\">Custom AtomSpec…</option>
            </select>
            <select id=\"chainMulti\" multiple size=\"1\" style=\"display:none;width:auto\"></select>
            <input type=\"text\" id=\"customInput\" placeholder=\"resi:19,23;chain:B\" size=\"16\" style=\"display:none;width:auto\"/>

            <select id=\"stylePreset\" style=\"width:auto\">
              <option value=\"cartoon\">Cartoon</option>
              <option value=\"stick\">Stick</option>
              <option value=\"sphere\">Sphere</option>
              <option value=\"line\">Line</option>
              <option value=\"cross\">Cross</option>
              <option value=\"hide\">Hide</option>
            </select>

            <button type=\"button\" id=\"colorPickerBtn\" class=\"color-picker-btn\"></button>
            <input type=\"color\" id=\"colorPicker\" value=\"#ffffff\" hidden />

            <select id=\"surfaceSelect\" title=\"Surface\" style=\"width:auto\">
              <option value=\"none\">No Surface</option>
              <option value=\"VDWSurface\">VDW</option>
              <option value=\"SASurface\">SAS</option>
              <option value=\"SES\">SES</option>
            </select>

            <select id=\"viewSelect\" title=\"View style\" style=\"width:auto;display:none\">
              <option value=\"none\">No AO</option>
              <option value=\"ao\">AO</option>
              <option value=\"outline\">Outline</option>
            </select>
            <button id=\"addRuleBtn\">Add rule</button>
            <button id=\"applyBtn\">Apply</button>
          </div>

          <ul id=\"rulesList\" class=\"rule-list\"></ul>
          <label style=\"font-size:12px\">Share URL
            <input type=\"text\" id=\"shareUrl\" class=\"share-url\" readonly />
          </label>
        </div>

        <div id=\"viewerHost\" style=\"width:100%;height:600px;position:relative;margin-top:.75rem\"></div>
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
      const colorBtn   = container.querySelector('#colorPickerBtn');
      const surfaceSel = container.querySelector('#surfaceSelect');
      const viewSel    = container.querySelector('#viewSelect');
      const addRuleBtn = container.querySelector('#addRuleBtn');
      const applyBtn   = container.querySelector('#applyBtn');
      const rulesList  = container.querySelector('#rulesList');
      const shareUrlEl = container.querySelector('#shareUrl');

      let rules = [], availableChains = [];

      /* ─── sync color btn ←→ input ─── */
      colorBtn.style.backgroundColor = colorPick.value;
      colorBtn.addEventListener('click', () => colorPick.click());
      colorPick.addEventListener('input', () => {
        colorBtn.style.backgroundColor = colorPick.value;
        updateContextControls();
      });

      /* ─── context-sensitive toggles ─── */
      function updateContextControls() {
        /* colour-picker visible only for colourable styles */
        const colourful = ['cartoon','stick','sphere','cross'].includes(stylePre.value);
        colorBtn.hidden = !colourful;

        /* view selector only shown if surface present OR user explicitly chose AO/outline */
        const needView = surfaceSel.value !== 'none' || viewSel.value !== 'none';
        viewSel.hidden = !needView;
      }

      /* ─── view style helper ─── */
      function applyViewStyle() {
        if (viewSel.value === 'ao')
          viewer.setViewStyle({style:'ambientOcclusion',strength:1,height:3});
        else if (viewSel.value === 'outline')
          viewer.setViewStyle({style:'outline',color:'black',width:0.1});
        else
          viewer.setViewStyle({style:'none'});
      }

      /* ─── surface helper ─── */
      function applySurface() {
        viewer.removeAllSurfaces();
        if (surfaceSel.value !== 'none') {
          viewer.addSurface($3Dmol.SurfaceType[surfaceSel.value],{opacity:0.7,color:'white'},{});
          if (viewSel.value === 'none') {
            viewSel.value = 'ao';
            applyViewStyle();
          }
        } else {
          if (['ao'].includes(viewSel.value)) {
            viewSel.value = 'none';
            applyViewStyle();
          }
        }
        updateContextControls();
        viewer.render();
      }

      /* ─── selection helpers (unchanged) ─── */
      const populateChains = arr => chainMulti.innerHTML = arr.map(c => `<option>${c}</option>`).join('');

      /* ─── rule-builder & styling helper ─── */
      function makeRule(p, col) {
        const selObj = (p === 'custom') ? JSON.parse(customIn.value) : (p === 'chain') ? {chain:chainMulti.value} : (p === 'ligand') ? {hetflag:true} : (p === 'protein') ? {hetflag:false} : {};
        const o = {};
        o[p] = (['cartoon','stick','sphere','cross'].includes(stylePre.value)) ? {color:col} : {};
        return {selStr: JSON.stringify(selObj), selObj, styleObj: o, desc: `${p} (color ${col})`};
      }

      /* ─── rule list UI & applyRules ─── */
      function refreshRuleList() {
        rulesList.innerHTML = rules.map((r,i) =>
          `<li class=\"rule-item\" data-idx=\"${i}\">
             <span class=\"handle\">☰</span><span>${i+1}.</span>
             <code>${r.desc}</code><button class=\"del\">✕</button></li>`
        ).join('');
      }

      function applyRules() {
        viewer.setStyle({}, {});
        viewer.removeAllSurfaces();
        rules.forEach(r => viewer.setStyle(r.selObj, r.styleObj));
        applySurface();
        applyViewStyle();
        viewer.render();
        viewer.zoomTo();

        const p = new URLSearchParams({pdb: pdbInput.value.trim() || '2POR'});
        rules.forEach((r,i) => {
          p.set(`select${i+1}`, r.selStr);
          p.set(`style${i+1}`, JSON.stringify(r.styleObj));
        });
        shareUrlEl.value = `${location.origin}${location.pathname}#${p.toString()}`;
      }

      /* ─── drag-n-drop, add / delete rules ─── */
      new Sortable(rulesList, {handle:'.handle', animation:150,
        onEnd: e => { const [m] = rules.splice(e.oldIndex,1);
                       rules.splice(e.newIndex,0,m);
                       refreshRuleList(); applyRules(); }
      });

      /* ─── context listeners ─── */
      stylePre.onchange   = () => { updateContextControls(); };
      surfaceSel.onchange = applySurface;
      viewSel.onchange    = () => { applyViewStyle(); updateContextControls(); };
      selType.onchange    = () => { chainMulti.style.display = selType.value === 'chain' ? '' : 'none'; customIn.style.display = selType.value === 'custom' ? '' : 'none'; };

      /* ─── PDB loader ─── */
      async function loadPDB(id) {
        viewer.clear(); rules = [];
        await $3Dmol.download(`pdb:${id}`, viewer, {});
        const atoms = viewer.selectedAtoms({});
        availableChains = [...new Set(atoms.filter(a=>a.chain).map(a=>a.chain))];
        populateChains(availableChains);
        rules = [
          {selStr:'{hetflag:false}', selObj:{hetflag:false}, styleObj:{cartoon:{color:'spectrum'}}, desc:'Protein → cartoon:spectrum'},
          {selStr:'{hetflag:true}', selObj:{hetflag:true},   styleObj:{stick:{}},    desc:'Ligands → stick'},
          {selStr:'{resn:\"HOH\"}', selObj:{resn:'HOH'},  styleObj:{},            desc:'Hide water'}
        ];
        refreshRuleList(); applyRules(); updateContextControls();
      }
      loadBtn.onclick = () => loadPDB(pdbInput.value.trim() || '2POR');

      /* ─── initial load ─── */
      await loadPDB('8PFO');

    } catch(e) {
      container.innerHTML = `<p style=\"color:red;text-align:center\">${e.message}</p>`;
      console.error(e);
    }
  };
})();
