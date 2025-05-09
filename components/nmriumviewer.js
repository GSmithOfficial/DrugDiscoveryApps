/* NMRium viewer – minimal, no dependencies */
function initNMRViewer(container) {
  container.innerHTML = `
    <h3>NMRium Viewer</h3>
    <p style="margin-bottom:0.5rem;">
      Drag &amp; drop JCAMP‑DX (<code>.jdx</code>) or NMRium JSON files anywhere inside the viewer,
      or paste a direct URL into the address bar of the viewer itself.
    </p>
    <iframe
      id="nmriumFrame"
      src="https://www.nmrium.org/nmrium"
      width="100%"
      height="700"
      style="border:0; border-radius:6px;"
      loading="lazy"
      title="NMRium – Interactive NMR Viewer">
    </iframe>
  `;
}
