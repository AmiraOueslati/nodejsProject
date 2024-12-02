const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');
const sheepRoutes = require('./app/routes/sheepRoutes');
const sheepController = require('./app/controllers/sheepController');
const { WebSocketServer, WebSocket } = require('ws'); // Import WebSocketServer et WebSocket
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/sheep-tracker')
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur de connexion MongoDB :', err));

// Routes pour les moutons
app.use('/api/sheep', sheepRoutes);

// Configuration MQTT
const mqttClient = mqtt.connect('mqtts://bdcd27642c1142b380a719c4835ddcd8.s1.eu.hivemq.cloud:8883', {
  username: 'amira',
  password: 'Amira123456789',
});

mqttClient.on('connect', () => {
  console.log('Connecté au broker MQTT');
  mqttClient.subscribe('#', (err) => {
    if (!err) {
      console.log('Souscrit au topic gps/sheep-tracker');
    } else {
      console.error('Erreur de souscription au topic:', err);
    }
  });
});

// Gestion des erreurs de connexion
mqttClient.on('error', (err) => {
  console.error('Erreur de connexion MQTT :', err);
});

// Configurer le serveur HTTP et WebSocket
const server = require('http').createServer(app);
const wss = new WebSocketServer({ server });

// Gestion des connexions WebSocket
wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connecté');

  // Message de bienvenue
  ws.send(JSON.stringify({ message: 'Bienvenue sur le serveur WebSocket' }));

  // Gérer la déconnexion
  ws.on('close', () => {
    console.log('[WebSocket] Client déconnecté');
  });
});

// Gestion des messages MQTT
mqttClient.on('message', async (topic, message) => {
  try {
    console.log('[MQTT] Message brut reçu :', message.toString());
    const data = JSON.parse(message.toString());
    console.log('[MQTT] Message après parsing :', data);

    // Ajout ou mise à jour du mouton dans MongoDB
    await sheepController.addLocation(data.ID, data.Lat, data.Lng);

    // Diffusion des données à tous les clients WebSocket connectés
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {  // Utiliser WebSocket ici pour vérifier l'état
        console.log('[WebSocket] Envoi de données au client :', {
          sensorId: data.ID,
          latitude: data.Lat,
          longitude: data.Lng,
        });
        client.send(
          JSON.stringify({
            sensorId: data.ID,
            latitude: data.Lat,
            longitude: data.Lng,
          })
        );
      } else {
        console.warn('[WebSocket] Client non connecté, données ignorées.');
      }
    });
  } catch (error) {
    console.error('[MQTT] Erreur lors du traitement du message MQTT :', error.message);
  }
});

// Démarrage du serveur
const PORT = 3000;
server.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
