import styled from 'styled-components';
import type TFred from '../../fred/fred';
import FullscreenToggle from './FullscreenToggle';
import MuteToggle from './MuteToggle';
import { useUIContext } from '../hooks';

export type GameControlsProps = {
  fred: TFred;
};

const Container = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding: 8px;
`;

export default function GameControls({ fred }: GameControlsProps) {
  const { scaling } = useUIContext();
  return (
    <Container
      style={{
        transform: `scale(${scaling})`,
        transformOrigin: 'top right',
      }}
    >
      <FullscreenToggle toggleFullscreen={() => fred.toggleFullscreen()} />
      <MuteToggle />
    </Container>
  );
}
