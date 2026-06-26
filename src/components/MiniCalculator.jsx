import React, { useState } from 'react';
import { Calculator as CalcIcon, X } from 'lucide-react';

export default function MiniCalculator() {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputDigit = (digit) => {
    if (waitingForNewValue) {
      setDisplay(String(digit));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  };

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? NaN : a / b;
      default: return b;
    }
  };

  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const result = calculate(prevValue, inputValue, operator);
      setDisplay(String(Number.isNaN(result) ? 'Error' : Math.round(result * 1e10) / 1e10));
      setPrevValue(Number.isNaN(result) ? null : result);
    }

    setWaitingForNewValue(true);
    setOperator(nextOperator);
  };

  const handleEquals = () => {
    if (operator === null || prevValue === null) return;
    const inputValue = parseFloat(display);
    const result = calculate(prevValue, inputValue, operator);
    setDisplay(String(Number.isNaN(result) ? 'Error' : Math.round(result * 1e10) / 1e10));
    setPrevValue(null);
    setOperator(null);
    setWaitingForNewValue(true);
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const buttons = [
    { label: 'C', onClick: clearAll, className: 'bg-slate-200 text-slate-700 hover:bg-slate-300' },
    { label: '±', onClick: toggleSign, className: 'bg-slate-200 text-slate-700 hover:bg-slate-300' },
    { label: '%', onClick: () => setDisplay(String(parseFloat(display) / 100)), className: 'bg-slate-200 text-slate-700 hover:bg-slate-300' },
    { label: '÷', onClick: () => performOperation('÷'), className: 'bg-indigo-500 text-white hover:bg-indigo-600' },
    { label: '7', onClick: () => inputDigit(7), className: 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200' },
    { label: '8', onClick: () => inputDigit(8), className: 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200' },
    { label: '9', onClick: () => inputDigit(9), className: 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200' },
    { label: '×', onClick: () => performOperation('×'), className: 'bg-indigo-500 text-white hover:bg-indigo-600' },
    { label: '4', onClick: () => inputDigit(4), className: 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200' },
    { label: '5', onClick: () => inputDigit(5), className: 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200' },
    { label: '6', onClick: () => inputDigit(6), className: 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200' },
    { label: '-', onClick: () => performOperation('-'), className: 'bg-indigo-500 text-white hover:bg-indigo-600' },
    { label: '1', onClick: () => inputDigit(1), className: 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200' },
    { label: '2', onClick: () => inputDigit(2), className: 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200' },
    { label: '3', onClick: () => inputDigit(3), className: 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200' },
    { label: '+', onClick: () => performOperation('+'), className: 'bg-indigo-500 text-white hover:bg-indigo-600' },
    { label: '0', onClick: () => inputDigit(0), className: 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 col-span-2' },
    { label: '.', onClick: inputDecimal, className: 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200' },
    { label: '=', onClick: handleEquals, className: 'bg-[#1d5ec2] text-white hover:bg-[#154fa5]' },
  ];

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl flex items-center justify-center hover:scale-105 transition"
        aria-label="Open calculator"
      >
        {open ? <X size={22} /> : <CalcIcon size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-64 bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 p-4">
          <div className="bg-slate-900 text-white rounded-xl px-4 py-4 mb-3 text-right">
            <p className="text-2xl font-black truncate">{display}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                className={`py-3 rounded-xl text-sm font-black transition ${btn.className}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
