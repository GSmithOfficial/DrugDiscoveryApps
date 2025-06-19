// ================================================================
// DrugDiscoveryApps - UI Enhancement Script (2025)
// ----------------------------------------------------------------
// Adds modern UX features: loading states, animations, and form validation
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 UI Enhancements loaded');

  // ─── FORM ENHANCEMENT UTILITIES ─── 

  /**
   * Add loading state to an element
   */
  function showLoading(element, text = 'Calculating...') {
    if (!element) return;

    element.classList.add('loading');
    element.setAttribute('data-original-text', element.textContent);
    if (element.tagName === 'BUTTON') {
      element.textContent = text;
      element.disabled = true;
    }
  }

  /**
   * Remove loading state from an element
   */
  function hideLoading(element) {
    if (!element) return;

    element.classList.remove('loading');
    if (element.tagName === 'BUTTON') {
      const originalText = element.getAttribute('data-original-text');
      if (originalText) {
        element.textContent = originalText;
      }
      element.disabled = false;
    }
  }

  /**
   * Show success animation on result elements
   */
  function showResultSuccess(element) {
    if (!element) return;

    element.classList.add('result-success');

    // Remove the class after animation completes
    setTimeout(() => {
      element.classList.remove('result-success');
    }, 300);
  }

  /**
   * Validate numeric input and show visual feedback
   */
  function validateNumericInput(input, min = null, max = null) {
    if (!input) return true;

    const value = parseFloat(input.value);
    const isValid = !isNaN(value) && 
                   (min === null || value >= min) && 
                   (max === null || value <= max);

    // Update input appearance
    if (isValid) {
      input.classList.remove('error');
      input.classList.add('valid');
    } else {
      input.classList.add('error');
      input.classList.remove('valid');
    }

    return isValid;
  }

  /**
   * Add smooth transitions to result displays
   */
  function updateResultWithAnimation(resultElement, newValue, unit = '') {
    if (!resultElement) return;

    // Add loading state briefly
    showLoading(resultElement);

    setTimeout(() => {
      resultElement.textContent = newValue + (unit ? ' ' + unit : '');
      hideLoading(resultElement);
      showResultSuccess(resultElement);
    }, 150);
  }

  // ─── AUTO-ENHANCEMENT FOR EXISTING FORMS ─── 

  /**
   * Enhance all form inputs with modern behaviors
   */
  function enhanceFormInputs() {
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');

    inputs.forEach(input => {
      // Add modern placeholder animations
      if (!input.classList.contains('enhanced')) {
        input.classList.add('enhanced');

        // Add real-time validation
        input.addEventListener('input', function() {
          validateNumericInput(this);
        });

        // Add focus animations
        input.addEventListener('focus', function() {
          this.parentElement?.classList.add('focused');
        });

        input.addEventListener('blur', function() {
          this.parentElement?.classList.remove('focused');
        });
      }
    });
  }

  /**
   * Enhance all buttons with loading state capability
   */
  function enhanceButtons() {
    const buttons = document.querySelectorAll('button:not(.tab):not(.tool-btn)');

    buttons.forEach(button => {
      if (!button.classList.contains('enhanced')) {
        button.classList.add('enhanced');

        // Add click ripple effect
        button.addEventListener('click', function(e) {
          const ripple = document.createElement('span');
          ripple.classList.add('ripple');
          this.appendChild(ripple);

          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';

          setTimeout(() => ripple.remove(), 600);
        });
      }
    });
  }

  /**
   * Add smooth scroll behavior to navigation
   */
  function enhanceNavigation() {
    const toolButtons = document.querySelectorAll('.tool-btn');

    toolButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Smooth scroll to content area
        const content = document.getElementById('tool-content');
        if (content) {
          content.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      });
    });
  }

  // ─── MODERN CALCULATOR FEATURES ─── 

  /**
   * Add modern calculator enhancement to any calculator function
   */
  function enhanceCalculatorFunction(originalFunction, button, resultElement) {
    return function(...args) {
      // Show loading state
      if (button) showLoading(button, 'Calculating...');

      // Delay for UX (brief loading state)
      setTimeout(() => {
        try {
          // Call original function
          const result = originalFunction.apply(this, args);

          // Update result with animation
          if (resultElement && result !== undefined) {
            updateResultWithAnimation(resultElement, result);
          }

          return result;
        } catch (error) {
          console.error('Calculation error:', error);
          if (resultElement) {
            resultElement.textContent = 'Error';
            resultElement.classList.add('result-error');
          }
        } finally {
          // Hide loading state
          if (button) hideLoading(button);
        }
      }, 100);
    };
  }

  /**
   * Add keyboard shortcuts for common actions
   */
  function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      // Enter key on inputs triggers calculation
      if (e.key === 'Enter' && e.target.matches('input[type="number"]')) {
        const form = e.target.closest('form') || e.target.closest('.tool-section');
        const button = form?.querySelector('button:not(.tab):not(.tool-btn)');
        if (button && !button.disabled) {
          button.click();
        }
      }

      // Escape key clears focus
      if (e.key === 'Escape') {
        document.activeElement?.blur();
      }
    });
  }

  // ─── RESPONSIVE BEHAVIOR ENHANCEMENTS ─── 

  /**
   * Add mobile-specific enhancements
   */
  function addMobileEnhancements() {
    if (window.innerWidth <= 768) {
      // Add touch-friendly spacing
      document.body.classList.add('mobile-enhanced');

      // Prevent zoom on input focus (iOS)
      const inputs = document.querySelectorAll('input[type="number"]');
      inputs.forEach(input => {
        if (parseInt(getComputedStyle(input).fontSize) < 16) {
          input.style.fontSize = '16px';
        }
      });
    }
  }

  // ─── AUTO-INITIALIZATION ─── 

  /**
   * Initialize all enhancements
   */
  function initializeEnhancements() {
    enhanceFormInputs();
    enhanceButtons();
    enhanceNavigation();
    addKeyboardShortcuts();
    addMobileEnhancements();

    console.log('✨ UI enhancements activated');
  }

  // ─── MUTATION OBSERVER FOR DYNAMIC CONTENT ─── 

  /**
   * Re-enhance content when new tools are loaded
   */
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Re-run enhancements on new content
        setTimeout(() => {
          enhanceFormInputs();
          enhanceButtons();
        }, 100);
      }
    });
  });

  // Start observing the tool content area
  const toolContent = document.getElementById('tool-content');
  if (toolContent) {
    observer.observe(toolContent, {
      childList: true,
      subtree: true
    });
  }

  // ─── INITIALIZE ─── 
  initializeEnhancements();

  // ─── GLOBAL UTILITIES ─── 

  // Make utilities available globally for existing calculator functions
  window.UIEnhancements = {
    showLoading,
    hideLoading,
    showResultSuccess,
    validateNumericInput,
    updateResultWithAnimation,
    enhanceCalculatorFunction
  };

  // ─── THEME SWITCHER (BONUS) ─── 

  /**
   * Add theme switching capability
   */
  function initializeThemeSwitch() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('drug-discovery-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Create theme toggle button (optional)
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    themeToggle.title = 'Toggle theme';
    themeToggle.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1001;
      background: var(--white);
      border: 2px solid var(--gray-200);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      cursor: pointer;
      font-size: 18px;
      box-shadow: var(--shadow-md);
    `;

    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('drug-discovery-theme', newTheme);
      this.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
    });

    // Uncomment to add theme toggle button
    // document.body.appendChild(themeToggle);
  }

  // Initialize theme switching
  initializeThemeSwitch();
});

// ─── CSS FOR ENHANCEMENTS ─── 

// Add enhanced styles via JavaScript (will be injected into the page)
const enhancementStyles = `
  /* Enhanced input styles */
  .input-group.focused label {
    color: var(--primary-blue);
    transform: scale(0.95);
  }

  input.enhanced.valid {
    border-color: var(--success);
    background-image: url("data:image/svg+xml,%3csvg width='16' height='16' fill='%2328a745' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px 16px;
    padding-right: 40px;
  }

  input.enhanced.error {
    border-color: var(--error);
    background-image: url("data:image/svg+xml,%3csvg width='16' height='16' fill='%23dc3545' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px 16px;
    padding-right: 40px;
  }

  /* Ripple effect for buttons */
  button.enhanced {
    position: relative;
    overflow: hidden;
  }

  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    pointer-events: none;
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
  }

  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  /* Mobile enhancements */
  .mobile-enhanced input,
  .mobile-enhanced button {
    min-height: 44px;
  }

  .mobile-enhanced .tool-btn {
    padding: 16px;
  }

  /* Result error state */
  .result-error {
    background: #ffebee !important;
    border-color: var(--error) !important;
    color: var(--error) !important;
    animation: shake 0.5s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  /* Dark theme support */
  [data-theme="dark"] {
    --white: #1a1a1a;
    --gray-50: #2d2d2d;
    --gray-100: #3a3a3a;
    --gray-200: #4a4a4a;
    --gray-300: #5a5a5a;
    --gray-600: #a0a0a0;
    --gray-700: #c0c0c0;
    --gray-800: #e0e0e0;
  }

  [data-theme="dark"] body {
    background: var(--gray-900);
    color: var(--gray-100);
  }
`;

// Inject enhancement styles
const styleSheet = document.createElement('style');
styleSheet.textContent = enhancementStyles;
document.head.appendChild(styleSheet);
