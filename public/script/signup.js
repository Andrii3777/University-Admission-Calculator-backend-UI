/**
 * Handles the signup form submission.
 * @param {Event} event - The submit event of the form.
 * @returns {Promise<void>}
 */
async function handleSignup(event) {
    // Prevent the default form submission behavior.
    event.preventDefault();

    // Get the form element from the event target.
    const form = event.target;

    // Get error elements for email and password.
    const emailError = document.querySelector('.email.error');
    const passwordError = document.querySelector('.password.error');

    // Reset error messages.
    emailError.textContent = '';
    passwordError.textContent = '';

    // Extract email and password values from the form.
    const email = form.email.value;
    const password = form.password.value;

    try {
        // Send a POST request to the signup endpoint with email and password.
        const response = await fetch('/api/v1/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type': 'application/json' }
        });

        // If student logged in successfully, redirect to the home page.
        if (response.status === 201) {
            location.assign('/api/v1/');
        }

        // Parse the JSON response.
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
        console.error('Error during signup:', err);
    }
}

const form = document.querySelector('form');
form.addEventListener('submit', handleSignup);