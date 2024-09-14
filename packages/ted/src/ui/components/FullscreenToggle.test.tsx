import { render } from '@testing-library/react';
import FullscreenToggle from './FullscreenToggle';
import { TUIContext } from '../context';

test('renders FullscreenToggle component', () => {
  const { container } = render(
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    <TUIContext.Provider
      value={{ scaling: 1, renderingSize: { width: 1, height: 1 } }}
    >
      <FullscreenToggle toggleFullscreen={() => {}} />,
    </TUIContext.Provider>,
  );
  expect(container).toMatchSnapshot();
});

test('renders FullscreenToggle component with scaling', () => {
  const { container } = render(
    <TUIContext.Provider
      value={{ scaling: 2, renderingSize: { width: 1, height: 1 } }}
    >
      <FullscreenToggle toggleFullscreen={() => {}} />,
    </TUIContext.Provider>,
  );
  expect(container.firstChild).toHaveStyle('transform: scale(2)');
});
