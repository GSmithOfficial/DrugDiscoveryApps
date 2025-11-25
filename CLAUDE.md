# CLAUDE.md - AI Assistant Guide for DrugDiscoveryApps

## Project Overview

**Drug Discovery Apps** is a web-based suite of chemistry and pharmaceutical research tools deployed at [drugdiscovery.app](https://drugdiscovery.app). This is a pure static web application with no backend, providing interactive calculators, molecular structure editors, and spectroscopy viewers for pharmaceutical researchers.

**Key Characteristics:**
- **Pure Static Site**: No build process, no frameworks, vanilla JavaScript
- **Integrated Chemistry Libraries**: Ketcher, ChemDoodle, OpenChemLib, NMRium
- **Modular Component Architecture**: Each tool is a self-contained module
- **Responsive Design**: Mobile-first with fluid layouts
- **License**: Apache 2.0

## Technology Stack

### Core Technologies
- **Vanilla JavaScript** (ES6+) - No frameworks or bundlers
- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, responsive design
- **Static Deployment** - GitHub Pages compatible

### Integrated Libraries
1. **Ketcher v2.24.0** - React-based molecular structure editor (precompiled)
   - Location: `/Ketcher/`
   - Includes WASM modules for chemistry calculations
   - Bundle size: ~20 MB

2. **ChemDoodle Web** - Canvas-based molecular structure editor
   - Location: `/chemdoodle/`
   - Includes jQuery UI 1.11.4 for UI components

3. **OpenChemLib Core** - Chemical informatics library
   - Location: `/js/openchemlib-core.js`
   - ~889 KB minified

4. **NMRium** - NMR spectroscopy viewer (external iframe)
   - Loaded from: https://www.nmrium.org/nmrium

## Repository Structure

```
DrugDiscoveryApps/
├── index.html              # Main entry point - loads all dependencies
├── background.js           # CORS header modification for ChemDoodle API
├── CNAME                   # Custom domain configuration
│
├── css/
│   └── styles.css          # Main stylesheet with CSS variables and responsive design
│
├── js/
│   ├── full-page.js        # App bootstrap, navigation, tool registry
│   ├── utils.js            # Shared utility functions
│   └── openchemlib-core.js # External chemistry library
│
├── components/             # Tool modules (each exports init function)
│   ├── ic50converter.js
│   ├── concentrationconverter.js
│   ├── dosecalculator.js
│   ├── efficiencymetrics.js
│   ├── moleculardrawer.js
│   └── nmriumviewer.js
│
├── Ketcher/                # Precompiled Ketcher editor distribution
├── chemdoodle/             # ChemDoodle library and UI components
└── Buttons/                # UI assets
```

## Architecture Patterns

### Application Bootstrap Flow

1. **index.html** loads dependencies in order:
   - CSS framework
   - ChemDoodle and jQuery UI
   - Utility and component scripts
   - Main app controller (full-page.js)

2. **full-page.js** initializes:
   - Mega-menu navigation system
   - Tool registry organized by category
   - Tab switching and dynamic tool loading
   - Scroll event handlers for sticky navigation

3. **Component modules** expose:
   - Single `window.initToolName(container)` function
   - Self-contained UI building and event handling
   - Live calculations and result updates

### Component Pattern

Every tool follows this consistent pattern:

```javascript
(function() {
  function initToolName(container) {
    // 1. Build UI via innerHTML
    container.innerHTML = `<!-- Full HTML structure -->`;

    // 2. Cache DOM references
    const input1 = container.querySelector('#input1');
    const result = container.querySelector('#result');

    // 3. Define calculation functions
    function calculate() {
      // Calculation logic
      updateResults();
    }

    // 4. Attach event listeners
    input1.addEventListener('input', calculate);

    // 5. Initialize
    calculate();
  }

  // 6. Expose globally
  window.initToolName = initToolName;
})();
```

### Tool Registry Structure

Tools are organized in `js/full-page.js`:

```javascript
const tools = {
  medchem: {
    label: 'Medical Chemistry',
    tools: [
      { id: 'ic50-converter', label: 'IC50 Converter', init: 'initIC50Converter' },
      // ...
    ]
  },
  pk: { /* ... */ },
  molecular_drawer: { /* ... */ },
  spectroscopy: { /* ... */ }
};
```

## Design System

### CSS Custom Properties

Core design tokens defined in `:root`:

```css
--primary-color: #4A90E2     /* Blue */
--secondary-color: #50E3C2   /* Teal */
--accent-red: #E74C3C        /* Red - errors */
--background-color: #F7F9FC  /* Light gray */

/* Fluid spacing scale using clamp() */
--space-1: clamp(4px, 0.25vw, 6px)
--space-6: clamp(24px, 1.5vw, 36px)
```

### Layout Patterns

1. **Split Pane Layout** (most tools):
   - Left: Input form section
   - Right: Sticky results sidebar
   - Collapses to single column at 992px

2. **Mega Menu Navigation**:
   - Sticky top header (56px)
   - Category tabs with tool sheet
   - Compact mode on scroll

3. **Inline Unit Pills**:
   - Unit selection buttons integrated with inputs
   - Collapsible dropdown behavior
   - Active state styling

4. **Metric Cards**:
   - Result display with label and large value
   - Used in calculators and converters

### Responsive Breakpoints

- **992px**: Split pane → single column
- **768px**: Adjusted spacing and navigation
- **480px**: Mobile layout optimizations

## Development Conventions

### Code Style

1. **Naming Conventions**:
   - camelCase for variables and functions
   - Descriptive names (e.g., `convertIC50ToPIC50`)
   - BEM-lite for CSS classes (e.g., `.result-card__value`)

2. **DOM Querying**:
   - Use `container.querySelector()` for scoped queries
   - Cache frequently accessed elements
   - Local `$` helper function in some components

3. **Event Handling**:
   - Event listeners attached after innerHTML
   - Use `addEventListener` (not inline handlers)
   - Event delegation for dynamic content

4. **Calculations**:
   - Validate inputs before computation
   - Handle edge cases (NaN, Infinity, negative values)
   - Display "–" for invalid/missing results
   - Include comments explaining formulas

### File Organization

- **One tool per file** in `/components/`
- **Descriptive filenames** matching tool purpose
- **Self-contained modules** with minimal dependencies
- **Global exports** via `window.initToolName`

## Common Development Tasks

### Adding a New Tool

1. **Create component file** in `/components/newtool.js`:

```javascript
(function() {
  function initNewTool(container) {
    container.innerHTML = `
      <div class="split-pane">
        <div class="input-section">
          <h2>Tool Name</h2>
          <!-- Input form -->
        </div>
        <div class="results-section sticky">
          <!-- Result cards -->
        </div>
      </div>
    `;

    // Implementation
  }

  window.initNewTool = initNewTool;
})();
```

2. **Register in `js/full-page.js`** tool registry:

```javascript
const tools = {
  medchem: {
    tools: [
      // ...
      { id: 'new-tool', label: 'New Tool', init: 'initNewTool' }
    ]
  }
};
```

3. **Load script in `index.html`**:

```html
<script src="components/newtool.js"></script>
```

### Modifying Calculations

1. **Locate formula** in component file (usually in calculate function)
2. **Add inline comments** explaining chemistry/math
3. **Test edge cases**: zero, negative, very large/small numbers
4. **Validate against references** (published papers, known values)

Example from efficiencymetrics.js:70-75:
```javascript
// LE = -1.4 × pIC50 / Heavy Atom Count
// Reference formula from Hopkins et al.
const le = (-1.4 * pic50 / heavyAtomCount).toFixed(2);
```

### Styling Updates

1. **Use CSS variables** for colors, spacing, breakpoints
2. **Test responsive breakpoints** (992px, 768px, 480px)
3. **Maintain split-pane pattern** for consistency
4. **Check sticky positioning** (results sidebar, navigation)

Example:
```css
.custom-element {
  padding: var(--space-3);
  color: var(--primary-color);

  @media (max-width: 992px) {
    padding: var(--space-2);
  }
}
```

### Testing a Tool

Manual testing checklist:
- [ ] Tool loads without console errors
- [ ] All inputs accept valid values
- [ ] Calculations produce correct results
- [ ] Results update on input change
- [ ] Invalid inputs show "–" or error message
- [ ] Unit conversions are accurate
- [ ] Responsive layout works at all breakpoints
- [ ] Works in Chrome, Firefox, Safari

## Git Workflow

### Branch Naming

- **Feature branches**: Created automatically by Claude Code
- **Format**: `claude/claude-md-<session-id>`
- **Main branch**: `main` (sometimes empty, check merge target)

### Commit Messages

Follow existing patterns:
- Descriptive action messages (e.g., "Add dose calculator", "Fix drawer")
- Use imperative mood ("Add" not "Added")
- Include date stamps for minor edits when helpful

### Pushing Changes

**IMPORTANT**: Always push to the Claude-generated feature branch:

```bash
git add .
git commit -m "Descriptive message"
git push -u origin claude/claude-md-<session-id>
```

**Retry logic**: If push fails due to network errors, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s).

**Never**:
- Push directly to main without permission
- Force push unless explicitly requested
- Skip commit hooks with `--no-verify`

## Key Files Reference

### js/full-page.js (102 lines)
- **Purpose**: App bootstrap and navigation controller
- **Key functions**: Tool registry, mega-menu init, tab switching
- **Modify when**: Adding new tools or categories

### js/utils.js (11 lines)
- **Purpose**: Shared utility functions
- **Key functions**: `createResultTable()`
- **Modify when**: Adding reusable helpers

### css/styles.css (901 lines)
- **Purpose**: Complete design system
- **Sections**: Variables, mega-menu, split-pane, forms, accordion, responsive
- **Modify when**: Styling changes, theme updates, layout adjustments

### Component Files (~100 lines each)
- **ic50converter.js**: IC50 ↔ pIC50 conversion with unit pills
- **concentrationconverter.js**: Mass ↔ molar concentration conversion
- **dosecalculator.js**: In-vivo dose calculations with animal presets
- **efficiencymetrics.js**: Ligand efficiency metrics (LE, LLE, GE)
- **moleculardrawer.js**: Ketcher/ChemDoodle toggle switcher
- **nmriumviewer.js**: NMR spectroscopy viewer integration

## External Dependencies & Integrations

### Ketcher Editor (/Ketcher/)
- **Usage**: Molecular structure drawing
- **Integration**: Loaded in iframe at `/Ketcher/iframe.html`
- **API**: SMILES export via message passing
- **Size**: ~20 MB (React bundle + WASM)
- **Don't modify**: Precompiled distribution, update as whole package

### ChemDoodle Web (/chemdoodle/)
- **Usage**: Alternative molecular structure editor
- **Integration**: Canvas-based, direct DOM manipulation
- **CORS**: Requires header modification (background.js)
- **API**: https://ichemlabs.cloud.chemdoodle.com/
- **Don't modify**: Third-party library

### NMRium (External)
- **Usage**: NMR spectroscopy visualization
- **Integration**: External iframe from https://www.nmrium.org/nmrium
- **File support**: JCAMP-DX (.jdx), JSON
- **Note**: Dependency on external service availability

## Common Pitfalls & Solutions

### 1. CORS Issues with ChemDoodle
**Problem**: ChemDoodle API calls fail with CORS errors
**Solution**: Ensure `background.js` is loaded (Chrome extension mode) or use server-side proxy

### 2. Ketcher Not Loading
**Problem**: Ketcher iframe shows blank or errors
**Solution**: Check console for errors, verify `/Ketcher/iframe.html` path, ensure WASM files accessible

### 3. Calculations Return NaN
**Problem**: Results show NaN instead of values
**Solution**:
- Validate inputs with `parseFloat()` and check `isNaN()`
- Handle empty inputs gracefully
- Display "–" for invalid results

Example pattern:
```javascript
const value = parseFloat(input.value);
if (isNaN(value) || value <= 0) {
  resultElement.textContent = '–';
  return;
}
```

### 4. Responsive Layout Breaks
**Problem**: Split-pane doesn't collapse on mobile
**Solution**: Test at exact breakpoint (992px), check media query syntax

### 5. Tool Doesn't Load
**Problem**: Tool menu item exists but clicking does nothing
**Solution**:
- Verify script loaded in `index.html`
- Check tool ID matches in registry and HTML
- Ensure `window.initToolName` is exposed
- Check browser console for errors

## Chemistry-Specific Considerations

### Formula Parsing
Heavy atom counting uses regex (from efficiencymetrics.js:49):
```javascript
/([A-Z][a-z]*)(\d*)/g
```
- Matches chemical formulas like "C6H12O6"
- Excludes hydrogen in heavy atom count
- Not foolproof for complex structures

### Unit Conversions
Standard units used:
- **IC50**: nM, µM, mM
- **Concentration**: nM, µM, mM, ng/mL, mg/mL
- **Dose**: mg/kg
- **Molecular Weight**: g/mol

### Calculation References
Document formulas with literature references:
```javascript
// Ligand Efficiency (LE) = -1.4 × pIC50 / Heavy Atom Count
// Reference: Hopkins et al., Drug Discovery Today (2004)
```

## Security & Privacy

### Current Security Posture
- **No backend**: Pure client-side, no data persistence
- **No authentication**: Public access to all tools
- **No user data collection**: All calculations local
- **External dependencies**: NMRium (iframe), ChemDoodle API

### Safe Practices
- **Input validation**: Always validate numerical inputs
- **No eval()**: Never use `eval()` for formula parsing
- **Sanitize HTML**: Use `textContent` when displaying user input
- **iframe sandboxing**: External iframes should be sandboxed

## Performance Considerations

### Load Time Optimization
- Ketcher bundle is large (~20 MB) - only loads when needed
- Consider lazy loading for heavy libraries
- Keep component files under 150 lines for readability

### Runtime Performance
- Calculations trigger on `input` event (live updates)
- Debounce if calculations become expensive
- Cache DOM queries outside event handlers

## Deployment

### Static Site Deployment
1. **No build step required** - all files ready for deployment
2. **Deploy entire directory** to static host
3. **CNAME file** configures custom domain (drugdiscovery.app)
4. **GitHub Pages compatible** - push to gh-pages branch or configure in settings

### Pre-Deployment Checklist
- [ ] Test all tools load and initialize
- [ ] Verify calculations with known values
- [ ] Test on mobile devices and tablets
- [ ] Check cross-browser compatibility (Chrome, Firefox, Safari)
- [ ] Validate responsive layouts at breakpoints
- [ ] Ensure external iframes load (Ketcher, NMRium)
- [ ] Check console for errors

## Troubleshooting

### Debug Mode
Add to browser console:
```javascript
// List all registered tools
console.log(Object.keys(window).filter(k => k.startsWith('init')));

// Manually initialize a tool
const container = document.querySelector('#tool-content');
window.initIC50Converter(container);
```

### Common Console Errors
| Error | Likely Cause | Solution |
|-------|--------------|----------|
| `initToolName is not a function` | Script not loaded or not exposed | Check script tag in index.html |
| `Cannot read property 'querySelector'` | Container not passed correctly | Verify tool initialization call |
| `Failed to fetch` | CORS or network issue | Check external API status |
| `WebAssembly instantiation failed` | Ketcher WASM not loading | Verify WASM file paths |

## Useful Commands

```bash
# Start a local development server
python3 -m http.server 8000
# or
npx serve

# View git history
git log --oneline -20

# Check file sizes
du -sh Ketcher/ chemdoodle/ components/

# Search for a function
grep -r "function initIC50" .

# Find all TODO comments
grep -r "TODO\|FIXME" components/
```

## Future Enhancement Ideas

Based on codebase analysis, potential additions:
- Unit testing framework (Jest or similar)
- E2E testing with Playwright
- Build process for minification
- Service worker for offline functionality
- Dark mode theme toggle
- Export results to CSV/PDF
- More calculation tools (permeability, solubility, etc.)
- Integration with chemical databases
- Collaborative features (share calculations)

## Questions & Support

- **Repository**: GSmithOfficial/DrugDiscoveryApps
- **Issues**: Check GitHub issues for known problems
- **License**: Apache 2.0 - commercial use permitted
- **Documentation**: This file (CLAUDE.md) is the primary documentation

## Quick Reference for AI Assistants

When working on this codebase:
1. ✅ **Always read files before modifying** - use Read tool first
2. ✅ **Follow the component pattern** - maintain consistency
3. ✅ **Use CSS variables** - don't hardcode colors/spacing
4. ✅ **Test calculations** - verify against known values
5. ✅ **Document formulas** - include literature references
6. ✅ **Check responsive design** - test all breakpoints
7. ✅ **Push to feature branch** - never directly to main
8. ❌ **Don't add build tools** - keep it simple and static
9. ❌ **Don't modify vendor libraries** - Ketcher, ChemDoodle, etc.
10. ❌ **Don't over-engineer** - add only what's requested

---

**Last Updated**: 2025-11-25
**Repository State**: Clean working directory on feature branch
**Recent Focus**: Mega menu UI, efficiency metrics accordion, split-pane layouts
