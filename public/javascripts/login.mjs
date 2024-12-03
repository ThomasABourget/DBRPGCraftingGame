const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const playername = document.querySelector('#loginPlayername').value.trim();
    const password = document.querySelector('#loginPassword').value.trim();

    if (!playername || !password) {
        alert('Please fill in both fields.');
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Ensure you're sending JSON
            },
            body: JSON.stringify({ playername, password }), // Send data as JSON
        });

        const data = await response.json();

        if (response.ok) {
            // Login was successful
            alert('Login successful!');
            // Redirect to the inventory page (or wherever you need)
            window.location.href = '/html/inventory.html';
        } else {
            // Login failed
            alert(`Login failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred. Please try again.');
    }
});