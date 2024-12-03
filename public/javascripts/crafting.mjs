const craftingButton = document.getElementById("crafting-button");
const craftingResult = document.getElementById("crafting-result");
const cooldownMessage = document.getElementById("crafting-cooldown");
const cooldownTimer = document.getElementById("cooldown-timer");

let craftingCooldown = false;

async function craftItem() {
    if (craftingCooldown) {
        craftingResult.textContent = "Please wait before crafting again!";
        return;
    }

    try {
        const response = await fetch('/api/craft');
        if (response.ok) {
            const item = await response.json();
            let itemRarity = item.rarity || 'common'; // Default to common if no rarity specified

            // Set the text content with fade-in and color based on rarity
            craftingResult.textContent = `You crafted: ${item.itemname || 'Unknown Item'}!`;
            setRarityColor(itemRarity);
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

function setRarityColor(rarity) {
    switch (rarity.toLowerCase()) {
        case 'legendary':
            craftingResult.style.color = 'gold';
            break;
        case 'rare':
            craftingResult.style.color = 'blue';
            break;
        case 'uncommon':
            craftingResult.style.color = 'green';
            break;
        default:
            craftingResult.style.color = 'red'; // Common items
            break;
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
