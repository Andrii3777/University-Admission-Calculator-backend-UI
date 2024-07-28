/**
 * Handles the login form submission.
 * @param {Event} event - The submit event of the form.
 * @returns {Promise<void>}
 */
async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const emailError = document.querySelector('.email.error');
    const passwordError = document.querySelector('.password.error');

    // Reset error messages.
    emailError.textContent = '';
    passwordError.textContent = '';

    // Extract email and password values from the form.
    const email = form.email.value;
    const password = form.password.value;

    try {
        // Send a POST request to the login endpoint with email and password.
        const response = await fetch('/api/v1/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' }
        });

        // If student signed up successfully, redirect to the home page.
        if (response.status === 200) {
            location.assign('/api/v1/');
        }

        const data = await response.json();

        // Check if there is an error in the response.
        if (data.error) {
            if (data.path === 'email') {
                emailError.textContent = data.error;
            }
            if (data.path === 'password') {
                passwordError.textContent = data.error;
            }
        }
    } catch (err) {
        // Log any errors that occur during the fetch operation.
        console.error('Error during login:', err);
    }
}

const form = document.querySelector('form');
form.addEventListener('submit', handleLogin);