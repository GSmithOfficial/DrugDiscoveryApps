/* components/3dmolviewer.js
   Minimal 3Dmol.js embed – shows PDB 2POR in stick representation with full UI.
   Relies on 3Dmol-min.js & 3Dmol.ui-min.js which must be loaded globally.
   Author: Web-App AI – 2025-07-16
*/
(function () {

    /* Utility – inject a script only once */
    function loadScriptOnce(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
      });
    }
  
    /* Public initializer - called by full-page.js */
    window.init3DMolViewer = function (container) {
  
      /* 1 – Guarantee the libraries are present */
      Promise.all([
        loadScriptOnce('https://3Dmol.org/build/3Dmol-min.js'),
        loadScriptOnce('https://3Dmol.org/build/3Dmol.ui-min.js')
      ]).then(() => {
  
        /* 2 – Inject the viewer host */
        container.innerHTML = `
          <div style="width:100%;height:600px;position:relative"
               class="viewer_3Dmoljs"
               data-pdb="6YHR"
               data-backgroundcolor="0xffffff"
               data-style="stick"
               data-ui="true">
          </div>`;
  
        /* 3 – If the UI script was already loaded earlier we need to “viewify” manually */
        if (window.$3Dmol && window.$3Dmol.viewify) {
          window.$3Dmol.viewify(container.querySelector('.viewer_3Dmoljs'));
        }
  
      }).catch(err => {
        container.innerHTML =
          `<p style="color:red;text-align:center">Unable to load 3Dmol.js – ${err.message}</p>`;
      });
    };
  
  })();
  