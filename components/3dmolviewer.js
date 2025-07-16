/* components/3dmolviewer.js – robust embed with on-demand loader */

(function () {

    /** load one <script> tag only if it isn’t already on the page */
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
  
    /** main initialiser – called when user clicks the Viewer tab */
    window.init3DMolViewer = async function (container) {
      try {
        /* 1 ─ ensure libs are present */
        await Promise.all([
          loadScript('https://3dmol.org/build/3Dmol-min.js'),
          loadScript('https://3dmol.org/build/3Dmol.ui-min.js')
        ]);
  
        /* 2 ─ inject the viewer host */
        container.innerHTML = `
          <div style="width:100%;height:600px;position:relative"
               class="viewer_3Dmoljs"
               data-pdb="2POR"
               data-backgroundcolor="0xffffff"
               data-style="stick"
               data-ui="true"></div>`;
  
        /* 3 ─ activate 3Dmol */
        if (window.$3Dmol && window.$3Dmol.viewify) {
          window.$3Dmol.viewify(
            container.querySelector('.viewer_3Dmoljs')
          );
        } else {
          throw new Error('$3Dmol not available after load');
        }
  
      } catch (err) {
        container.innerHTML =
          `<p style="color:red;text-align:center">${err.message}</p>`;
        console.error(err);
      }
    };
  
  })();
  