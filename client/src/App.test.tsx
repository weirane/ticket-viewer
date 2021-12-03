import { render, waitFor } from '@testing-library/react';
import App, { ITicket } from './App';
import Ticket from './Ticket';

beforeEach(() => {
  (fetch as any).resetMocks();
});

test('renders ticket', () => {
  const ticket: ITicket = {
    requester_id: 1,
    id: 1,
    subject: 'subject',
    description: 'description',
    url: '',
    status: 'new',
  };
  const r = render(<Ticket ticket={ticket} userName="John Doe" handleClick={(_e) => {}} />);
  expect(r.getByText('subject').tagName).toBe('H3');
  const status = r.getByText('New');
  expect(status).toBeInTheDocument();
  expect(status).toHaveClass('red');
  expect(r.getByText('description')).toBeInTheDocument();
});

test('app', () => {
  const tickets: ITicket[] = Array.from({ length: 27 }, (_, i) => ({
    requester_id: 1,
    id: i,
    subject: `subject ${i}`,
    description: `description ${i}`,
    url: '',
    status: 'new',
  }));
  (fetch as any).mockResponseOnce(
    JSON.stringify({
      tickets,
      next_page: 'https://example.com/tickets/?page=2',
      count: 27,
    })
  );
  (fetch as any).mockResponseOnce(JSON.stringify({ name: 'John Doe' }));
  const r = render(<App />);
  expect(r.getByText('Page 1')).toBeInTheDocument();
  waitFor(() => {
    expect(r.getByText('27 tickets in total')).toBeInTheDocument();
    expect(r.getByText('subject 1')).toBeInTheDocument();
    r.getByText('Next').click();
    expect(r.getByText('Page 2')).toBeInTheDocument();
    expect(r.getByText('subject 26')).toBeInTheDocument();
  });
});
