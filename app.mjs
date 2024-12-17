import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg'; // Import pg package
const { Client } = pkg;

const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Convert __dirname to be compatible with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL connection setup
const client = new Client({
  host: 'localhost',
  user: "postgres",
  port: 5432,
  password: "1022743",
  database: "ForgeDB"
});

// Connect to the database
(async () => {
  try {
    await client.connect();
    console.log("Connected to the database!");
  } catch (err) {
    console.error("Database connection error:", err.message);
  }
})();
// Endpoint to fetch player inventory with item names
app.get('/api/player-inventory/:playerId', async (req, res) => {
  const playerId = req.params.playerId;

  try {
    const result = await client.query(
        `SELECT ci.itemname, pi.quantity
         FROM playerInventory pi
         INNER JOIN craftableitem ci ON pi.itemid = ci.itemid
         WHERE pi.playerid = $1`,
        [playerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json([]);
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching inventory:', err.message);
    res.status(500).json({ message: 'Error fetching inventory' });
  }
});

// Endpoint to get player info
app.get('/api/player/:playerid', async (req, res) => {
  const { playerid } = req.params;

  try {
    const playerQuery = await client.query('SELECT * FROM player WHERE playerid = $1', [playerid]);

    if (playerQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const player = playerQuery.rows[0];

    // Return player info
    res.json({
      playerid: player.playerid,
      playername: player.playername,
      playerlevel: player.playerlevel,
    });
  } catch (err) {
    console.error("Error fetching player data:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to craft an item and add it to the inventory
// Endpoint to craft an item and level up the player
// Endpoint to craft an item and add it to the inventory
app.post('/api/craft', async (req, res) => {
  const { playerid } = req.body; // Get the playerid from the request body

  if (!playerid) {
    return res.status(400).json({ message: 'Player ID is required' });
  }

  try {
    // Fetch a random item from the craftableitem table
    const itemResult = await client.query(
        'SELECT * FROM craftableitem ORDER BY RANDOM() LIMIT 1'
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: 'No items available to craft.' });
    }

    const item = itemResult.rows[0];
    const { itemid, itemname, rarityid } = item;

    // Check if the player already has the item in their inventory
    await client.query(
        `INSERT INTO playerInventory (playerid, itemid, quantity)
       VALUES ($1, $2, 1)
       ON CONFLICT (playerid, itemid)
       DO UPDATE SET quantity = playerInventory.quantity + 1`,
        [playerid, itemid]
    );

    // Increment the player's level by 1
    const levelUpdateResult = await client.query(
        `UPDATE player
       SET playerlevel = playerlevel + 1
       WHERE playerid = $1
       RETURNING playerlevel`,
        [playerid]
    );

    const updatedLevel = levelUpdateResult.rows[0].playerlevel;

    // Return the crafted item details and updated player level
    res.status(200).json({
      message: `Item crafted successfully! Player leveled up to level ${updatedLevel}.`,
      itemname: itemname,
      rarityid: rarityid,
      playerlevel: updatedLevel,
    });
  } catch (err) {
    console.error('Error crafting item:', err.message);
    res.status(500).json({ message: 'Error crafting item.' });
  }
});



// Endpoint to register a new user
app.post('/api/register', async (req, res) => {
  const playername = req.body.playername;
  const password = req.body.password;

  if (!playername || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const result = await client.query(
        'INSERT INTO player (playername, password) VALUES ($1, $2) RETURNING playerid',
        [playername, password]
    );

    res.status(201).json({ message: 'User registered successfully', playerId: result.rows[0].playerid });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Endpoint to fetch player inventory
app.get('/api/player-inventory/:playerId', async (req, res) => {
  const playerId = req.params.playerId;

  try {
    const result = await client.query(
        'SELECT itemid, quantity FROM playerInventory WHERE playerid = $1',
        [playerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json([]);
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching inventory:', err.message);
    res.status(500).json({ message: 'Error fetching inventory' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/html/index.html`);
});
