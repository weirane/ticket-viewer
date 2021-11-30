import React from 'react';
import Ticket, { hashTicket } from './Ticket';
import './App.css';

export interface ITicket {
  requester_id: number;
  readonly id: number;
  subject: string;
  description: string;
  url: string;
  status: 'new' | 'open' | 'pending' | 'hold' | 'solved' | 'closed';
}

type State = {
  tickets: ITicket[];
  userName: { [id: number]: string };
  currentPage: number;
  loaded: boolean;
  totalCount: number;
  nextPage: string | null;
  updateDisabled: boolean;
};

type TicketRes = {
  tickets: ITicket[];
  next_page: string | null;
  count: number;
};

const PAGE_SIZE = 25;

class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      tickets: [],
      userName: {},
      currentPage: 1,
      loaded: false,
      totalCount: 0,
      nextPage: '/api/v2/tickets.json',
      updateDisabled: false,
    };
    this.handleTicketClick = this.handleTicketClick.bind(this);
    this.collapseAll = this.collapseAll.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
  }

  async getTickets() {
    if (this.state.updateDisabled || this.state.nextPage === null) {
      return;
    }
    this.setState({ updateDisabled: true });
    const res: TicketRes = await fetch(this.state.nextPage).then((r) => r.json());
    const users = Array.from(new Set(res.tickets.map((r) => r.requester_id)));
    const usermap = await Promise.all(
      users.map((u) => fetch(`/users/${u}`).then((r) => r.json().then((res) => [u, res.name])))
    );
    let updateNextPage = {};
    if (res.next_page) {
      const npUrl = new URL(res.next_page);
      updateNextPage = { nextPage: npUrl.pathname + npUrl.search };
    }
    this.setState({
      tickets: this.state.tickets.concat(res.tickets),
      userName: Object.fromEntries(usermap),
      loaded: true,
      totalCount: res.count,
      updateDisabled: false,
      ...updateNextPage,
    });
  }

  async nextPage() {
    if (
      this.state.updateDisabled ||
      // reached the end
      this.state.currentPage >= Math.ceil(this.state.totalCount / PAGE_SIZE)
    ) {
      return;
    }
    this.collapseAll();
    const lastAvailPage = () => Math.ceil(this.state.tickets.length / PAGE_SIZE);
    while (this.state.currentPage >= lastAvailPage() && this.state.nextPage !== null) {
      // need to load more
      await this.getTickets();
    }
    this.setState({ currentPage: Math.min(lastAvailPage(), this.state.currentPage + 1) });
  }

  prevPage() {
    this.collapseAll();
    this.setState({ currentPage: Math.max(1, this.state.currentPage - 1) });
  }

  collapseAll() {
    for (const body of document.getElementsByClassName('ticket-body') as any) {
      body.style.maxHeight = '';
    }
  }

  componentDidMount() {
    this.getTickets();
  }

  handleTicketClick(e: React.MouseEvent) {
    const body = e.currentTarget.nextElementSibling! as HTMLElement;
    body.style.maxHeight = body.style.maxHeight ? '' : body.scrollHeight + 'px';
  }

  render() {
    const pageStart = (this.state.currentPage - 1) * PAGE_SIZE;
    const pageEnd = this.state.currentPage * PAGE_SIZE;
    const toDisplay = this.state.tickets.slice(pageStart, pageEnd);
    const ticketStart = pageStart + 1;
    const ticketEnd = pageStart + toDisplay.length;
    return (
      <div className="App">
        <h2>Ticket Viewer</h2>
        <div className="controls">
          <span className="page-indicator">Page {this.state.currentPage}</span>
          <button onClick={this.prevPage}>Prev</button>
          <button onClick={this.nextPage}>Next</button>
          <button onClick={this.collapseAll}>Collapse All</button>
          <span className="updating">{this.state.updateDisabled ? 'Updating...' : ''}</span>
        </div>
        {this.state.loaded ? (
          <div className="prefix">
            {this.state.totalCount} tickets in total, displaying tickets {ticketStart} to{' '}
            {ticketEnd}.
          </div>
        ) : (
          ''
        )}
        <br />
        {toDisplay.map((tick) => (
          <Ticket
            ticket={tick}
            userName={this.state.userName[tick.requester_id]}
            handleClick={this.handleTicketClick}
            key={hashTicket(tick)}
          />
        ))}
      </div>
    );
  }
}

export default App;
