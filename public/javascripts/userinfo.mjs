// Replace with the actual player ID, potentially retrieved from a session or token
const playerId = 1;

// Function to fetch and display player information
async function loadUserInfo() {
    try {
        const response = await fetch(`/api/player/${playerId}`);
        if (response.ok) {
            const data = await response.json();

            // Display player information
            document.getElementById('playername').textContent = `Player Name: ${data.playername}`;
            document.getElementById('level').textContent = `Level: ${data.playerlevel}`;
        } else {
            document.getElementById('user-info').innerHTML = '<p>Error fetching player information.</p>';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        document.getElementById('user-info').innerHTML = '<p>Error loading player data.</p>';
    }
}

// Function to fetch and display player inventory
async function loadUserInventory() {
    try {
        const response = await fetch(`/api/player-inventory/${playerId}`);
        const inventoryContainer = document.getElementById('inventory-container');

        if (response.ok) {
            const items = await response.json();

            if (items.length === 0) {
                inventoryContainer.innerHTML = '<p>No items in inventory.</p>';
            } else {
                // Create and populate the inventory table
                const inventoryTable = document.createElement('table');
                inventoryTable.innerHTML = `
                    <thead>
                        <tr>
                            <th>Item ID</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>${item.itemid}</td>
                                <td>${item.quantity}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
                inventoryContainer.innerHTML = ''; // Clear any existing content
                inventoryContainer.appendChild(inventoryTable);
            }
        } else {
            inventoryContainer.innerHTML = '<p>Error fetching inventory.</p>';
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
        document.getElementById('inventory-container').innerHTML = '<p>Error loading inventory data.</p>';
    }
}

// Load player info and inventory when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadUserInventory();
});
