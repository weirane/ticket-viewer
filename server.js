import express from 'express';
import axios from 'axios';

import config, { ZENDESK_URL } from './config.js';

const app = express();
const host = '127.0.0.1';
const port = 3001;

const AUTH = { auth: { username: config.username + '/token', password: config.token } };

app.get('/api/v2/tickets.json', async (req, res) => {
  let response;
  try {
    response = await axios.get(ZENDESK_URL + '/api/v2/tickets.json', {
      params: req.query,
      ...AUTH,
    });
  } catch (e) {
    response = e.response || { status: 500, data: { error: 'unknown error' } };
  }
  res.status(response.status);
  res.send(response.data);
});

app.get('/api/users/:userid', async (req, res) => {
  let response;
  try {
    response = await axios.get(ZENDESK_URL + `/api/v2/users/${req.params.userid}`, AUTH);
  } catch (e) {
    response = e.response || { status: 500, data: { user: {} } };
  }
  res.status(response.status);
  res.send(response.data.user);
});

app.listen(port, host, () => console.log(`Listening on ${host}:${port}`));
