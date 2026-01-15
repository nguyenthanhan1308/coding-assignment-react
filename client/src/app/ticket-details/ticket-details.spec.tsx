import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";

import TicketDetails from './ticket-details';

describe('TicketDetails', () => {
  
  it('should render successfully', () => {
    const { baseElement } = render(<TicketDetails users={[]}/>);
    expect(baseElement).toBeTruthy();
  });
  
});

test('snack bar show on create ticket', async () => {
  render(<TicketDetails users={[]}/>);

  const addBtn = screen.getByRole('button', { name: /Create Ticket/i });

  expect(addBtn).toBeDisabled();

  userEvent.click(screen.getByLabelText(/Description/i))

  userEvent.type(screen.getByPlaceholderText(/Enter description/i), 'abc')

  expect(addBtn).toBeEnabled();

  userEvent.click(screen.getByLabelText(/Create Ticket/i))

  const alert = await screen.findByRole('presentation')
  expect(alert).toHaveTextContent(/Ticket added!/i)
})

test('ticket completed', async () => {
  render(
		<TicketDetails
			users={[
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
			]}
		/>
  );

  userEvent.click(screen.getByLabelText(/Description/i))

  userEvent.type(screen.getByPlaceholderText(/Enter description/i), 'abc')

  userEvent.click(screen.getByLabelText(/Create Ticket/i))

  const alert = await screen.findByRole('presentation')
  expect(alert).toHaveTextContent(/Ticket added!/i)
})