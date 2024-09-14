/* eslint-disable @typescript-eslint/no-empty-function */
import { render } from '@testing-library/react';
import FullscreenToggle from './FullscreenToggle';
import { TUIContext } from '../context';

test('renders FullscreenToggle component', () => {
  const { container } = render(
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    <TUIContext.Provider
      value={{
        scaling: 1,
        renderingSize: { width: 1, height: 1 },
        showFullscreenToggle: true,
        showAudioToggle: false,
      }}
    >
      <FullscreenToggle toggleFullscreen={() => {}} />,
    </TUIContext.Provider>,
  );
  expect(container).toMatchSnapshot();
});
