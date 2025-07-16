/* components/3dmolviewer.js
   ──────────────────────────────────────────────────────────────────────────
   3Dmol.js visual query builder (Plan B)
   • Load any PDB    →  $3Dmol.download()
   • Build ordered styling rules via UI
   • Shareable URL   →  #pdb=8PFO&select1=hetflag:true&style1=stick...
   • Drag-and-drop rule re-ordering (SortableJS)

   External deps (loaded on-demand):
     – 3Dmol-min.js  (cdnjs)
     – SortableJS    (jsDelivr)

   Geoffrey-AI  · 2025-07-16
   ────────────────────────────────────────────────────────────────────────── */

   (function () {
    /* ─────────────────────────── utilities ──────────────────────────────── */
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
  
    function injectStyles() {
      if (document.getElementById('viewer-builder-css')) return;
      const css = `
        .viewer-builder{font:400 14px/1.4 system-ui}
        .viewer-builder .controls{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem}
        .viewer-builder input[type=text],.viewer-builder select{
          padding:.25rem .5rem;border:1px solid #ccc;border-radius:4px;min-height:30px}
        .viewer-builder button{padding:.25rem .75rem;border:0;border-radius:4px;
          background:#0d6efd;color:#fff;cursor:pointer;min-height:30px}
        .viewer-builder button.secondary{background:#6c757d}
        .viewer-builder label{display:flex;align-items:center;gap:.25rem}
        .rule-list{list-style:none;padding:0;margin:.5rem 0;display:flex;flex-direction:column;gap:.25rem}
        .rule-item{display:flex;align-items:center;gap:.5rem;padding:.25rem .5rem;
          background:#f8f9fa;border:1px solid #e0e0e0;border-radius:4px;cursor:grab}
        .rule-item .handle{font-weight:700;cursor:grab}
        .rule-item .del{margin-left:auto;background:#dc3545}
        .share-url{width:100%;padding:.25rem .5rem;font-size:12px;border:1px solid #ccc;border-radius:4px}
      `;
      const style = document.createElement('style');
      style.id = 'viewer-builder-css';
      style.textContent = css;
      document.head.appendChild(style);
    }
  
    /* ───────────────────────── main init() ──────────────────────────────── */
    window.init3DMolViewer = async function (container) {
      try {
        /* 1 ─ ensure libs */
        await Promise.all([
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.5.1/3Dmol-min.js'),
          loadScript('https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js')
        ]);
        if (!window.$3Dmol) throw new Error('$3Dmol global missing');
  
        /* 2 ─ skeleton HTML & CSS */
        injectStyles();
        container.innerHTML = `
          <div class="viewer-builder">
            <div class="controls">
              <input type="text" id="pdbInput" value="2POR" size="6" aria-label="PDB id"/>
              <button id="loadBtn">Load</button>
              <select id="selType">
                <option value="protein">Protein (all)</option>
                <option value="ligand">Ligands (non-water het)</option>
                <option value="chain">Chain(s)…</option>
                <option value="custom">Custom AtomSpec…</option>
              </select>
              <select id="chainMulti" multiple size="1" style="display:none"></select>
              <input type="text" id="customInput" placeholder="resi:23;chain:B"
                     style="display:none" size="16"/>
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
  
        /* 3 ─ viewer instance */
        const host   = container.querySelector('#viewerHost');
        const viewer = $3Dmol.createViewer(host, { backgroundColor: 'white' });
  
        /* 4 ─ UI refs */
        const pdbInput   = container.querySelector('#pdbInput');
        const loadBtn    = container.querySelector('#loadBtn');
        const selType    = container.querySelector('#selType');
        const chainMulti = container.querySelector('#chainMulti');
        const customIn   = container.querySelector('#customInput');
        const stylePre   = container.querySelector('#stylePreset');
        const colorPick  = container.querySelector('#colorPicker');
        const addRuleBtn = container.querySelector('#addRuleBtn');
        const applyBtn   = container.querySelector('#applyBtn');
        const rulesList  = container.querySelector('#rulesList');
        const shareUrlEl = container.querySelector('#shareUrl');
  
        /* 5 ─ dynamic data */
        let availableChains = [];     // populated after PDB load
        let rules = [];               // {selStr, styleObj, description}
  
        /* 6 ─ chain dropdown helper */
        function populateChains(chainsArr) {
          chainMulti.innerHTML = '';
          chainsArr.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            chainMulti.appendChild(opt);
          });
        }
  
        /* 7 ─ parse AtomSpec from UI selection */
        function selectionFromUI() {
          switch (selType.value) {
            case 'protein':
              return { selStr: '{}', desc: 'Protein (all atoms)', selObj: {} };
            case 'ligand':
              return {
                selStr: '{hetflag:true,resn:\'HOH\',invert:true}',
                desc: 'Ligands (het ≠ HOH)',
                selObj: { hetflag: true, resn: 'HOH', invert: true }
              };
            case 'chain':
              const chains = [...chainMulti.selectedOptions].map(o => o.value);
              return {
                selStr: `{chain:'${chains.join(',')}'}`,
                desc: `Chain(s) ${chains.join(',')}`,
                selObj: { chain: chains.join(',') }
              };
            case 'custom':
              const raw = customIn.value.trim();
              return { selStr: raw, desc: `Custom: ${raw}`, selObj: eval('(' + raw + ')') }; // eslint-disable-line
            default:
              return { selStr: '{}', desc: 'All atoms', selObj: {} };
          }
        }
  
        /* 8 ─ style object from preset + colour */
        function styleFromUI() {
          const col = colorPick.value;
          const preset = stylePre.value;
          if (preset === 'hide') return { desc: 'Hide', obj: {} };
          const obj = {};
          obj[preset] = (preset === 'cartoon' || preset === 'stick' || preset === 'sphere')
            ? { color: col }
            : {};
          return { desc: `${preset} (color ${col})`, obj };
        }
  
        /* 9 ─ render rule list UI */
        function refreshRuleList() {
          rulesList.innerHTML = '';
          rules.forEach((r, idx) => {
            const li = document.createElement('li');
            li.className = 'rule-item';
            li.dataset.idx = idx;
            li.innerHTML = `
              <span class="handle">☰</span>
              <span>${idx + 1}.</span>
              <code>${r.desc}</code>
              <button class="del">✕</button>`;
            rulesList.appendChild(li);
          });
        }
  
        /* 10 ─ build scene from rules */
        function applyRules() {
          viewer.setStyle({}, {});      // clear all styles
          rules.forEach(r => viewer.setStyle(r.selObj, r.styleObj));
          viewer.render();
          viewer.zoomTo();
  
          /* build share URL */
          const params = new URLSearchParams({ pdb: pdbInput.value.trim() || '2POR' });
          rules.forEach((r, i) => {
            params.set(`select${i + 1}`, r.selStr);
            params.set(`style${i + 1}`, JSON.stringify(r.styleObj));
          });
          shareUrlEl.value = `${location.origin}${location.pathname}#${params.toString()}`;
        }
  
        /* 11 ─ SortableJS for drag-reorder */
        new Sortable(rulesList, {
          handle: '.handle',
          animation: 150,
          onEnd: evt => {
            const [moved] = rules.splice(evt.oldIndex, 1);
            rules.splice(evt.newIndex, 0, moved);
            refreshRuleList();
            applyRules();
          }
        });
  
        /* 12 ─ rule list click handlers (delete) */
        rulesList.addEventListener('click', e => {
          if (e.target.classList.contains('del')) {
            const idx = +e.target.closest('.rule-item').dataset.idx;
            rules.splice(idx, 1);
            refreshRuleList();
            applyRules();
          }
        });
  
        /* 13 ─ add rule */
        addRuleBtn.onclick = () => {
          const sel = selectionFromUI();
          const sty = styleFromUI();
          rules.push({
            selStr: sel.selStr,
            selObj: sel.selObj,
            styleObj: sty.obj,
            desc: `${sel.desc} → ${sty.desc}`
          });
          refreshRuleList();
        };
  
        /* 14 ─ apply scene */
        applyBtn.onclick = applyRules;
  
        /* 15 ─ selection type change (show/hide inputs) */
        selType.onchange = () => {
          chainMulti.style.display = selType.value === 'chain' ? '' : 'none';
          customIn.style.display   = selType.value === 'custom' ? '' : 'none';
        };
  
        /* 16 ─ load PDB + auto default rules */
        async function loadPDB(id) {
          viewer.clear();
          rules = [];            // reset rules
          await $3Dmol.download(`pdb:${id}`, viewer, {});
          /* populate chains */
          const atoms = viewer.selectedAtoms({});
          availableChains = [...new Set(atoms.map(a => a.chain || '-'))].filter(Boolean);
          populateChains(availableChains);
  
          /* default two rules */
          rules.push({
            selStr: '{}',
            selObj: {},
            styleObj: { cartoon: { color: 'spectrum' } },
            desc: 'Protein → cartoon:spectrum'
          });
          rules.push({
            selStr: '{hetflag:true,resn:\'HOH\',invert:true}',
            selObj: { hetflag: true, resn: 'HOH', invert: true },
            styleObj: { stick: {} },
            desc: 'Ligands (het≠HOH) → stick'
          });
          refreshRuleList();
          applyRules();
        }
  
        /* 17 ─ load button */
        loadBtn.onclick = () => loadPDB(pdbInput.value.trim() || '2POR');
  
        /* 18 ─ deep-link support */
        if (location.hash.includes('pdb=')) {
          const p = new URLSearchParams(location.hash.slice(1));
          pdbInput.value = p.get('pdb') || '2POR';
          await loadPDB(pdbInput.value);
          let i = 1;
          while (p.has(`select${i}`) && p.has(`style${i}`)) {
            try {
              rules[i - 1] = {   // override defaults in order
                selStr: p.get(`select${i}`),
                selObj: eval('(' + p.get(`select${i}`) + ')'), // eslint-disable-line
                styleObj: JSON.parse(p.get(`style${i}`)),
                desc: `Rule ${i} (from URL)`
              };
            } catch { /* ignore bad JSON */ }
            i++;
          }
          refreshRuleList();
          applyRules();
        } else {
          /* initial load default – 2POR */
          await loadPDB('2POR');
        }
  
      } catch (err) {
        container.innerHTML =
          `<p style="color:red;text-align:center">${err.message}</p>`;
        console.error(err);
      }
    };
  
  })();
  