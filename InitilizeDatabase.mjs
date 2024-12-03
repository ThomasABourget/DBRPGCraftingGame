////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// IMPORTS

import sqlite3 from "sqlite3";
import { openDatabase } from "./routes/database.mjs";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function initializeDatabase() {
    // Create the Database File
    const db = await openDatabase();

    // Create Tables in the Database
    await createTables(db);

    // Insert Data into the Database
    await insertData(db);

    // Close the Database File
    await db.close();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function createTables(db) {
    try {
        // Drop existing tables (if any)
        await db.exec("DROP TABLE IF EXISTS Player;");
        await db.exec("DROP TABLE IF EXISTS Rarity;");
        await db.exec("DROP TABLE IF EXISTS CraftableItem;");
        await db.exec("DROP TABLE IF EXISTS PlayerCraftedItem;");
        await db.exec("DROP TABLE IF EXISTS LootRoll;");
        await db.exec("DROP TABLE IF EXISTS CraftingHistory;");
        await db.exec("DROP TABLE IF EXISTS PlayerInventory;");
        await db.exec("DROP TABLE IF EXISTS PlayerStats;");

        // Create Rarity Table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS Rarity (
                RarityID INTEGER PRIMARY KEY AUTOINCREMENT,
                RarityName TEXT NOT NULL UNIQUE CHECK(RarityName IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Divine')),
                RarityMultiplier REAL NOT NULL
            );
        `);

        // Create Player Table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS Player (
                PlayerID INTEGER PRIMARY KEY AUTOINCREMENT,
                PlayerName TEXT NOT NULL,
                PlayerLevel INTEGER DEFAULT 1
            );
        `);

        // Create CraftableItem Table (Ensure CraftingCost column is included)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS CraftableItem (
                ItemID INTEGER PRIMARY KEY AUTOINCREMENT,
                ItemName TEXT NOT NULL,
                ItemType TEXT CHECK(ItemType IN ('Sword', 'Axe', 'Katana')) NOT NULL,
                Material TEXT NOT NULL,
                Damage INTEGER NOT NULL,
                CraftingCost INTEGER NOT NULL,  -- Ensure this column is included
                RarityID INTEGER NOT NULL,
                FOREIGN KEY (RarityID) REFERENCES Rarity(RarityID)
            );
        `);

        // Create PlayerCraftedItem Table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS PlayerCraftedItem (
                CraftedID INTEGER PRIMARY KEY AUTOINCREMENT,
                PlayerID INTEGER NOT NULL,
                ItemID INTEGER NOT NULL,
                CraftDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID),
                FOREIGN KEY (ItemID) REFERENCES CraftableItem(ItemID)
            );
        `);

        // Create LootRoll Table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS LootRoll (
                LootRollID INTEGER PRIMARY KEY AUTOINCREMENT,
                RarityID INTEGER NOT NULL,
                DropChance REAL NOT NULL CHECK(DropChance >= 0 AND DropChance <= 1), -- Probability for each rarity
                FOREIGN KEY (RarityID) REFERENCES Rarity(RarityID)
            );
        `);

        // Create CraftingHistory Table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS CraftingHistory (
                CraftID INTEGER PRIMARY KEY AUTOINCREMENT,
                PlayerID INTEGER NOT NULL,
                ItemID INTEGER NOT NULL,
                CraftDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                Success BOOLEAN NOT NULL, -- Tracks whether the craft succeeded (optional)
                FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID),
                FOREIGN KEY (ItemID) REFERENCES CraftableItem(ItemID)
            );
        `);

        // Create PlayerInventory Table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS PlayerInventory (
                InventoryID INTEGER PRIMARY KEY AUTOINCREMENT,
                PlayerID INTEGER NOT NULL,
                ItemID INTEGER NOT NULL,
                Quantity INTEGER DEFAULT 1,
                FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID),
                FOREIGN KEY (ItemID) REFERENCES CraftableItem(ItemID)
            );
        `);

        // Create PlayerStats Table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS PlayerStats (
                PlayerID INTEGER PRIMARY KEY,
                TotalCrafts INTEGER DEFAULT 0,
                RarestItemCraftedID INTEGER, -- Optional, tracks the rarest item they've crafted
                FOREIGN KEY (PlayerID) REFERENCES Player(PlayerID),
                FOREIGN KEY (RarestItemCraftedID) REFERENCES CraftableItem(ItemID)
            );
        `);

        console.log("Tables created successfully.");
    } catch (error) {
        console.error("Error Creating Tables:", error.message);
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// INSERT DATA

async function insertData(db) {
    await insertGameData(db);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

initializeDatabase();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function insertGameData(db) {
    try {
        // Prepare statements for each table
        const insertRarityStmt = await db.prepare(`
            INSERT INTO Rarity (RarityName, RarityMultiplier)
            VALUES (?, ?)
        `);

        const insertCraftableItemStmt = await db.prepare(`
            INSERT INTO CraftableItem (ItemName, ItemType, Material, Damage, CraftingCost, RarityID)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        // Insert rarities
        const rarities = [
            ["Common", 1.0],
            ["Uncommon", 1.2],
            ["Rare", 1.5],
            ["Epic", 2.0],
            ["Legendary", 3.0],
            ["Divine", 5.0],
        ];

        for (const [rarityName, multiplier] of rarities) {
            await insertRarityStmt.run(rarityName, multiplier);
        }

        // Insert craftable items
        const craftableItems = [
            ["Iron Sword", "Sword", "Iron", 25, 50, 1], // Common
            ["Steel Axe", "Axe", "Steel", 35, 75, 2],   // Uncommon
            ["Obsidian Katana", "Katana", "Obsidian", 50, 100, 3], // Rare
            ["Golden Sword", "Sword", "Gold", 70, 150, 4], // Epic
            ["Dragon Slayer", "Axe", "Dragon Bone", 120, 300, 5], // Legendary
            ["Divine Blade", "Sword", "Celestial Steel", 200, 500, 6], // Divine
            ["Divine Blade", "Sword", "Celestial Steel", 200, 500, 6], // Divine

        ];

        for (const [itemName, itemType, material, damage, cost, rarityID] of craftableItems) {
            await insertCraftableItemStmt.run(itemName, itemType, material, damage, cost, rarityID);
        }

        // Finalize statements
        await insertRarityStmt.finalize();
        await insertCraftableItemStmt.finalize();

        console.log("Game data inserted successfully.");
    } catch (error) {
        console.error("Error inserting game data:", error.message);
    }
}
