// Select the registration form
const registerForm = document.querySelector('#registerForm');

// Handle the form submission
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page

    // Get form inputs
    const playername = document.querySelector('#registerPlayername').value.trim();
    const password = document.querySelector('#registerPassword').value.trim();

    if (!playername || !password) {
        alert('Please fill in both fields.');
        return;
    }

    try {
        // Send data to the backend
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playername, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! You can now log in.');
            window.location.href = '/html/login.html'; // Redirect to login page
        } else {
            alert(`Registration failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration. Please try again.');
    }
});
