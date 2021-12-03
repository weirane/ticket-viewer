# Ticket Viewer

## Installation

Install dependencies:
```bash
npm i
cd client
npm i
```

## Usage

Setup credentials by adding the following lines to `./config.js`. Change the
values accordingly.
```javascript
const username = 'email@example.com';
const token = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcd';
export const ZENDESK_URL = 'https://example.zendesk.com';

export default { username, token };
```

First run the backend server:
```bash
node server.js
```

Then in a new terminal, run the frontend:
```bash
cd client
npm start
```

Initially, the interface shows the titles of the tickets. Clicking the title can
show or hide the details of a ticket. There are buttons for paging on the top.
Clicking the "Next" or "Prev" buttons can switch to the next or previous page.
