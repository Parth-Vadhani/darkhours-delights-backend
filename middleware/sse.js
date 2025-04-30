const clients = new Set();

function notifySSEClients(status) {
  const message = JSON.stringify({ status });
  clients.forEach(client => {
    client.res.write(`data: ${message}\n\n`);
  });
}

function addClient(client) {
  clients.add(client);
  client.res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  client.res.write('\n');
}

function removeClient(client) {
  clients.delete(client);
}

module.exports = {
  notifySSEClients,
  addClient,
  removeClient
}; 