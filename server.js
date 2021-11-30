import express from 'express';
import axios from 'axios';

import config, { ZENDESK_URL } from './config.js';

const app = express();
const host = '127.0.0.1';
const port = 3001;

const AUTH = { auth: { username: config.username + '/token', password: config.token } };

app.get('/api/v2/tickets.json', async (req, res) => {
  const tick = await axios.get(ZENDESK_URL + '/api/v2/tickets.json', {
    params: req.query,
    ...AUTH,
  });
  res.send(tick.data);
});

app.get('/users/:userid', async (req, res) => {
  const user = await axios.get(ZENDESK_URL + `/api/v2/users/${req.params.userid}`, AUTH);
  res.send(user.data.user);
});

app.listen(port, host, () => console.log(`Listening on ${host}:${port}`));
