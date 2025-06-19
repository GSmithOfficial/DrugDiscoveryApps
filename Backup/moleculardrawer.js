/* Molecular Drawer component
   -- Ketcher + ChemDoodle switcher
   -- exposes global initMolecularDrawer(container)             */

   function initMolecularDrawer(container) {
    container.innerHTML = `
      <div class="drawer-selection">
        <button id="load-ketcher">Load Ketcher</button>
        <button id="load-chemdoodle">Load ChemDoodle</button>
      </div>
      <div id="drawer-container"></div>
      <button id="get-smiles" style="display:none;">Get SMILES</button>
      <div id="smiles-output" style="margin:10px 0;"></div>
    `;
  
    const ketcherBtn = container.querySelector('#load-ketcher');
    const chemBtn    = container.querySelector('#load-chemdoodle');
    const drawerDiv  = container.querySelector('#drawer-container');
    const smilesBtn  = container.querySelector('#get-smiles');
    const smilesOut  = container.querySelector('#smiles-output');
  
    ketcherBtn.addEventListener('click', () => {
      loadKetcher(drawerDiv);
      smilesBtn.style.display = 'block';
    });
  
    chemBtn.addEventListener('click', () => {
      loadChemDoodle(drawerDiv);
      smilesBtn.style.display = 'none';
    });
  
    smilesBtn.addEventListener('click', async () => {
      const frame = document.getElementById('ifKetcher');
      try {
        const smi = await frame.contentWindow.ketcher.getSmiles();
        smilesOut.innerHTML = `<strong>SMILES:</strong> ${smi}`;
      } catch (err) {
        console.error(err);
        smilesOut.textContent = 'Error retrieving SMILES';
      }
    });
  }
  
  function loadKetcher(host) {
    host.innerHTML = `
      <h3>Ketcher Editor</h3>
      <iframe id="ifKetcher" src="Ketcher/index.html" width="100%" height="500"></iframe>
    `;
  }
  
  function loadChemDoodle(host) {
    host.innerHTML = `
      <h3>ChemDoodle Editor</h3>
      <canvas id="chemdoodle-sketcher" width="900" height="600"></canvas>
    `;
    const sketcher = new ChemDoodle.SketcherCanvas('chemdoodle-sketcher', 900, 600, {
      useServices: false,
      oneMolecule: false,
      includeToolbar: true,
      includeAtomSketcher: true,
      includeCopyPaste: true
    });
    sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true;
    sketcher.styles.atoms_useJMOLColors = true;
    sketcher.styles.bonds_clearOverlaps_2D = true;
    sketcher.repaint();
  }
  
  /* expose globally */
  window.initMolecularDrawer = initMolecularDrawer;
  