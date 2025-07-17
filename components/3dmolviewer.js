// ================================================================
// 3Dmol.js Viewer Component (2025)
// - Integrates with full-page.js loader
// - Features a self-contained hover-toolbar for UI/UX
// ================================================================

function init3DMolViewer(container) {
  // 1. Clear the container and create the viewer's HTML structure
  //    This includes the main container and the new floating toolbar.
  container.innerHTML = `
    <div class="tool-section">
      <h3>3D Molecule Viewer</h3>
      <p>Load a protein from the PDB database or use the default example.</p>
      
      <div class="viewer-container">
        <div id="gldiv-3dmol" style="width: 100%; height: 100%; position: relative;"></div>

        <div class="toolbar">
          <button id="mol-zoomIn" title="Zoom In">+</button>
          <button id="mol-zoomOut" title="Zoom Out">-</button>
          <button id="mol-rotateLeft" title="Rotate Left">⟲</button>
          <button id="mol-rotateRight" title="Rotate Right">⟳</button>
          <button id="mol-resetView" title="Reset View">Reset</button>
          <button id="mol-toggleSpin" title="Toggle Spin">Spin</button>
        </div>
      </div>
    </div>
  `;

  // 2. Initialize the 3Dmol viewer
  const element = $('#gldiv-3dmol');
  const config = { 
    backgroundColor: 'var(--white, #FFFFFF)', // Use CSS variable for theming
    antialias: true 
  };
  const viewer = $3Dmol.createViewer(element, config);

  // 3. Load a default molecule (e.g., PDB ID '2POR')
  const pdbId = '2POR';
  $.ajax(`https://files.rcsb.org/download/${pdbId}.pdb`, {
    success: function(data) {
      viewer.addModel(data, "pdb");
      viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
      viewer.zoomTo();
      viewer.render();
      viewer.spin(true); // Start with spin enabled

      // Stop spinning after a few seconds for a nice intro effect
      setTimeout(() => viewer.spin(false), 2500);
    },
    error: function(hdr, status, err) {
      console.error(`Failed to load PDB ${pdbId}: ${err}`);
      element.html(`<p class="error-text">Failed to load molecule: ${pdbId}</p>`);
    },
  });

  // 4. Attach event handlers to the new toolbar buttons
  //    Note: We use the container to select the buttons to ensure correct scoping.
  const getBtn = (id) => container.querySelector(id);

  getBtn('#mol-zoomIn').addEventListener('click', () => viewer.zoom(1.2, 500));
  getBtn('#mol-zoomOut').addEventListener('click', () => viewer.zoom(0.8, 500));
  getBtn('#mol-rotateLeft').addEventListener('click', () => viewer.rotate(90, 'y', 500));
  getBtn('#mol-rotateRight').addEventListener('click', () => viewer.rotate(-90, 'y', 500));
  getBtn('#mol-resetView').addEventListener('click', () => viewer.zoomTo(500));
  getBtn('#mol-toggleSpin').addEventListener('click', () => viewer.spin(!viewer.isSpinning()));
}

// Make the function globally available for full-page.js
window.init3DMolViewer = init3DMolViewer;