import styled from 'styled-components';
import { useUIContext } from '../hooks';

const Container = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;

const Button = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 26px;
  border: 4px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition-property: border-color;
  transition-duration: 0.2s;

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
  const { scaling } = useUIContext();

  return (
    <Container
      style={{
        transform: `scale(${scaling})`,
        transformOrigin: 'top right',
      }}
    >
      <Button onClick={toggleFullscreen} />
    </Container>
  );
}
