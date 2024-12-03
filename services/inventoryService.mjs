// services/inventoryService.js

// Example database model or mock database
const inventoryDB = {
    // Assuming a simple in-memory store for example
    player1: { id: 1, items: ["sword", "shield", "potion"] },
    player2: { id: 2, items: ["bow", "arrow", "elixir"] }
};

// Function to get inventory by player ID
export function getInventoryByPlayerId(playerId) {
    return new Promise((resolve, reject) => {
        const playerInventory = inventoryDB[`player${playerId}`];
        if (playerInventory) {
            resolve(playerInventory);
        } else {
            reject(new Error("Inventory not found for this player."));
        }
    });
}

// Function to update inventory for a player
export function updateInventory(playerId, newItems) {
    return new Promise((resolve, reject) => {
        const playerInventory = inventoryDB[`player${playerId}`];
        if (playerInventory) {
            playerInventory.items = newItems;
            resolve(playerInventory);
        } else {
            reject(new Error("Player not found."));
        }
    });
}
