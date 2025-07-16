/* components/3dmolviewer.js  –  lean createViewer() embed
   Uses only 3Dmol-min.js (no UI bundle, so no external CORS issues)
*/

(function () {

    // Helper – promise-load one external script if it’s missing
    function loadScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = () => reject(new Error(`Couldn’t load ${src}`));
        document.head.appendChild(s);
      });
    }
  
    // Main initializer – called by the Viewer tab
    window.init3DMolViewer = async function (container) {
      try {
        // 1 Make absolutely sure the core library is present
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.5.1/3Dmol-min.js');
  
        // 2 Drop a host div into the page
        const host = document.createElement('div');
        host.style.cssText = 'width:100%;height:600px;position:relative';
        container.innerHTML = '';            // clear previous content
        container.appendChild(host);
  
        // 3 Create a viewer and load PDB 2POR
        const viewer = $3Dmol.createViewer(host, { backgroundColor: 'white' });
  
        // download() fetches the PDB and calls back when ready
        $3Dmol.download('pdb:2POR', viewer, {}, () => {
          viewer.setStyle({}, { stick: {} });   // stick representation
          viewer.zoomTo();                      // centre/zoom
          viewer.render();
        });
  
      } catch (err) {
        container.innerHTML =
          `<p style="color:red;text-align:center">${err.message}</p>`;
        console.error(err);
      }
    };
  
  })();
  