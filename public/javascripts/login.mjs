// Handle form submission for login
document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form from refreshing the page

    const playername = document.getElementById('playername').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playername, password }),
        });

        if (response.ok) {
            // Login successful
            const data = await response.json();
            alert('Login successful!');
            // Redirect to another page (e.g., player details or home page)
            window.location.href = `/html/userinfo.html?playerId=${data.playerId}`;
        } else {
            // Display error message
            const errorMessage = await response.text();
            document.getElementById('error-message').textContent = errorMessage || 'Login failed.';
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('error-message').textContent = 'An error occurred. Please try again.';
    }
});
