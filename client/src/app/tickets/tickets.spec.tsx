import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import { Ticket, User } from '@acme/shared-models';
import Tickets from './tickets';

describe('Tickets', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Tickets users={[]} loading={false} />);
    expect(baseElement).toBeTruthy();
  });
});

test('list filter by status', async () => {
  const users = [
		{
			id: 1,
			name: "Alice",
		},
		{
			id: 2,
			name: "Bob",
		},
		{
			id: 3,
			name: "Chris",
		},
		{
			id: 4,
			name: "Daisy",
		},
		{
			id: 5,
			name: "Ed",
		},
  ] as User[];
  render(<Tickets users={users} loading={false}/>)

  userEvent.click(screen.getByText(/Complete/i))

  const showing = await screen.findByText(/Showing/i)

  expect(showing).toHaveTextContent(/Showing 0 to 0 of 0 tickets/i)
})
