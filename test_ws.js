const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:400'); // Assuming backend is on port 4000, let's check

ws.on('open', () => {
  console.log('Connected');
  // Wait a bit, then send the message. We don't have auth, so we might need to fake it or the server might reject it.
  // Actually, we can't test this easily without auth if the server requires a token.
  ws.close();
});

ws.on('error', (err) => {
  console.error('Error:', err);
});
