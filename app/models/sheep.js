const mongoose = require('mongoose');

// Définition du schéma pour un mouton
const SheepSchema = new mongoose.Schema({
  sensorId: {
    type: Number,
    required: true,
    unique: true, // Chaque mouton a un capteur unique
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  age: {
    type: Number,
    required: true,
  },
  image: {
    type: String, // URL ou chemin de l'image
  },
  location: [
    {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now, // Enregistre l'heure d'ajout de la position
      },
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Sheep', SheepSchema);
