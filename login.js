// --- ELEMENT SELECTION ---
// NOTE: This script assumes the following IDs are added to your HTML elements:
// 1. Main container: <div class="container" id="container">
// 2. Login Form container: <div class="form-box login" id="loginForm">
// 3. Register Button: <button class="btn register-btn" id="registerBtn">
const container = document.getElementById('container');
const loginFormElement = document.getElementById('loginForm');
const registerBtn = document.getElementById('registerBtn');


// --- HELPER FUNCTIONS (Messages and Home Page Simulation) ---

function removeMessage() {
    const existingMessage = document.getElementById('status-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

// Function to display a status message using the CSS classes .status-message, .success, and .failure
function displayMessage(message, isSuccess = true) {
    removeMessage(); 

    const messageBox = document.createElement('div');
    messageBox.id = 'status-message';
    messageBox.textContent = message;
    
    // Uses the CSS classes provided in the previous response
    messageBox.classList.add('status-message');
    messageBox.classList.add(isSuccess ? 'success' : 'failure');
    
    document.body.appendChild(messageBox);

    setTimeout(() => {
        const currentMessage = document.getElementById('status-message');
        if (currentMessage) {
            currentMessage.style.opacity = '0'; 
            setTimeout(removeMessage, 300); 
        }
    }, 3000);
}

// Function to simulate navigating to the home page (replacing content)
function goToHome(username) {
    removeMessage();
    
    if (!container) {
        console.error("Container element not found. Please ensure it has id='container'.");
        return;
    }

    // Replace the entire container content with the home page view
    container.innerHTML = `
        <div style="
            padding: 50px; 
            text-align: center; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            height: 100%; 
            width: 100%;
            border-radius: 30px; 
            background-color: #f7f7f7;">
            
            <h1 style="color: #122858; font-size: 48px; margin-bottom: 20px;">
                Welcome Home, ${username || 'User'}!
            </h1>
            <p style="color: #555; font-size: 18px; margin-bottom: 30px;">
                You have successfully logged in.
            </p>
            <button style="
                padding: 10px 30px;
                background: #f44336; 
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 10px rgba(0,0,0,.15);
                transition: background 0.3s;
            " onclick="window.location.reload()">Logout</button>
        </div>
    `;
    // Adjust container size for the new content 
    container.style.width = '600px'; 
    container.style.height = '400px';
}


// --- FORM SUBMISSION HANDLER ---

function handleLogin(event) {
    event.preventDefault(); // Stop page reload

    // Use event.target to reference the form that was submitted
    const form = event.target; 
    
    // Query the form for the input values
    const usernameInput = form.querySelector('input[type="text"]').value;
    const passwordInput = form.querySelector('input[type="password"]').value;

    // Simple SIMULATION: Check if fields are filled
    if (usernameInput && passwordInput) {
        displayMessage("Login successful! Redirecting...", true);
        // Requirement: After login, the home page gets open
        setTimeout(() => goToHome(usernameInput), 500); 
    } else {
        displayMessage("Login failed. Please enter your credentials.", false);
    }
}


// --- EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Handle Register Button Click
    // We prevent the default navigation from the <a> tag
    if (registerBtn && registerBtn.parentNode.tagName === 'A') {
        registerBtn.parentNode.addEventListener('click', (e) => {
            e.preventDefault();
            // Since the signup form is commented out, we inform the user
            displayMessage("Registration feature is enabled! Please uncomment the 'Sign Up Page' form in index.html and ensure both forms have IDs for full functionality.", true);
        });
    }

    // 2. Handle Login Submission
    if (loginFormElement) {
        // Find the actual <form> tag inside the .form-box
        const loginForm = loginFormElement.querySelector('form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        } else {
            console.error("Login form error: <form> element not found inside loginFormElement.");
        }
    } else {
        console.error("Login form element (#loginForm) not found. Please ensure it has id='loginForm'.");
    }
});
