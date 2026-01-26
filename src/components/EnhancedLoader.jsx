import React from "react";
import styled from "styled-components";

const EnhancedLoader = () => {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="folder">
          <div className="top" />
          <div className="bottom" />
        </div>
        <div className="title">Getting files ready...</div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .folder {
    animation: float 3s ease-in-out infinite;
  }

  .folder .top {
    background-color: #ff8f56;
    width: clamp(48px, 12vw, 60px);
    height: clamp(10px, 2.5vw, 12px);
    border-top-right-radius: 10px;
  }

  .folder .bottom {
    background-color: #ffce63;
    width: clamp(80px, 20vw, 100px);
    height: clamp(56px, 14vw, 70px);
    box-shadow: 5px 5px 0 0 #283149;
    border-top-right-radius: 8px;
  }

  .title {
    font-size: clamp(0.8rem, 3.5vw, 0.95rem);
    color: #ffffff;
    text-align: center;
  }

  @keyframes float {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-18px);
    }
    100% {
      transform: translateY(0);
    }
  }
`;

export default EnhancedLoader;