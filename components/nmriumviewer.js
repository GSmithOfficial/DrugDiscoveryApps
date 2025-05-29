/* NMRium viewer – minimal, no dependencies */
function initNMRViewer(container) {
  container.innerHTML = `
    <div class="tool-section nmrium-container">
      <h3>NMRium Viewer</h3>
      <p style="margin-bottom:0.5rem;">
        Drag &amp; drop JCAMP‑DX (<code>.jdx</code>) or NMRium JSON files anywhere inside the viewer,
        or paste a direct URL into the address bar of the viewer itself.
      </p>
      <div class="nmrium-wrapper">
        <iframe
          id="nmriumFrame"
          src="https://www.nmrium.org/nmrium"
          width="100%"
          height="700"
          style="border:0; border-radius:6px;"
          loading="lazy"
          allow="clipboard-read; clipboard-write"
          title="NMRium – Interactive NMR Viewer">
        </iframe>
      </div>
    </div>
  `;

  // Ensure the iframe loads properly
  const iframe = container.querySelector('#nmriumFrame');
  iframe.addEventListener('load', () => {
    // Add a small delay to ensure proper rendering
    setTimeout(() => {
      iframe.style.opacity = '1';
    }, 100);
  });
}
