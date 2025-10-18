import { render } from '@testing-library/react';
import { ErrorScreen } from './ErrorScreen';

test('renders ErrorScreen component', () => {
  const error = 'Something went wrong';
  const { container } = render(<ErrorScreen error={error} />);
  expect(container).toMatchSnapshot();
});
