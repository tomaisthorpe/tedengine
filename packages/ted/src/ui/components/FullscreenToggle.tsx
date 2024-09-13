import styled from 'styled-components';

const Button = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 36px;
  height: 32px;
  border: 5px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition-property: border-color;
  transition-duration: 0.2s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:hover:after {
    content: 'Toggle Fullscreen';
    position: absolute;
    top: 40px;
    right: -5px;
    background: rgba(0, 0, 0, 0.5);
    padding: 5px 8px;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.2);
    font-size: 12px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    cursor: pointer;
  }
`;

export default function FullscreenToggle({
  toggleFullscreen,
}: {
  toggleFullscreen: () => void;
}) {
  return <Button onClick={toggleFullscreen} />;
}
