const craftingButton = document.getElementById("crafting-button");
const craftingResult = document.getElementById("crafting-result");
const cooldownMessage = document.getElementById("crafting-cooldown");
const cooldownTimer = document.getElementById("cooldown-timer");

let craftingCooldown = false;

// Rarity configuration mapping rarityid to colors and names
const rarityConfig = {
    1: { name: 'Common', color: 'gray' },
    2: { name: 'Uncommon', color: 'green' },
    3: { name: 'Rare', color: 'blue' },
    4: { name: 'Epic', color: 'purple' },
    5: { name: 'Legendary', color: 'gold' },
    6: { name: 'Divine', color: 'orange' },
};

const playerId = 1; // Set the player ID to 1 for this example

async function craftItem() {
    if (craftingCooldown) {
        craftingResult.textContent = "Please wait before crafting again!";
        return;
    }

    try {
        const response = await fetch('/api/craft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerid: playerId }),
        });

        if (response.ok) {
            const item = await response.json();
            const rarityId = item.rarityid || 1; // Default to Common if no rarityid specified
            const rarity = rarityConfig[rarityId] || rarityConfig[1]; // Use rarity config or default to Common

            // Set the text content with fade-in and color based on rarity
            craftingResult.textContent = `You crafted: ${item.itemname || 'Unknown Item'}! (${rarity.name})`;
            craftingResult.style.color = rarity.color;
            fadeInResult(); // Trigger fade-in effect
            startCooldown(300); // Start a 5-minute cooldown
        } else {
            craftingResult.textContent = "Failed to craft item. Try again later!";
        }
    } catch (error) {
        craftingResult.textContent = "An error occurred. Please try again later.";
        console.error("Crafting error:", error);
    }
}

function fadeInResult() {
    craftingResult.style.opacity = 0;
    craftingResult.style.transition = 'opacity 1s ease';
    craftingResult.style.opacity = 1; // Trigger fade-in
}

function startCooldown(seconds) {
    craftingCooldown = true;
    cooldownMessage.style.display = "block";
    craftingButton.disabled = true;

    let remaining = seconds;
    cooldownTimer.textContent = remaining;

    const interval = setInterval(() => {
        remaining--;
        cooldownTimer.textContent = remaining;

        if (remaining <= 0) {
            clearInterval(interval);
            cooldownMessage.style.display = "none";
            craftingButton.disabled = false;
            craftingCooldown = false;
            craftingResult.textContent = "Ready to craft again!";
            craftingResult.style.opacity = 1; // Reset opacity when cooldown ends
        }
    }, 1000);
}

craftingButton.addEventListener("click", craftItem);
