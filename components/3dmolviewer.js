/* components/3dmolviewer.js
   Simplest possible embed: inject the div then explicitly viewify it.
   Assumes both 3Dmol-min.js and 3Dmol.ui-min.js are already loaded globally.
*/

(function () {

    window.init3DMolViewer = function (container) {
  
      // 1 – Drop the viewer host into the tab
      container.innerHTML = `
        <div style="width:100%;height:600px;position:relative"
             class="viewer_3Dmoljs"
             data-pdb="2POR"
             data-backgroundcolor="0xffffff"
             data-style="stick"
             data-ui="true">
        </div>`;
  
      // 2 – Tell 3Dmol to turn that div into an interactive viewer
      if (window.$3Dmol && window.$3Dmol.viewify) {
        window.$3Dmol.viewify(
          container.querySelector('.viewer_3Dmoljs')
        );
      } else {
        container.innerHTML =
          '<p style="color:red;text-align:center">' +
          '3Dmol libraries failed to load.</p>';
      }
    };
  
  })();
  