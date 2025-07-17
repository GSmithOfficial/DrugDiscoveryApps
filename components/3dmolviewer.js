(function () {
  // Helper to load scripts if they aren't already on the page.
  async function loadScript(src) {
    if (document.querySelector(`script[src="${src}"]`)) return;
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = () => rej(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(s);
    });
  }

  // This function is called by your app's main script to initialize the tool.
  window.init3DMolViewer = async function (container) {
    try {
      // 1. Ensure required libraries (3Dmol.js, Sortable.js) are loaded.
      await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.5.1/3Dmol-min.js'),
        loadScript('https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js')
      ]);

      if (!window.$3Dmol || !window.Sortable) {
        throw new Error('A required library (3Dmol or SortableJS) failed to load.');
      }

      // 2. Define the new component HTML structure.
      container.innerHTML = `
        <div class="tool-section">
          <h3>3D Molecule Viewer</h3>
          <p>Build a custom molecular visualization by adding rules, then see the result in the viewer.</p>
          
          <div class="viewer-controls-grid">
            <div class="input-group pdb-input-group">
              <div style="flex-grow:1;">
                <label for="pdbInput">PDB ID</label>
                <input type="text" id="pdbInput" value="2POR" />
              </div>
              <button id="loadBtn">Load</button>
            </div>
            <div class="input-group">
              <label for="selType">Selection</label>
              <select id="selType"><option value="protein">Protein</option><option value="ligand">Ligands</option><option value="chain">Chain(s)</option><option value="custom">Custom</option></select>
            </div>
            <div class="input-group">
              <label for="stylePreset">Style</label>
              <select id="stylePreset"><option value="cartoon">Cartoon</option><option value="stick">Stick</option><option value="sphere">Sphere</option><option value="line">Line</option><option value="cross">Cross</option><option value="hide">Hide</option></select>
            </div>
            <div class="input-group">
              <label for="colorPicker">Color</label>
              <input type="color" id="colorPicker" value="#3498db" style="padding: 4px; height: 44px;">
            </div>
            <div class="input-group">
              <label for="surfaceSelect">Surface</label>
              <select id="surfaceSelect"><option value="none">No Surface</option><option value="VDW">VDW</option><option value="SAS">SAS</option><option value="SES">SES</option></select>
            </div>
             <div class="input-group">
              <label for="viewSelect">Effect</label>
              <select id="viewSelect"><option value="none">Default</option><option value="ao">AO</option><option value="outline">Outline</option></select>
            </div>
            <div class="input-group">
               <label style="opacity:0;">Actions</label>
               <button id="addRuleBtn" class="btn-secondary">Add Rule</button>
            </div>
          </div>
          
          <select id="chainMulti" multiple size="3" style="display:none; width: 100%; margin-bottom: 16px;"></select>
          <input type="text" id="customInput" placeholder="e.g., resi:19,23;chain:'B'" style="display:none; width:100%; margin-bottom: 16px;"/>

          <label>Rule Stack (drag to reorder)</label>
          <ul id="rulesList" class="rule-list"></ul>

          <div class="viewer-container">
            <div id="gldiv-3dmol" style="width: 100%; height: 100%; position: relative;"></div>
            <div class="camera-toolbar">
              <button id="camera-zoomIn" title="Zoom In">+</button>
              <button id="camera-zoomOut" title="Zoom Out">-</button>
              <button id="camera-resetView" title="Reset View">Reset</button>
              <button id="camera-toggleSpin" title="Toggle Spin">Spin</button>
            </div>
          </div>
          
          <div class="input-group" style="margin-top: 16px;">
            <label for="shareUrl">Share URL</label>
            <input type="text" id="shareUrl" readonly />
          </div>
        </div>
      `;

      // 3. Get references to all DOM elements.
      const host = container.querySelector('#gldiv-3dmol');
      const pdbInput = container.querySelector('#pdbInput');
      const loadBtn = container.querySelector('#loadBtn');
      const selType = container.querySelector('#selType');
      const chainMulti = container.querySelector('#chainMulti');
      const customIn = container.querySelector('#customInput');
      const stylePre = container.querySelector('#stylePreset');
      const colorPick = container.querySelector('#colorPicker');
      const surfaceSel = container.querySelector('#surfaceSelect');
      const viewSel = container.querySelector('#viewSelect');
      const addRuleBtn = container.querySelector('#addRuleBtn');
      const rulesList = container.querySelector('#rulesList');
      const shareUrlEl = container.querySelector('#shareUrl');

      // 4. Initialize viewer and data stores.
      const viewer = $3Dmol.createViewer(host, { backgroundColor: 'var(--white, #FFF)', antialias: true });
      let rules = [];

      // 5. Core functions.
      const applyViewAndSurface = () => {
        viewer.removeAllSurfaces();
        if (surfaceSel.value !== 'none') {
            const type = $3Dmol.SurfaceType[surfaceSel.value];
            viewer.addSurface(type, { opacity: 0.7, color: 'white' }, {});
        }
        const style = viewSel.value;
        if(style === 'ao') viewer.setViewStyle({ style: 'ambientOcclusion', strength: 0.7, radius: 5 });
        else if(style === 'outline') viewer.setViewStyle({ style: 'outline', color: 'black', width: 0.05 });
        else viewer.setViewStyle({ style: 'none' });
      };

      const selectionFromUI = () => {
        switch (selType.value) {
            case 'protein': return { selStr: '{hetflag:false}', desc: 'Protein', selObj: { hetflag: false } };
            case 'ligand':  return { selStr: '{hetflag:true}', desc: 'Ligands', selObj: { hetflag: true } };
            case 'chain':   const cs = [...chainMulti.selectedOptions].map(o => o.value); return { selStr: `{chain:'${cs.join(',')}'}`, desc: `Chain(s) ${cs.join(',')}`, selObj: { chain: cs } };
            case 'custom':
                const raw = customIn.value.trim();
                const selObj = eval('({' + raw + '})'); // Replicates original functionality.
                return { selStr: raw, desc: `Custom: ${raw}`, selObj: selObj };
            default: return { selStr: '{}', desc: 'All atoms', selObj: {} };
        }
      };

      const styleFromUI = () => {
        const style = stylePre.value;
        const color = colorPick.value;
        if (style === 'hide') return { desc: 'Hide', obj: {} };
        const styleObj = { [style]: { color: color } };
        return { desc: `${style} (${color})`, obj: styleObj };
      };

      const applyRules = () => {
        viewer.setStyle({}, {});
        rules.forEach(r => viewer.setStyle(r.selObj, r.styleObj));
        applyViewAndSurface();
        viewer.render();
        const p = new URLSearchParams({ pdb: pdbInput.value.trim() || '2POR' });
        rules.forEach((r, i) => {
             p.set(`select${i+1}`, r.selStr);
             p.set(`style${i+1}`, JSON.stringify(r.styleObj));
        });
        shareUrlEl.value = `${location.origin}${location.pathname}#${p.toString()}`;
      };
      
      const refreshRuleList = () => {
        rulesList.innerHTML = rules.map((r, i) =>
          `<li class="rule-item" data-idx="${i}"><span class="handle">☰</span><code>${r.desc}</code><button class="del">✕</button></li>`
        ).join('');
        applyRules();
      };

      const loadPDB = async (id) => {
        viewer.clear();
        await $3Dmol.download(`pdb:${id}`, viewer, { doAssembly: true, noSecondaryStrucs: false });
        const atoms = viewer.selectedAtoms({});
        const availableChains = [...new Set(atoms.filter(a => a.chain).map(a => a.chain))].sort();
        chainMulti.innerHTML = availableChains.map(c => `<option value="${c}">${c}</option>`).join('');
        rules = [
          { selStr: '{hetflag:false}', selObj: { hetflag: false }, styleObj: { cartoon: { color: 'spectrum' } }, desc: 'Protein → Cartoon (Spectrum)' },
          { selStr: '{hetflag:true}', selObj: { hetflag: true }, styleObj: { stick: {} }, desc: 'Ligands → Stick' },
          { selStr: '{resn:"HOH"}', selObj:{resn:"HOH"}, styleObj:{}, desc:'Hide water'}
        ];
        refreshRuleList();
        viewer.zoomTo();
      };
      
      // 6. Attach all event handlers.
      loadBtn.addEventListener('click', () => loadPDB(pdbInput.value.trim() || '2POR'));
      
      addRuleBtn.addEventListener('click', () => {
          const selection = selectionFromUI();
          const style = styleFromUI();
          rules.push({ ...selection, styleObj: style.obj, desc: `${selection.desc} → ${style.desc}` });
          refreshRuleList();
      });

      surfaceSel.addEventListener('change', applyRules);
      viewSel.addEventListener('change', applyRules);
      
      selType.addEventListener('change', () => {
          chainMulti.style.display = selType.value === 'chain' ? 'block' : 'none';
          customIn.style.display = selType.value === 'custom' ? 'block' : 'none';
      });
      
      rulesList.addEventListener('click', e => {
          if (e.target.classList.contains('del')) {
              const idx = +e.target.closest('.rule-item').dataset.idx;
              rules.splice(idx, 1);
              refreshRuleList();
          }
      });
      
      Sortable.create(rulesList, {
          handle: '.handle', animation: 150,
          onEnd: e => {
              const [movedItem] = rules.splice(e.oldIndex, 1);
              rules.splice(e.newIndex, 0, movedItem);
              refreshRuleList();
          }
      });

      container.querySelector('#camera-zoomIn').addEventListener('click', () => viewer.zoom(1.2, 200));
      container.querySelector('#camera-zoomOut').addEventListener('click', () => viewer.zoom(0.8, 200));
      container.querySelector('#camera-resetView').addEventListener('click', () => viewer.zoomTo(200));
      container.querySelector('#camera-toggleSpin').addEventListener('click', () => viewer.spin(!viewer.isSpinning()));

      // 7. Initial Load.
      await loadPDB('2POR');

    } catch (err) {
      container.innerHTML = `<div class="tool-section"><p style="color:var(--error)">Error: ${err.message}</p></div>`;
      console.error(err);
    }
  };
})();