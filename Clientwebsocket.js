const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('Connecté au serveur WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Données reçues :', data);
};

ws.onclose = () => {
  console.log('Déconnecté du serveur WebSocket');
};
