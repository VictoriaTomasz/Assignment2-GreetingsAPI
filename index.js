const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

// Open the SQLite database
let db;
(async () => {
  db = await sqlite.open({
    filename: './data/database.db',
    driver: sqlite3.Database
  });

  // Creating the Greetings table if it does not already exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Greetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timeOfDay TEXT NOT NULL,
      language TEXT NOT NULL,
      greetingMessage TEXT NOT NULL,
      tone TEXT NOT NULL
    )
  `);

  // Seeding the database
  const seedData = [
    ['Morning', 'English', 'Good morning', 'Formal'],
    ['Morning', 'English', 'Hey there', 'Casual'],
    ['Afternoon', 'French', 'Bonjour', 'Formal'],
    ['Evening', 'Spanish', 'Buenas noches', 'Formal'],
    ['Evening', 'Spanish', 'Hola', 'Casual'],
    ['Morning', 'Polish', 'Dzien dobry', 'Formal'],
    ['Morning', 'Polish', 'Czesc', 'Casual'],
  ];

  const existingCount = await db.get(`SELECT COUNT(*) as count FROM Greetings`);
  if (existingCount.count === 0) {
    for (const [timeOfDay, language, greetingMessage, tone] of seedData) {
      await db.run(
        `INSERT INTO Greetings (timeOfDay, language, greetingMessage, tone) VALUES (?, ?, ?, ?)`,
        [timeOfDay, language, greetingMessage, tone]
      );
    }
  }
})();

// Greet endpoint
app.post('/api/greet', async (req, res) => {
  const { timeOfDay, language, tone } = req.body;

  if (!timeOfDay || !language || !tone) {
    return res.status(400).json({ error: 'timeOfDay, language, and tone are required' });
  }

  try {
    const greeting = await db.get(
      `SELECT greetingMessage FROM Greetings WHERE timeOfDay = ? AND language = ? AND tone = ?`,
      [timeOfDay, language, tone]
    );

    if (!greeting) {
      return res.status(404).json({ error: 'Greeting not found' });
    }

    res.json({ message: greeting.greetingMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all times of day
app.get('/api/timesOfDay', async (req, res) => {
  try {
    const timesOfDay = await db.all(`SELECT DISTINCT timeOfDay FROM Greetings`);
    res.json({ message: 'success', data: timesOfDay.map(row => row.timeOfDay) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supported languages
app.get('/api/languages', async (req, res) => {
  try {
    const languages = await db.all(`SELECT DISTINCT language FROM Greetings`);
    res.json({ message: 'success', data: languages.map(row => row.language) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
