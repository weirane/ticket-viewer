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

type Status = 'new' | 'open' | 'pending' | 'hold' | 'solved' | 'closed';
const tickets: ITicket[] = Array.from({ length: 27 }, (_, i) => ({
  requester_id: 1,
  id: i,
  subject: `subject ${i}`,
  description: `description ${i}`,
  url: '',
  status: (['new', 'open', 'pending', 'hold', 'solved', 'closed'] as Status[])[i % 6],
}));

test('app', async () => {
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
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(r.getByText('27 tickets in total, displaying tickets 1 to 25.')).toBeInTheDocument();
  expect(r.getByText('subject 1')).toBeInTheDocument();
  r.getByText('Next').click();
  expect(r.getByText('Page 2')).toBeInTheDocument();
  expect(r.getByText('subject 26')).toBeInTheDocument();
  r.getByText('Prev').click();
  expect(r.getByText('Page 1')).toBeInTheDocument();
});

test('ticket click', async () => {
  (fetch as any).mockResponseOnce(
    JSON.stringify({
      tickets,
      next_page: 'https://example.com/tickets/?page=2',
      count: 27,
    })
  );
  (fetch as any).mockResponseOnce(JSON.stringify({ name: 'John Doe' }));
  const r = render(<App />);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  r.getByText('subject 1').click();
  expect(r.getByText('description 1')).toBeInTheDocument();
});

test('get tickets failed', async () => {
  (fetch as any).mockResponseOnce('{}', { status: 500 });
  let r = render(<App />);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  expect(r.getByText('Error: getting tickets failed: unknown error')).toBeInTheDocument();

  (fetch as any).mockResponseOnce('{"error":"error message"}', { status: 500 });
  r = render(<App />);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(r.getByText('Error: getting tickets failed: error message')).toBeInTheDocument();

  (fetch as any).mockResponseOnce('{"error":{"title":"error title"}}', { status: 500 });
  r = render(<App />);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  expect(r.getByText('Error: getting tickets failed: error title')).toBeInTheDocument();
});

test('get user failed', async () => {
  (fetch as any).mockResponseOnce(
    JSON.stringify({
      tickets,
      next_page: 'https://example.com/tickets/?page=2',
      count: 27,
    })
  );
  (fetch as any).mockResponseOnce('', { status: 500 });
  const r = render(<App />);
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  expect(r.getByText(/^Error: getting user info failed/)).toBeInTheDocument();
  expect(r.getByText('Reload')).toBeInTheDocument();
});
