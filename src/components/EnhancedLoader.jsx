// components/EnhancedLoader.jsx
import React, { useState, useEffect } from "react";
import styled from "styled-components";

const EnhancedLoader = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onFinish(), 300);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <StyledWrapper>
      <div className="terminal-loader">
        <div className="terminal-header">
          <div className="terminal-title">Design Studio Pro</div>
          <div className="terminal-controls">
            <span className="control close" />
            <span className="control minimize" />
            <span className="control maximize" />
          </div>
        </div>

        <div className="text">Initializing...</div>

        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="progress-text">{progress}%</div>

        <div className="loading-details">
          <div className="loading-item loaded">✓ Loading UI Components</div>
          <div className="loading-item loaded">✓ Initializing Canvas</div>
          <div className={`loading-item ${progress > 50 ? "loaded" : "loading"}`}>
            {progress > 50 ? "✓" : "↻"} Loading Tools & Brushes
          </div>
          <div className={`loading-item ${progress > 80 ? "loaded" : "loading"}`}>
            {progress > 80 ? "✓" : "↻"} Preparing Assets
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  min-height: 10vh;
  border-radius: 8px;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: #0f0f0f;

  @keyframes blinkCursor {
    50% {
      border-right-color: transparent;
    }
  }

  @keyframes typeAndDelete {
    0%,
    10% {
      width: 0;
    }
    45%,
    55% {
      width: 18ch;
    }
    90%,
    100% {
      width: 0;
    }
  }

  .terminal-loader {
    width: 100%;
    max-width: 420px;
    background: #1a1a1a;
    color: #0f0;
    font-family: "Courier New", monospace;
    font-size: clamp(0.85rem, 2.5vw, 1rem);
    padding: 2.8rem 1.25rem 1.5rem;
    border-radius: 8px;
    border: 1px solid #333;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    position: relative;
    box-sizing: border-box;
  }

  .terminal-header {
    position: absolute;
    inset: 0 0 auto 0;
    height: 2rem;
    background: #2c2c2c;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.75rem;
    border-radius: 8px 8px 0 0;
  }

  .terminal-title {
    font-size: 0.85em;
    font-weight: bold;
    color: #e5e5e5;
  }

  .terminal-controls {
    display: flex;
    gap: 0.4rem;
  }

  .control {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 50%;
    background: #777;
  }

  .close {
    background: #e33;
  }

  .minimize {
    background: #ee0;
  }

  .maximize {
    background: #0b0;
  }

  .text {
    margin-top: 0.5rem;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    border-right: 0.15em solid #0f0;
    animation:
      typeAndDelete 4s steps(18) infinite,
      blinkCursor 0.5s step-end infinite alternate;
  }

  .progress-container {
    margin: 1.25rem 0 0.75rem;
    height: 0.75rem;
    background: #333;
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: #0f0;
    transition: width 0.05s linear;
  }

  .progress-text {
    text-align: center;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .loading-details {
    font-size: 0.85em;
    color: #aaa;
  }

  .loading-item {
    margin: 0.35rem 0;
    padding-left: 1.4em;
    position: relative;
  }

  .loading-item::before {
    content: "↻";
    position: absolute;
    left: 0;
    animation: spin 1s linear infinite;
  }

  .loading-item.loaded::before {
    content: "✓";
    animation: none;
    color: #0f0;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default EnhancedLoader;