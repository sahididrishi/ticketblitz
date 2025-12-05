const API_BASE = '/api';
let token = localStorage.getItem('token');
let currentUser = null;
let currentRole = null;
let currentUserId = null;
let currentEventId = null;
let selectedSeatId = null;
let salesChart = null;

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const authForm = document.getElementById('auth-form');
const switchLink = document.getElementById('switch-link');
const logoutBtn = document.getElementById('logout-btn');
const eventsGrid = document.getElementById('events-grid');
const seatsGrid = document.getElementById('seats-grid');
const bookingInterface = document.getElementById('booking-interface');
const eventsList = document.getElementById('events-list');
const bookButton = document.getElementById('book-button');
const bookingActions = document.getElementById('booking-actions');
const createEventModal = document.getElementById('create-event-modal');
const createEventForm = document.getElementById('create-event-form');
const editEventModal = document.getElementById('edit-event-modal');
const editEventForm = document.getElementById('edit-event-form');

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        parseToken(token);
        showApp();
    } else {
        showAuth();
    }
});

function parseToken(t) {
    try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        currentUser = payload.sub;
        currentRole = payload.role || 'USER';
        currentUserId = payload.userId; // Extract User ID
    } catch (e) {
        console.error("Invalid token", e);
        logout();
    }
}

// Auth Parsers
let isLogin = true;
switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    document.getElementById('auth-title').textContent = isLogin ? 'Welcome Back' : 'Create Account';
    document.getElementById('auth-btn').textContent = isLogin ? 'Sign In' : 'Register';
    switchLink.textContent = isLogin ? 'Register' : 'Sign In';
    document.querySelector('.switch-auth').childNodes[0].textContent = isLogin ? "Don't have an account? " : "Already have an account? ";
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const endpoint = isLogin ? '/auth/login' : '/auth/register';

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email: `${username}@test.com` })
        });

        if (!res.ok) throw new Error(await res.text());

        if (isLogin) {
            token = await res.text();
            localStorage.setItem('token', token);
            parseToken(token);
            showApp();
        } else {
            showToast('Registration successful! Please login.');
            isLogin = true;
            switchLink.click();
        }
    } catch (err) {
        showToast(err.message, true);
    }
});

function logout() {
    localStorage.removeItem('token');
    token = null;
    currentRole = null;
    currentUser = null;
    currentUserId = null;
    showAuth();
}

logoutBtn.addEventListener('click', logout);

function showAuth() {
    authScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
}

function showApp() {
    authScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');

    document.getElementById('user-greeting').textContent = `Hello, ${currentUser}`;
    document.getElementById('user-role-badge').textContent = currentRole;

    // Setup Nav & Views based on Role
    setupRoleUI();
}

function setupRoleUI() {
    const nav = document.getElementById('main-nav');
    nav.innerHTML = ''; // Clear nav

    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

    if (currentRole === 'ADMIN') {
        // Admin Nav
        nav.innerHTML = `
            <button class="tab active" onclick="switchTab('admin-dashboard')">Dashboard</button>
        `;
        document.getElementById('admin-dashboard-view').classList.remove('hidden');
        initChart();
        loadAdminEvents();
    } else {
        // User Nav
        nav.innerHTML = `
            <button class="tab active" onclick="switchTab('user-events')">Events</button>
            <button class="tab" onclick="switchTab('user-bookings')">My Bookings</button>
        `;
        document.getElementById('user-events-view').classList.remove('hidden');
        loadEvents();
    }
}

window.switchTab = (target) => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${target}-view`).classList.remove('hidden');

    if (target === 'user-bookings') loadUserBookings();
    if (target === 'admin-dashboard') loadAdminEvents();
    if (target === 'user-events') loadEvents();
};

// --- ADMIN FEATURES ---
async function loadAdminEvents() {
    try {
        const res = await fetch(`${API_BASE}/events`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const events = await res.json();
        const tbody = document.querySelector('#admin-events-table tbody');

        tbody.innerHTML = events.map(e => `
            <tr>
                <td>#${e.id}</td>
                <td>${e.name}</td>
                <td>${new Date(e.eventDate).toLocaleDateString()}</td>
                <td>${e.venueName}</td>
                <td><button class="btn-secondary" onclick="openEditEventModal(${e.id}, '${e.name}', '${e.venueName}', '${e.eventDate}')" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">Edit</button></td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

async function loadUserBookings() {
    if (!currentUserId) return;
    try {
        const res = await fetch(`${API_BASE}/bookings?userId=${currentUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const bookings = await res.json();
        const tbody = document.querySelector('#user-bookings-table tbody');

        tbody.innerHTML = bookings.map(b => `
            <tr>
                <td>#${b.id}</td>
                <td>${b.seat.event ? b.seat.event.name : 'Unknown Event'}</td>
                <td>${b.seat.seatNumber}</td>
                <td>${new Date(b.bookingTime).toLocaleDateString()}</td>
                <td><span style="color: var(--success)">${b.status}</span></td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

function initChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    if (salesChart) salesChart.destroy();

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Ticket Sales ($)',
                data: [1200, 1900, 3000, 5000, 2000, 3000, 4500],
                borderColor: '#6366f1',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

window.showCreateEventModal = () => createEventModal.classList.remove('hidden');
window.hideCreateEventModal = () => createEventModal.classList.add('hidden');
window.hideEditEventModal = () => editEventModal.classList.add('hidden');

window.openEditEventModal = (id, name, venue, date) => {
    document.getElementById('edit-event-id').value = id;
    document.getElementById('edit-event-name').value = name;
    document.getElementById('edit-event-venue').value = venue;

    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    document.getElementById('edit-event-date').value = d.toISOString().slice(0, 16);

    editEventModal.classList.remove('hidden');
};

createEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('new-event-name').value,
        venueName: document.getElementById('new-event-venue').value,
        eventDate: document.getElementById('new-event-date').value,
        totalSeats: parseInt(document.getElementById('new-event-seats').value),
        description: "Exclusive Event"
    };

    try {
        const res = await fetch(`${API_BASE}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error(await res.text());

        showToast('Event Created Successfully! 🎉');
        hideCreateEventModal();
    } catch (err) {
        showToast(err.message, true);
    }
});

editEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-event-id').value;
    const data = {
        name: document.getElementById('edit-event-name').value,
        venueName: document.getElementById('edit-event-venue').value,
        eventDate: document.getElementById('edit-event-date').value,
        totalSeats: 0,
        description: "Updated Event"
    };

    try {
        const res = await fetch(`${API_BASE}/events/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error(await res.text());

        showToast('Event Updated Successfully! 📝');
        hideEditEventModal();
        loadAdminEvents();
    } catch (err) {
        showToast(err.message, true);
    }
});

// --- USER FEATURES ---
async function loadEvents() {
    try {
        const res = await fetch(`${API_BASE}/events`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const events = await res.json();

        eventsGrid.innerHTML = events.map(event => `
            <div class="event-card" onclick="openEvent(${event.id}, '${event.name}', '${event.venueName}')">
                <span class="event-date">${new Date(event.eventDate).toLocaleDateString()}</span>
                <h3 class="event-title">${event.name}</h3>
                <p class="event-venue">📍 ${event.venueName}</p>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

window.openEvent = async (id, name, venue) => {
    currentEventId = id;
    document.getElementById('selected-event-name').textContent = name;
    document.getElementById('selected-event-venue').textContent = venue;

    eventsList.classList.add('hidden');
    bookingInterface.classList.remove('hidden');
    loadSeats(id);
};

document.getElementById('back-button').addEventListener('click', () => {
    bookingInterface.classList.add('hidden');
    eventsList.classList.remove('hidden');
    bookingActions.classList.add('hidden');
});

async function loadSeats(eventId) {
    seatsGrid.innerHTML = '<div class="loading-spinner"></div>';
    try {
        const res = await fetch(`${API_BASE}/events/${eventId}/seats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const seats = await res.json();

        seatsGrid.innerHTML = seats.map(seat => `
            <div class="seat ${seat.status.toLowerCase()} ${selectedSeatId === seat.id ? 'selected' : ''}" 
                 onclick="selectSeat(${seat.id}, '${seat.seatNumber}', ${seat.price}, '${seat.status}')">
                ${seat.seatNumber}
            </div>
        `).join('');
    } catch (err) {
        showToast('Failed to load seats', true);
    }
}

window.selectSeat = (id, number, price, status) => {
    if (status !== 'AVAILABLE') return;
    if (selectedSeatId) document.querySelector(`.seat.selected`)?.classList.remove('selected');

    selectedSeatId = id;
    event.target.classList.add('selected');

    document.getElementById('selected-seat-number').textContent = number;
    document.getElementById('selected-seat-price').textContent = `$${price}`;
    bookingActions.classList.remove('hidden');
};

bookButton.addEventListener('click', async () => {
    if (!selectedSeatId) return;
    bookButton.textContent = 'Processing Payment...';

    await new Promise(r => setTimeout(r, 1500));

    try {
        if (!currentUserId) throw new Error("User session invalid. Please relogin.");

        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: currentUserId, seatId: selectedSeatId })
        });

        if (!res.ok) throw new Error(await res.text());

        showToast('Payment Successful! Ticket Booked. 🎟️');
        loadSeats(currentEventId);
        bookingActions.classList.add('hidden');
        selectedSeatId = null;

    } catch (err) {
        showToast(err.message || 'Booking Failed', true);
    } finally {
        bookButton.textContent = 'Pay & Book';
    }
});

function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
