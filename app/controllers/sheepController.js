const Sheep = require('../models/sheep');

// Ajouter ou mettre à jour un mouton
exports.add = async (data) => {
  try {
    const sheep = await Sheep.findOneAndUpdate(
      { sensorId: data.sensorId },
      {
        name: data.name || "Mouton anonyme",
        description: data.description || "",
        age: data.age || 0,
        image: data.image || "",
        location: [],
        lastUpdated: Date.now(),
      },
      { upsert: true, new: true } // Crée si non trouvé
    );
    return sheep;
  } catch (error) {
    throw new Error("Erreur lors de l'ajout/mise à jour du mouton : " + error.message);
  }
};

// Ajouter une position à un mouton
exports.addLocation = async (ID, Lat, Lng) => {
  try {
    const sheep = await Sheep.findOne({ sensorId: ID });
    if (sheep) {
      sheep.location.push({ latitude: Lat, longitude: Lng });
      await sheep.save();
    }
  } catch (error) {
    throw new Error("Erreur lors de l'ajout de la position : " + error.message);
  }
};

// Ajouter ou mettre à jour un mouton via MQTT ou API
exports.addOrUpdateSheep = async (data) => {
  try {
    const sheep = await Sheep.findOneAndUpdate(
      { sensorId: data.sensorId },
      {
        name: data.name || "Mouton anonyme",
        description: data.description || "",
        age: data.age || 0,
        image: data.image || "",
        location: { latitude: data.latitude, longitude: data.longitude },
        lastUpdated: Date.now(),
      },
      { upsert: true, new: true } // Crée si non trouvé
    );
    return sheep;
  } catch (error) {
    throw new Error("Erreur lors de l'ajout/mise à jour du mouton : " + error.message);
  }
};

// Récupérer tous les moutons
exports.getAllSheep = async (req, res) => {
  try {
    const sheep = await Sheep.find();
    res.json(sheep);
  } catch (error) {
    res.status(500).send("Erreur lors de la récupération des moutons : " + error.message);
  }
};

// Récupérer un mouton spécifique par son ID de capteur
exports.getSheepById = async (req, res) => {
  try {
    const sheep = await Sheep.findOne({ sensorId: req.params.id });
    if (!sheep) return res.status(404).send("Mouton non trouvé");
    res.json(sheep);
  } catch (error) {
    res.status(500).send("Erreur lors de la récupération du mouton : " + error.message);
  }
};

// Supprimer un mouton par son ID de capteur
exports.deleteSheep = async (req, res) => {
  try {
    const sheep = await Sheep.findOneAndDelete({ sensorId: req.params.id });
    if (!sheep) return res.status(404).send("Mouton non trouvé");
    res.send("Mouton supprimé avec succès");
  } catch (error) {
    res.status(500).send("Erreur lors de la suppression du mouton : " + error.message);
  }
};

// Récupérer l'historique des positions d'un mouton
exports.getSheepHistory = async (req, res) => {
  try {
    const { sensorId } = req.params;
    const sheep = await Sheep.findOne({ sensorId });

    if (!sheep) {
      return res.status(404).json({ message: 'Mouton non trouvé' });
    }

    // Récupérer l'historique des positions
    const locationHistory = sheep.location;

    return res.json(locationHistory);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'historique des positions :', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
