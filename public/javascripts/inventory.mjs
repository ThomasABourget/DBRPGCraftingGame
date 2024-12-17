// Hardcoded player ID
const playerId = 1;

// Function to fetch and display player information
async function loadPlayerInfo() {
    try {
        const response = await fetch(`/api/player/${playerId}`);
        const playerInfoContainer = document.getElementById('player-info');

        if (response.ok) {
            const player = await response.json();
            document.getElementById('playername').textContent = `Player Name: ${player.playername}`;
            document.getElementById('level').textContent = `Level: ${player.playerlevel}`;
        } else {
            playerInfoContainer.innerHTML = '<p>Error fetching player information.</p>';
        }
    } catch (error) {
        console.error('Error loading player info:', error);
        document.getElementById('player-info').innerHTML = '<p>Error loading player data.</p>';
    }
}

// Function to fetch and display player inventory
async function loadPlayerInventory() {
    try {
        const response = await fetch(`/api/player-inventory/${playerId}`);
        const inventoryList = document.getElementById('inventory-list');

        if (response.ok) {
            const inventory = await response.json();

            if (inventory.length === 0) {
                inventoryList.innerHTML = '<p>No items in inventory.</p>';
            } else {
                // Create an inventory table
                const table = document.createElement('table');
                table.className = 'inventory-table'; // Optional: Add a CSS class for styling
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inventory
                    .map(
                        (item) => `
                            <tr>
                                <td>${item.itemname}</td>
                                <td>${item.quantity}</td>
                            </tr>
                        `
                    )
                    .join('')}
                    </tbody>
                `;
                inventoryList.innerHTML = ''; // Clear existing content
                inventoryList.appendChild(table); // Append the table
            }
        } else {
            inventoryList.innerHTML = '<p>Error fetching inventory.</p>';
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
        document.getElementById('inventory-list').innerHTML = '<p>Error loading inventory data.</p>';
    }
}

// Initialize functions on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPlayerInfo();
    loadPlayerInventory();
});
