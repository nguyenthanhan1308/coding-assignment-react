import { render } from '@testing-library/react';

import Tickets from './tickets';

describe('Tickets', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Tickets tickets={[]} users={[]} loading={false} />);
    expect(baseElement).toBeTruthy();
  });
});
