import { FC } from "react";
import { FiMinus, FiSquare, FiX } from "react-icons/fi";
import styled from "styled-components";
import { sendRenderer } from "../utils/sendRendererUtils";

const HeaderContainer = styled.header`
  background-color: var(--header-bg-color);
  color: var(--header-title);
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  -webkit-app-region: drag;
  user-select: none;
  border-top-left-radius: 0.3em;
  border-top-right-radius: 0.3em;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WindowControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  -webkit-app-region: no-drag;
  
  svg {
    cursor: pointer;
    color: var(--header-icons);
    width: 16px;
    height: 16px;
    transition: color 0.2s;
  }

  svg:hover {
    color: var(--header-title);
  }
`;

const Header: FC<{ title: string, hideClose?: boolean, hideMaximize?: boolean, hideMinimize?: boolean }> = ({ title, hideClose, hideMaximize, hideMinimize }) => {
  return (
    <HeaderContainer>
      <Title>⚙ {title}</Title>
      <WindowControls>
        {!hideMinimize && <FiMinus onClick={() => sendRenderer["minimize-window"]()} />}
        {!hideMaximize && <FiSquare onClick={() => sendRenderer["maximize-window"]()} />}
        {!hideClose && <FiX onClick={() => sendRenderer["close-window"]()} />}
      </WindowControls>
    </HeaderContainer>
  )
}

export default Header;