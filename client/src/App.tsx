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
  allLoaded: boolean;
  loadedPage: number;
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
      allLoaded: false,
      loadedPage: 0,
    };
    this.handleTicketClick = this.handleTicketClick.bind(this);
    this.collapseAll = this.collapseAll.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
  }

  async getTickets() {
    type TRes = { tickets: ITicket[] };
    const res: TRes = await fetch('/tickets').then((r) => r.json());
    const users = Array.from(new Set(res.tickets.map((r) => r.requester_id)));
    const usermap = await Promise.all(
      users.map((u) => fetch(`/users/${u}`).then((r) => r.json().then((res) => [u, res.name])))
    );
    this.setState({ tickets: res.tickets, userName: Object.fromEntries(usermap), loaded: true });
  }

  nextPage() {
    const lastPage = Math.ceil(this.state.tickets.length / PAGE_SIZE);
    this.collapseAll();
    if (this.state.currentPage >= lastPage) {
      this.setState({ currentPage: Math.min(lastPage, this.state.currentPage + 1) });
    }
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
        {this.state.loaded ? (
          <div className="prefix">
            {this.state.tickets.length} tickets in total, displaying {ticketStart} to {ticketEnd}.
            <br />
            Page {this.state.currentPage}
            <button onClick={this.prevPage}>Prev</button>
            <button onClick={this.nextPage}>Next</button>
            <button onClick={this.collapseAll}>Collapse All</button>
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
