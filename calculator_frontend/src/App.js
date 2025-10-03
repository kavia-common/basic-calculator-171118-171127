import React, { useState, useMemo } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * App renders a minimalist calculator following the Ocean Professional theme.
 * Layout: centered container, display on top, grid of buttons below.
 */
function App() {
  // Calculator state: current input, previous value, selected operator, and a flag to reset input after equals
  const [current, setCurrent] = useState('0');
  const [previous, setPrevious] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(false);

  // Theme tokens derived from CSS variables (kept here for clarity and potential dynamic use)
  const theme = useMemo(
    () => ({
      primary: 'var(--ocn-primary)',
      secondary: 'var(--ocn-secondary)',
      success: 'var(--ocn-success)',
      error: 'var(--ocn-error)',
      background: 'var(--ocn-background)',
      surface: 'var(--ocn-surface)',
      text: 'var(--ocn-text)',
    }),
    []
  );

  // Helpers
  const isZero = (val) => /^0(?!\.)$/.test(val);

  // PUBLIC_INTERFACE
  function inputDigit(d) {
    /** Adds a digit to the current input, handling overwrite and leading zero rules. */
    if (overwrite) {
      setCurrent(String(d));
      setOverwrite(false);
      return;
    }
    if (isZero(current)) {
      setCurrent(String(d));
    } else {
      setCurrent((c) => c + String(d));
    }
  }

  // PUBLIC_INTERFACE
  function inputDecimal() {
    /** Adds a decimal point if not already present; handles overwrite state. */
    if (overwrite) {
      setCurrent('0.');
      setOverwrite(false);
      return;
    }
    if (!current.includes('.')) {
      setCurrent((c) => c + '.');
    }
  }

  // PUBLIC_INTERFACE
  function clearAll() {
    /** Clears the calculator to its initial state. */
    setCurrent('0');
    setPrevious(null);
    setOperator(null);
    setOverwrite(false);
  }

  function compute(aStr, bStr, op) {
    /** Executes a basic arithmetic operation with proper float handling. */
    const a = parseFloat(aStr);
    const b = parseFloat(bStr);
    if (Number.isNaN(a) || Number.isNaN(b)) return '0';
    let result = 0;
    switch (op) {
      case '+':
        result = a + b;
        break;
      case '-':
        result = a - b;
        break;
      case '×':
        result = a * b;
        break;
      case '÷':
        result = b === 0 ? 'Error' : a / b;
        break;
      default:
        result = b;
    }
    if (result === 'Error') return 'Error';
    // Normalize to avoid floating precision artifacts (e.g., 0.30000000000000004)
    const normalized = Number.isFinite(result) ? parseFloat(result.toFixed(10)) : result;
    return String(normalized);
  }

  // PUBLIC_INTERFACE
  function chooseOperator(nextOp) {
    /** Selects an operator; if one is active and current has value, compute intermediate result (chaining). */
    if (operator && previous !== null && !overwrite) {
      const result = compute(previous, current, operator);
      setPrevious(result === 'Error' ? null : result);
      setCurrent(result);
      setOverwrite(true);
      setOperator(result === 'Error' ? null : nextOp);
      return;
    }
    if (previous === null) {
      setPrevious(current);
      setOverwrite(true);
    }
    setOperator(nextOp);
  }

  // PUBLIC_INTERFACE
  function evaluate() {
    /** Computes the result if we have a previous value, an operator, and a current value. */
    if (operator === null || previous === null) return;
    const result = compute(previous, current, operator);
    setCurrent(result);
    setPrevious(result === 'Error' ? null : result);
    setOperator(null);
    setOverwrite(true);
  }

  // PUBLIC_INTERFACE
  function toggleSign() {
    /** Toggles the sign of the current number. */
    if (current === '0' || current === 'Error') return;
    if (current.startsWith('-')) {
      setCurrent(current.slice(1));
    } else {
      setCurrent('-' + current);
    }
  }

  // PUBLIC_INTERFACE
  function percent() {
    /** Converts current number to percentage (divide by 100). */
    if (current === 'Error') return;
    const num = parseFloat(current);
    if (Number.isNaN(num)) return;
    const val = String(parseFloat((num / 100).toFixed(10)));
    setCurrent(val);
  }

  const buttons = [
    { label: 'C', type: 'control', onClick: clearAll, title: 'Clear' },
    { label: '±', type: 'control', onClick: toggleSign, title: 'Toggle sign' },
    { label: '%', type: 'control', onClick: percent, title: 'Percent' },
    { label: '÷', type: 'operator', onClick: () => chooseOperator('÷'), title: 'Divide' },

    { label: '7', type: 'digit', onClick: () => inputDigit(7) },
    { label: '8', type: 'digit', onClick: () => inputDigit(8) },
    { label: '9', type: 'digit', onClick: () => inputDigit(9) },
    { label: '×', type: 'operator', onClick: () => chooseOperator('×'), title: 'Multiply' },

    { label: '4', type: 'digit', onClick: () => inputDigit(4) },
    { label: '5', type: 'digit', onClick: () => inputDigit(5) },
    { label: '6', type: 'digit', onClick: () => inputDigit(6) },
    { label: '-', type: 'operator', onClick: () => chooseOperator('-'), title: 'Subtract' },

    { label: '1', type: 'digit', onClick: () => inputDigit(1) },
    { label: '2', type: 'digit', onClick: () => inputDigit(2) },
    { label: '3', type: 'digit', onClick: () => inputDigit(3) },
    { label: '+', type: 'operator', onClick: () => chooseOperator('+'), title: 'Add' },

    { label: '0', type: 'digit', onClick: () => inputDigit(0), className: 'span-2' },
    { label: '.', type: 'digit', onClick: inputDecimal },
    { label: '=', type: 'equals', onClick: evaluate, title: 'Equals' },
  ];

  return (
    <div className="app-shell" style={{ background: theme.background, color: theme.text }}>
      <main className="calc-wrapper" role="application" aria-label="Minimalist calculator">
        <div className="calc-header">
          <h1 className="app-title" aria-label="Ocean Professional Calculator">Calculator</h1>
        </div>

        <div className="display" role="status" aria-live="polite" aria-atomic="true" title="Display">
          {current}
        </div>

        <div className="grid">
          {buttons.map((b) => (
            <button
              key={b.label}
              className={`btn ${b.type} ${b.className || ''}`}
              onClick={b.onClick}
              aria-label={b.title || b.label}
              title={b.title || b.label}
            >
              {b.label}
            </button>
          ))}
        </div>

        <footer className="calc-footer" aria-hidden="true">
          <span className="hint">Ocean Professional • Minimalist UI</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
