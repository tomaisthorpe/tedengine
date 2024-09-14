import { render } from '@testing-library/react';
import { TUIContext } from '../context';
import GameControls from './GameControls';

test('renders GameControls component with scaling', () => {
  const { container } = render(
    <TUIContext.Provider
      value={{ scaling: 2, renderingSize: { width: 1, height: 1 } }}
    >
      <GameControls
        fred={
          {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            toggleFullscreen: () => {},
          } as any
        }
      />
    </TUIContext.Provider>,
  );
  expect(container.firstChild).toHaveStyle({ transform: 'scale(2)' });
});
