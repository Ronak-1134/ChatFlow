const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const handleSocket = require('./socketHandler');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, '../frontend')));

wss.on('connection', (ws) => {
  console.log('[WS] Client connected');
  handleSocket(ws);
  ws.on('close', () => console.log('[WS] Client disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));