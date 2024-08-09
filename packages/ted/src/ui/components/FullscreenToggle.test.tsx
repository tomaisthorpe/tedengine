import { render } from '@testing-library/react';
import FullscreenToggle from './FullscreenToggle';

test('renders FullscreenToggle component', () => {
  const { container } = render(
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    <FullscreenToggle toggleFullscreen={() => {}} />,
  );
  expect(container).toMatchSnapshot();
});
