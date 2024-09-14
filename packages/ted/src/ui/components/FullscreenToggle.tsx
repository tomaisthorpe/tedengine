import styled from 'styled-components';

const Button = styled.div`
  width: 28px;
  height: 26px;
  border: 4px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition-property: border-color;
  transition-duration: 0.2s;
  position: relative;
  margin-bottom: 3px;

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  &:hover:after {
    content: 'Toggle Fullscreen';
    position: absolute;
    top: 26px;
    right: -4px;
    background: rgba(0, 0, 0, 0.5);
    padding: 3px 6px;
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
