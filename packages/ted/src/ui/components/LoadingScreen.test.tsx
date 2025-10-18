import { render } from '@testing-library/react';
import { LoadingScreen } from './LoadingScreen';

test('renders LoadingScreen component', () => {
  const { container } = render(
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    <LoadingScreen />,
  );
  expect(container).toMatchSnapshot();
});
