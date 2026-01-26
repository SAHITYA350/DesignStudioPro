import { useState } from "react";

export function useHistory() {
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);

  const saveToHistory = (state) => {
    const newHistory = history.slice(0, historyStep + 1);
    setHistory([...newHistory, state]);
    setHistoryStep(newHistory.length);
  };

  const undo = (callback) => {
    if (historyStep > 0) {
      const prevState = history[historyStep - 1];
      callback(prevState);
      setHistoryStep(historyStep - 1);
    }
  };

  const redo = (callback) => {
    if (historyStep < history.length - 1) {
      const nextState = history[historyStep + 1];
      callback(nextState);
      setHistoryStep(historyStep + 1);
    }
  };

  return {
    history,
    historyStep,
    saveToHistory,
    undo,
    redo
  };
}