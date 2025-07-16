/* components/3dmolviewer.js
   3Dmol.js viewer + minimalist toolbar
   Requires 3Dmol-min.js to be loaded globally (we use cdnjs in index.html).
   2025-07-16
*/

(function () {

    /** ensure a script is present (no-op if already in <head>) */
    function loadScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = () => reject(new Error(`Could not load ${src}`));
        document.head.appendChild(s);
      });
    }
  
    /** inject one-shot component styles */
    function injectStyles() {
      if (document.getElementById('viewer-controls-css')) return;
      const css = `
        .viewer-controls{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem;font:400 14px/1.3 system-ui}
        .viewer-controls input[type=text],
        .viewer-controls select{padding:.25rem .5rem;border:1px solid #ccc;border-radius:4px}
        .viewer-controls button{padding:.25rem .75rem;border:0;border-radius:4px;background:#0d6efd;color:#fff;cursor:pointer}
        .viewer-controls button.secondary{background:#6c757d}
        .viewer-controls label{display:flex;align-items:center;gap:.25rem}
      `;
      const style = document.createElement('style');
      style.id = 'viewer-controls-css';
      style.textContent = css;
      document.head.appendChild(style);
    }
  
    /** MAIN INIT – called by the “Viewer” tab */
    window.init3DMolViewer = async function (container) {
      try {
        // 1  Make sure core library is ready
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.5.1/3Dmol-min.js');
        if (!window.$3Dmol) throw new Error('$3Dmol global missing');
  
        // 2  Inject toolbar + host div
        injectStyles();
        container.innerHTML = `
          <div class="viewer-controls">
            <input type="text" id="pdbInput" value="2POR" size="6" aria-label="PDB id"/>
            <button id="loadBtn">Load</button>
  
            <select id="styleSelect" aria-label="Main style">
              <option value="cartoon">Cartoon</option>
              <option value="stick">Stick</option>
              <option value="sphere">Sphere</option>
              <option value="line">Line</option>
            </select>
  
            <label><input type="checkbox" id="surfaceChk"/> Surface</label>
            <label><input type="checkbox" id="spinChk"/> Spin</label>
  
            <button id="resetBtn" class="secondary">Reset</button>
          </div>
          <div id="viewerHost" style="width:100%;height:600px;position:relative"></div>
        `;
  
        // 3  Create viewer
        const host   = container.querySelector('#viewerHost');
        const viewer = $3Dmol.createViewer(host, { backgroundColor: 'white' });
  
        /** helper – apply chosen style & optional surface */
        function applyRepresentation(style) {
          viewer.setStyle({}, { [style]: {} });
          if (surfaceChk.checked) {
            viewer.removeAllSurfaces();
            viewer.addSurface($3Dmol.SurfaceType.VDW,
              { opacity: 0.7, color: 'white' });
          } else {
            viewer.removeAllSurfaces();
          }
        }
  
        /** download & display a new structure */
        async function loadStructure(id) {
          viewer.clear();
          await $3Dmol.download(`pdb:${id}`, viewer, {});
          applyRepresentation(styleSelect.value);
          viewer.zoomTo();
          viewer.render();
        }
  
        /** wire controls */
        const pdbInput     = container.querySelector('#pdbInput');
        const loadBtn      = container.querySelector('#loadBtn');
        const styleSelect  = container.querySelector('#styleSelect');
        const surfaceChk   = container.querySelector('#surfaceChk');
        const spinChk      = container.querySelector('#spinChk');
        const resetBtn     = container.querySelector('#resetBtn');
  
        loadBtn.onclick = () => loadStructure(pdbInput.value.trim() || '2POR');
        styleSelect.onchange = () => { applyRepresentation(styleSelect.value); viewer.render(); };
        surfaceChk.onchange  = () => { applyRepresentation(styleSelect.value); viewer.render(); };
        spinChk.onchange     = () => spinChk.checked ? viewer.spin('y',1) : viewer.spin(false);
        resetBtn.onclick     = () => { viewer.zoomTo(); viewer.render(); };
  
        // 4  Initial load
        await loadStructure('2POR');
  
      } catch (err) {
        container.innerHTML =
          `<p style="color:red;text-align:center">${err.message}</p>`;
        console.error(err);
      }
    };
  
  })();
  