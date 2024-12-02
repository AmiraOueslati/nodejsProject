const express = require('express');
const router = express.Router();
const sheepController = require('../controllers/sheepController'); // Assurez-vous du bon chemin

// Routes API pour les moutons
router.get('/', sheepController.getAllSheep);
router.get('/:id', sheepController.getSheepById);
router.delete('/:id', sheepController.deleteSheep);

// Exemple d'une fonction asynchrone pour récupérer l'historique
router.get('/history/:sensorId', async (req, res) => {
    const sensorId = Number(req.params.sensorId); // Conversion en nombre
    if (isNaN(sensorId)) {
      return res.status(400).json({ message: 'sensorId must be a number' });
    }
  
    try {
      const history = await Sheep.find({ sensorId: sensorId });
  
      if (history.length === 0) {
        return res.status(404).json({ message: 'No sheep found for this sensorId' });
      }
  
      res.json(history);
    } catch (err) {
      console.error('Error fetching sheep history:', err);
      res.status(500).send('Server error');
    }
  });
  
