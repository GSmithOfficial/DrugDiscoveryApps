/* components/3dmolviewer.js  —  Plan A: smart default + quick toggle
   Requires 3Dmol-min.js (we load it from cdnjs in index.html).
   2025-07-16
*/

(function () {

    /* ------------------------------------------------------------------ utils */
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
      if (document.getElementById('viewer-controls-css')) return;
      const style = document.createElement('style');
      style.id = 'viewer-controls-css';
      style.textContent = `
        .viewer-controls{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem;
                         font:400 14px/1.3 system-ui}
        .viewer-controls input[type=text],
        .viewer-controls select{padding:.25rem .5rem;border:1px solid #ccc;border-radius:4px}
        .viewer-controls button{padding:.25rem .75rem;border:0;border-radius:4px;
                                 background:#0d6efd;color:#fff;cursor:pointer}
        .viewer-controls button.secondary{background:#6c757d}
        .viewer-controls label{display:flex;align-items:center;gap:.25rem}
      `;
      document.head.appendChild(style);
    }
  
    /* ----------------------------------------------------------- main init() */
    window.init3DMolViewer = async function (container) {
      try {
        /* 1 ─ ensure core lib */
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.5.1/3Dmol-min.js');
        if (!window.$3Dmol) throw new Error('$3Dmol global missing');
  
        /* 2 ─ UI skeleton */
        injectStyles();
        container.innerHTML = `
          <div class="viewer-controls">
            <input type="text" id="pdbInput" value="2POR" size="6" aria-label="PDB id"/>
            <button id="loadBtn">Load</button>
  
            <select id="styleSelect" aria-label="Protein style">
              <option value="cartoon">Cartoon</option>
              <option value="stick">Stick</option>
              <option value="sphere">Sphere</option>
              <option value="line">Line</option>
            </select>
  
            <label><input type="checkbox" id="ligandChk" checked/> Ligand stick</label>
            <label><input type="checkbox" id="surfaceChk"/> Surface</label>
            <label><input type="checkbox" id="spinChk"/> Spin</label>
  
            <button id="resetBtn" class="secondary">Reset</button>
          </div>
  
          <div id="viewerHost" style="width:100%;height:600px;position:relative"></div>
        `;
  
        /* 3 ─ viewer & helpers */
        const host   = container.querySelector('#viewerHost');
        const viewer = $3Dmol.createViewer(host, { backgroundColor: 'white' });
  
        const pdbInput    = container.querySelector('#pdbInput');
        const loadBtn     = container.querySelector('#loadBtn');
        const styleSelect = container.querySelector('#styleSelect');
        const ligandChk   = container.querySelector('#ligandChk');
        const surfaceChk  = container.querySelector('#surfaceChk');
        const spinChk     = container.querySelector('#spinChk');
        const resetBtn    = container.querySelector('#resetBtn');
  
        /* Build style object from dropdown value */
        const proteinStyleOf = val => ({ [val]: val === 'cartoon' ? { color: 'spectrum' } : {} });
  
        /** Apply / refresh all styles in one place */
        function renderScene() {
          viewer.setStyle({}, {});                        /* clear styles       */
          viewer.removeAllSurfaces();                     /* clear surfaces     */
  
          /* Protein */
          viewer.setStyle({}, proteinStyleOf(styleSelect.value));
  
          /* Ligand layer */
          if (ligandChk.checked) {
            viewer.setStyle({ hetflag: true, resn: 'HOH', invert: true }, { stick: {} });
          }
  
          /* Optional VDW surface */
          if (surfaceChk.checked) {
            viewer.addSurface($3Dmol.SurfaceType.VDW,
              { opacity: 0.7, color: 'white' });
          }
  
          viewer.render();
        }
  
        /** Download & show a structure */
        async function loadStructure(id) {
          viewer.clear();
          await $3Dmol.download(`pdb:${id}`, viewer, {});
          viewer.zoomTo();
          renderScene();
        }
  
        /* 4 ─ hook up UI */
        loadBtn.onclick      = () => loadStructure(pdbInput.value.trim() || '2POR');
        styleSelect.onchange = renderScene;
        ligandChk.onchange   = renderScene;
        surfaceChk.onchange  = renderScene;
        spinChk.onchange     = () => spinChk.checked ? viewer.spin('y', 1) : viewer.spin(false);
        resetBtn.onclick     = () => { viewer.zoomTo(); viewer.render(); };
  
        /* 5 ─ initial scene */
        await loadStructure('2POR');
  
      } catch (err) {
        container.innerHTML =
          `<p style="color:red;text-align:center">${err.message}</p>`;
        console.error(err);
      }
    };
  
  })();
  