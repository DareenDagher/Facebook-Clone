
// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    // Check login
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser && window.location.pathname.includes('home.html')) {
        window.location.href = 'index.html';
        return;
    }

    // Setup pages
    if (window.location.pathname.includes('index.html')) {
        setupLogin();
        setupGenderSelection();
    } 
    else if (window.location.pathname.includes('home.html')) {
        displayPosts();
    }

    setupSearchFocus();

    // Enable bootstrap popover
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
});

// Login Function
function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const response = await fetch(`http://localhost:3001/users?email=${email}`);
        if (!response.ok) {
            alert('Network error!');
            return;
        }
        
        const users = await response.json();
        
        if (users.length === 0) {
            alert('User not found!');
            return;
        }
        
        if (users[0].password !== password) {
            alert('Wrong password!');
            return;
        }
        
        localStorage.setItem('currentUser', JSON.stringify(users[0]));
        window.location.href = 'home.html';
    });
}

// Gender Selection
function setupGenderSelection() {
    const femaleBtn = document.querySelector('#female');
    const maleBtn = document.querySelector('#male');
    const customBtn = document.querySelector('#custom');
    const genderCustom = document.querySelector('#gender-custom');

    if (femaleBtn && maleBtn && customBtn && genderCustom) {
        femaleBtn.addEventListener('change', () => genderCustom.classList.add('d-none'));
        maleBtn.addEventListener('change', () => genderCustom.classList.add('d-none'));
        customBtn.addEventListener('change', () => genderCustom.classList.remove('d-none'));
    }
}

// Search Focus
function setupSearchFocus() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(trigger => {
            trigger.addEventListener('click', () => setTimeout(() => searchInput.focus(), 200));
        });
    }
}
