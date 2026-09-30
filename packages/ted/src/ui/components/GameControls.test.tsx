import { render } from '@testing-library/react';
import { TUIContext } from '../context';
import { GameControls } from './GameControls';

test('renders GameControls component with scaling', () => {
  const { container } = render(
    <TUIContext
      value={{
        scaling: 2,
        renderingSize: { width: 1, height: 1 },
        showFullscreenToggle: false,
        showAudioToggle: false,
      }}
    >
      <GameControls
        fred={
          {
            toggleFullscreen: () => {},
          } as any
        }
      />
    </TUIContext>,
  );
  expect(container.firstChild).toHaveStyle({ transform: 'scale(2)' });
});
