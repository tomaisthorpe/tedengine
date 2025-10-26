import { render } from '@testing-library/react';
import { LoadingScreen } from './LoadingScreen';

test('renders LoadingScreen component', () => {
  const { container } = render(
     
    <LoadingScreen />,
  );
  expect(container).toMatchSnapshot();
});
