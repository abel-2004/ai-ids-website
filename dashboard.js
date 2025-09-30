// This one JS file handles logic for both login.html and dashboard.html

document.addEventListener('DOMContentLoaded', () => {
    // --- LOGIN PAGE LOGIC ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');

            // Hardcoded login check
            if (username === 'admin' && password === 'admin') {
                // Use sessionStorage to keep the user logged in for the session
                sessionStorage.setItem('loggedIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                errorMessage.textContent = 'Invalid username or password.';
            }
        });
    }

    // --- DASHBOARD PAGE LOGIC ---
    // Check if we are on the dashboard page
    if (document.getElementById('protocolPieChart')) {
        // Protect the page: if not logged in, redirect to login
        if (sessionStorage.getItem('loggedIn') !== 'true') {
            window.location.href = 'login.html';
            return; // Stop executing the rest of the script
        }
        
        // Fetch data and render charts
        loadDashboardData();

        // Handle logout
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('loggedIn');
            window.location.href = 'login.html';
        });
    }
});

async function loadDashboardData() {
    try {
        const response = await fetch('alerts.json');
        if (!response.ok) throw new Error('Network response was not ok.');
        const alerts = await response.json();
        
        // Process data for charts
        const protocolData = processProtocolData(alerts);
        const threatLevelData = processThreatLevelData(alerts);
        const timeData = processTimeData(alerts);

        // Render charts
        renderPieChart(protocolData);
        renderBarChart(threatLevelData);
        renderLineChart(timeData);
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// --- Data Processing Functions ---
function processProtocolData(alerts) {
    const protocolCounts = {};
    alerts.forEach(alert => {
        protocolCounts[alert.protocol] = (protocolCounts[alert.protocol] || 0) + alert.count;
    });
    return {
        labels: Object.keys(protocolCounts),
        data: Object.values(protocolCounts)
    };
}

function processThreatLevelData(alerts) {
    const threatCounts = { Low: 0, Medium: 0, High: 0 };
    alerts.forEach(alert => {
        if (threatCounts[alert.threat] !== undefined) {
            threatCounts[alert.threat] += 1; // Count occurrences of each threat level
        }
    });
    return {
        labels: Object.keys(threatCounts),
        data: Object.values(threatCounts)
    };
}

function processTimeData(alerts) {
    // Sort alerts by timestamp
    alerts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return {
        labels: alerts.map(a => new Date(a.timestamp).toLocaleTimeString()),
        data: alerts.map(a => a.count)
    };
}

// --- Chart Rendering Functions ---
function renderPieChart(protocolData) {
    const ctx = document.getElementById('protocolPieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: protocolData.labels,
            datasets: [{
                label: 'Traffic by Protocol',
                data: protocolData.data,
                backgroundColor: ['#007BFF', '#FFC107', '#28A745', '#6F42C1']
            }]
        }
    });
}

function renderBarChart(threatLevelData) {
    const ctx = document.getElementById('threatBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: threatLevelData.labels,
            datasets: [{
                label: 'Alerts by Threat Level',
                data: threatLevelData.data,
                backgroundColor: ['#28A745', '#FFC107', '#DC3545']
            }]
        },
        options: { indexAxis: 'y' }
    });
}

function renderLineChart(timeData) {
    const ctx = document.getElementById('timeLineChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeData.labels,
            datasets: [{
                label: 'Alert Volume Over Time',
                data: timeData.data,
                borderColor: '#007BFF',
                tension: 0.1,
                fill: false
            }]
        }
    });
}