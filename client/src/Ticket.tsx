import React from 'react';
import { ITicket } from './App';

export function hashTicket(tick: ITicket): number {
  const concat = tick.subject + tick.requester_id + tick.description;
  let hash = 0;
  for (const chr of concat) {
    hash = (hash << 5) - hash + chr.charCodeAt(0);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

interface TicketInfo {
  ticket: ITicket;
  userName: string;
  handleClick: (e: React.MouseEvent) => void;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

class Ticket extends React.Component<TicketInfo> {
  render() {
    const tick = this.props.ticket;
    const statusSign: string = capitalize(tick.status);
    let color: string;
    switch (tick.status) {
      case 'new':
      case 'open':
        color = 'red';
        break;
      case 'closed':
      case 'solved':
        color = 'gray';
        break;
      case 'hold':
      case 'pending':
        color = 'blue';
        break;
    }
    return (
      <div className="ticket">
        <h3 className="ticket-title" onClick={this.props.handleClick}>
          <span className={color + ' ticket-status-mark'}>{statusSign}</span> {tick.subject}
        </h3>
        <div className="ticket-body">
          <div className="requester">Requester: {this.props.userName}</div>
          <p>{tick.description}</p>
        </div>
      </div>
    );
  }
}

export default Ticket;
