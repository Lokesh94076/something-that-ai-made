// Hidden login credentials (secret)
const LOGIN_CREDENTIALS = {
    "admin": "veg123",
    "owner": "business456",
    "123": "123"  // Read-only viewer account
};

// User roles
const USER_ROLES = {
    "admin": "admin",
    "owner": "admin", 
    "123": "viewer"  // Username 123 is viewer role
};

let currentUser = null;

// Business data structure
let businessData = {
    date: new Date().toISOString().split('T')[0],
    buying: {
        veg: 0,
        fruit: 0,
        total: 0
    },
    locations: {
        UP: { inDrawer: 0, forBuying: 0, expenses: 0 },
        DOWN: { inDrawer: 0, forBuying: 0, expenses: 0 },
        THELA: { inDrawer: 0, forBuying: 0, expenses: 0 },
        ONLINE: { total: 0 }
    },
    settings: {
        includeThelaSales: false
    }
};

// Historical data storage
let historicalData = [];

// Helper Functions
function showSpinner(show = true) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

function hideAllScreens() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-error').style.display = 'none';
}

function showLoginScreen() {
    hideAllScreens();
    document.getElementById('login-screen').style.display = 'flex';
}

function showMainApp() {
    hideAllScreens();
    document.getElementById('main-app').style.display = 'block';
}

function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Authentication
function authenticateUser(username, password) {
    if (LOGIN_CREDENTIALS[username] === password) {
        return {
            username: username,
            role: USER_ROLES[username]
        };
    }
    return null;
}

// Check if current user is viewer
function isViewer() {
    return currentUser && currentUser.role === 'viewer';
}

// Check if current user is admin
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// Create location cards based on user role
function createLocationCards() {
    const container = document.getElementById('locations-container');
    const locations = ['UP', 'DOWN', 'THELA', 'ONLINE'];
    const icons = {
        'UP': 'fas fa-arrow-up',
        'DOWN': 'fas fa-arrow-down', 
        'THELA': 'fas fa-bicycle',
        'ONLINE': 'fas fa-globe'
    };
    
    container.innerHTML = '';
    
    locations.forEach(location => {
        const card = document.createElement('div');
        card.className = `location-card ${location.toLowerCase()}`;
        
        if (isAdmin()) {
            // Admin view with inputs
            if (location === 'ONLINE') {
                card.innerHTML = `
                    <div class="location-header">
                        <i class="${icons[location]}"></i> ${location}
                    </div>
                    <div class="location-inputs online-only">
                        <div class="input-group">
                            <label for="${location.toLowerCase()}-total">Total Online Sales (₹)</label>
                            <input type="number" id="${location.toLowerCase()}-total" step="0.01" min="0" value="0">
                        </div>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="location-header">
                        <i class="${icons[location]}"></i> ${location}
                    </div>
                    <div class="location-inputs">
                        <div class="input-group">
                            <label for="${location.toLowerCase()}-drawer">In Drawer (₹)</label>
                            <input type="number" id="${location.toLowerCase()}-drawer" step="0.01" min="0" value="0">
                        </div>
                        <div class="input-group">
                            <label for="${location.toLowerCase()}-buying">For Buying (₹)</label>
                            <input type="number" id="${location.toLowerCase()}-buying" step="0.01" min="0" value="0">
                        </div>
                        <div class="input-group">
                            <label for="${location.toLowerCase()}-expenses">Expenses (₹)</label>
                            <input type="number" id="${location.toLowerCase()}-expenses" step="0.01" min="0" value="0">
                        </div>
                    </div>
                `;
            }
        } else {
            // Viewer display mode
            if (location === 'ONLINE') {
                card.innerHTML = `
                    <div class="location-header">
                        <i class="${icons[location]}"></i> ${location}
                    </div>
                    <div class="location-values">
                        <div class="value-row">
                            <span class="value-label">Total Sales</span>
                            <span class="value-amount" id="${location.toLowerCase()}-total-display">₹0</span>
                        </div>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="location-header">
                        <i class="${icons[location]}"></i> ${location}
                    </div>
                    <div class="location-values">
                        <div class="value-row">
                            <span class="value-label">In Drawer</span>
                            <span class="value-amount" id="${location.toLowerCase()}-drawer-display">₹0</span>
                        </div>
                        <div class="value-row">
                            <span class="value-label">For Buying</span>
                            <span class="value-amount" id="${location.toLowerCase()}-buying-display">₹0</span>
                        </div>
                        <div class="value-row">
                            <span class="value-label">Expenses</span>
                            <span class="value-amount" id="${location.toLowerCase()}-expenses-display">₹0</span>
                        </div>
                    </div>
                `;
            }
        }
        
        container.appendChild(card);
    });
}

// Update UI based on user role
function updateUIForRole(role) {
    console.log('Updating UI for role:', role);
    
    const isViewerMode = (role === 'viewer');
    
    // Show/hide elements based on role
    const adminElements = document.querySelectorAll('.admin-only');
    const viewerElements = document.querySelectorAll('.viewer-only');
    
    adminElements.forEach(el => {
        el.style.display = isViewerMode ? 'none' : 'block';
    });
    
    viewerElements.forEach(el => {
        el.style.display = isViewerMode ? 'block' : 'none';
    });
    
    // Update role badge
    const roleBadge = document.getElementById('role-badge');
    if (roleBadge) {
        roleBadge.textContent = isViewerMode ? 'Viewer' : 'Admin';
        roleBadge.className = `role-badge ${isViewerMode ? 'viewer' : 'admin'}`;
    }
    
    // Create location cards based on role
    createLocationCards();
    
    // Add event listeners for admin inputs
    if (isAdmin()) {
        setTimeout(() => {
            addAdminEventListeners();
        }, 100);
    }
}

// Add event listeners for admin inputs
function addAdminEventListeners() {
    console.log('Adding admin event listeners');
    
    // Buying inputs
    const vegInput = document.getElementById('veg-input');
    const fruitInput = document.getElementById('fruit-input');
    
    if (vegInput) {
        vegInput.addEventListener('input', () => {
            console.log('Veg input changed');
            updateBuyingTotal();
            updateDisplay();
        });
    }
    
    if (fruitInput) {
        fruitInput.addEventListener('input', () => {
            console.log('Fruit input changed');
            updateBuyingTotal();
            updateDisplay();
        });
    }
    
    // Location inputs
    const locationInputs = document.querySelectorAll('input[id*="-drawer"], input[id*="-buying"], input[id*="-expenses"], input[id*="-total"]');
    locationInputs.forEach(input => {
        input.addEventListener('input', () => {
            console.log('Location input changed:', input.id);
            updateDisplay();
        });
    });
    
    // THELA toggle
    const thelaToggle = document.getElementById('thela-toggle');
    if (thelaToggle) {
        thelaToggle.addEventListener('change', () => {
            console.log('THELA toggle changed');
            updateDisplay();
        });
    }
}

// Update buying total
function updateBuyingTotal() {
    const veg = parseFloat(document.getElementById('veg-input')?.value) || 0;
    const fruit = parseFloat(document.getElementById('fruit-input')?.value) || 0;
    const total = veg + fruit;
    
    const totalInput = document.getElementById('total-buying');
    if (totalInput) {
        totalInput.value = total;
    }
    
    businessData.buying.veg = veg;
    businessData.buying.fruit = fruit;
    businessData.buying.total = total;
}

// Calculate all totals
function calculateTotals() {
    // Update buying total
    businessData.buying.total = businessData.buying.veg + businessData.buying.fruit;
    
    // Calculate total sales (drawer amounts + online)
    let totalSales = businessData.locations.UP.inDrawer + 
					businessData.locations.UP.forBuying +
					businessData.locations.DOWN.forBuying +
                    businessData.locations.DOWN.inDrawer + 
                    businessData.locations.ONLINE.total;
    
    // Add THELA only if toggle is ON
    if (businessData.settings.includeThelaSales) {
        totalSales += businessData.locations.THELA.inDrawer;
    }
    
    // Calculate total cash given (for buying)
    const totalCashGiven = businessData.locations.UP.forBuying + 
                          businessData.locations.DOWN.forBuying + 
                          businessData.locations.THELA.forBuying;
    
    // Calculate total expenses
    const totalExpenses = businessData.locations.UP.expenses + 
                          businessData.locations.DOWN.expenses + 
                          businessData.locations.THELA.expenses;
    
    // Calculate net profit
    const netProfit = totalSales - businessData.buying.total - totalExpenses;
    
    return {
        totalSales,
        totalCashGiven,
        totalExpenses,
        netProfit
    };
}

// Update display
function updateDisplay() {
    console.log('Updating display');
    
    // Update date
    document.getElementById('current-date').textContent = formatDate(businessData.date);
    
    if (isAdmin()) {
        // Collect data from inputs for admin
        collectDataFromInputs();
    }
    
    // Update viewer displays
    if (isViewer()) {
        // Buying display
        document.getElementById('veg-display').textContent = formatCurrency(businessData.buying.veg);
        document.getElementById('fruit-display').textContent = formatCurrency(businessData.buying.fruit);
        document.getElementById('total-buying-display').textContent = formatCurrency(businessData.buying.total);
        
        // Location displays
        ['UP', 'DOWN', 'THELA'].forEach(location => {
            const key = location.toLowerCase();
            document.getElementById(`${key}-drawer-display`).textContent = formatCurrency(businessData.locations[location].inDrawer);
            document.getElementById(`${key}-buying-display`).textContent = formatCurrency(businessData.locations[location].forBuying);
            document.getElementById(`${key}-expenses-display`).textContent = formatCurrency(businessData.locations[location].expenses);
        });
        
        document.getElementById('online-total-display').textContent = formatCurrency(businessData.locations.ONLINE.total);
        
        // Settings display
        const thelaStatus = document.getElementById('thela-status');
        if (thelaStatus) {
            thelaStatus.textContent = businessData.settings.includeThelaSales ? 'ON' : 'OFF';
            thelaStatus.className = `setting-status ${businessData.settings.includeThelaSales ? '' : 'off'}`;
        }
    }
    
    // Calculate and display totals
    const totals = calculateTotals();
    document.getElementById('total-sales').textContent = formatCurrency(totals.totalSales);
    document.getElementById('total-cash-given').textContent = formatCurrency(totals.totalCashGiven);
    document.getElementById('total-expenses').textContent = formatCurrency(totals.totalExpenses);
    document.getElementById('net-profit').textContent = formatCurrency(totals.netProfit);
}

// Collect data from inputs (only for admin)
function collectDataFromInputs() {
    if (isViewer()) {
        return false;
    }
    
    // Get buying data
    businessData.buying.veg = parseFloat(document.getElementById('veg-input')?.value) || 0;
    businessData.buying.fruit = parseFloat(document.getElementById('fruit-input')?.value) || 0;
    
    // Get location data
    businessData.locations.UP.inDrawer = parseFloat(document.getElementById('up-drawer')?.value) || 0;
    businessData.locations.UP.forBuying = parseFloat(document.getElementById('up-buying')?.value) || 0;
    businessData.locations.UP.expenses = parseFloat(document.getElementById('up-expenses')?.value) || 0;
    
    businessData.locations.DOWN.inDrawer = parseFloat(document.getElementById('down-drawer')?.value) || 0;
    businessData.locations.DOWN.forBuying = parseFloat(document.getElementById('down-buying')?.value) || 0;
    businessData.locations.DOWN.expenses = parseFloat(document.getElementById('down-expenses')?.value) || 0;
    
    businessData.locations.THELA.inDrawer = parseFloat(document.getElementById('thela-drawer')?.value) || 0;
    businessData.locations.THELA.forBuying = parseFloat(document.getElementById('thela-buying')?.value) || 0;
    businessData.locations.THELA.expenses = parseFloat(document.getElementById('thela-expenses')?.value) || 0;
    
    businessData.locations.ONLINE.total = parseFloat(document.getElementById('online-total')?.value) || 0;
    
    businessData.settings.includeThelaSales = document.getElementById('thela-toggle')?.checked || false;
    
    return true;
}

// Populate admin inputs
function populateAdminInputs() {
    if (isViewer()) return;
    
    // Populate buying inputs
    const vegInput = document.getElementById('veg-input');
    const fruitInput = document.getElementById('fruit-input');
    const totalBuying = document.getElementById('total-buying');
    
    if (vegInput) vegInput.value = businessData.buying.veg;
    if (fruitInput) fruitInput.value = businessData.buying.fruit;
    if (totalBuying) totalBuying.value = businessData.buying.total;
    
    // Populate location inputs
    const upDrawer = document.getElementById('up-drawer');
    const upBuying = document.getElementById('up-buying');
    const upExpenses = document.getElementById('up-expenses');
    
    if (upDrawer) upDrawer.value = businessData.locations.UP.inDrawer;
    if (upBuying) upBuying.value = businessData.locations.UP.forBuying;
    if (upExpenses) upExpenses.value = businessData.locations.UP.expenses;
    
    const downDrawer = document.getElementById('down-drawer');
    const downBuying = document.getElementById('down-buying');
    const downExpenses = document.getElementById('down-expenses');
    
    if (downDrawer) downDrawer.value = businessData.locations.DOWN.inDrawer;
    if (downBuying) downBuying.value = businessData.locations.DOWN.forBuying;
    if (downExpenses) downExpenses.value = businessData.locations.DOWN.expenses;
    
    const thelaDrawer = document.getElementById('thela-drawer');
    const thelaBuying = document.getElementById('thela-buying');
    const thelaExpenses = document.getElementById('thela-expenses');
    
    if (thelaDrawer) thelaDrawer.value = businessData.locations.THELA.inDrawer;
    if (thelaBuying) thelaBuying.value = businessData.locations.THELA.forBuying;
    if (thelaExpenses) thelaExpenses.value = businessData.locations.THELA.expenses;
    
    const onlineTotal = document.getElementById('online-total');
    if (onlineTotal) onlineTotal.value = businessData.locations.ONLINE.total;
    
    const thelaToggle = document.getElementById('thela-toggle');
    if (thelaToggle) thelaToggle.checked = businessData.settings.includeThelaSales;
}

// Save to history (only for admin)
function saveToHistory() {
    if (isViewer()) {
        showNotification('Cannot save data in viewer mode!', 'error');
        return;
    }
    
    if (!collectDataFromInputs()) return;
    
    const totals = calculateTotals();
    
    const historyEntry = {
        id: Date.now(),
        date: businessData.date,
        timestamp: new Date().toISOString(),
        data: {
            buying: { ...businessData.buying },
            locations: JSON.parse(JSON.stringify(businessData.locations)),
            totals: totals,
            settings: { ...businessData.settings }
        }
    };
    
    historicalData.unshift(historyEntry);
    
    // Keep only last 100 records
    if (historicalData.length > 100) {
        historicalData = historicalData.slice(0, 100);
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('vegBusinessData', JSON.stringify(businessData));
        localStorage.setItem('vegBusinessHistory', JSON.stringify(historicalData));
        showNotification('Data saved successfully!');
    } catch (e) {
        showNotification('Error saving data!', 'error');
    }
}

// Load data
function loadData() {
    try {
        const savedData = localStorage.getItem('vegBusinessData');
        const savedHistory = localStorage.getItem('vegBusinessHistory');
        
        if (savedData) {
            businessData = { ...businessData, ...JSON.parse(savedData) };
        }
        
        if (savedHistory) {
            historicalData = JSON.parse(savedHistory);
        }
    } catch (e) {
        console.warn('Could not load saved data');
    }
}

// Export history
function exportHistory() {
    if (isViewer()) {
        showNotification('Data export not available for viewers', 'error');
        return;
    }
    
    if (historicalData.length === 0) {
        showNotification('No data to export!', 'error');
        return;
    }
    
    const headers = [
        'Date', 'Time', 
        'Veg Buying', 'Fruit Buying', 'Total Buying',
        'UP Drawer', 'UP For Buying', 'UP Expenses',
        'DOWN Drawer', 'DOWN For Buying', 'DOWN Expenses',
        'THELA Drawer', 'THELA For Buying', 'THELA Expenses',
        'Online Total',
        'Total Sales', 'Total Cash Given', 'Total Expenses', 'Net Profit'
    ];
    
    const csvData = [headers.join(',')];
    
    historicalData.forEach(record => {
        const row = [
            record.date,
            new Date(record.timestamp).toLocaleString('en-IN'),
            record.data.buying.veg,
            record.data.buying.fruit,
            record.data.buying.total,
            record.data.locations.UP.inDrawer,
            record.data.locations.UP.forBuying,
            record.data.locations.UP.expenses,
            record.data.locations.DOWN.inDrawer,
            record.data.locations.DOWN.forBuying,
            record.data.locations.DOWN.expenses,
            record.data.locations.THELA.inDrawer,
            record.data.locations.THELA.forBuying,
            record.data.locations.THELA.expenses,
            record.data.locations.ONLINE.total,
            record.data.totals.totalSales,
            record.data.totals.totalCashGiven,
            record.data.totals.totalExpenses,
            record.data.totals.netProfit
        ];
        csvData.push(row.join(','));
    });
    
    const csvContent = csvData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `business-history-${businessData.date}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('History exported successfully!');
}

// Initialize the application
function initialize() {
    loadData();
    
    // Hide spinner and show login initially
    showSpinner(false);
    showLoginScreen();
    
    // Login form handler
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        showSpinner(true);
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        setTimeout(() => {
            const user = authenticateUser(username, password);
            if (user) {
                currentUser = user;
                console.log('User logged in:', user);
                showSpinner(false);
                showMainApp();
                updateUIForRole(user.role);
                
                // Populate inputs for admin after UI is ready
                if (isAdmin()) {
                    setTimeout(() => {
                        populateAdminInputs();
                        updateDisplay();
                    }, 200);
                } else {
                    updateDisplay();
                }
                
                showNotification(`Welcome, ${user.role}!`, 'success');
            } else {
                showSpinner(false);
                showLoginScreen();
                document.getElementById('login-error').style.display = 'block';
                document.getElementById('login-error').textContent = 'Invalid username or password!';
            }
        }, 800);
    });
    
    // Logout handler
    document.getElementById('logout-btn').addEventListener('click', function() {
        currentUser = null;
        showLoginScreen();
        document.getElementById('login-form').reset();
    });
    
    // Save button
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'save-data') {
            saveToHistory();
        }
        if (e.target && e.target.id === 'export-data') {
            exportHistory();
        }
    });
    
    console.log('Vegetable Business Tracker initialized successfully!');
}

// Start the application
document.addEventListener('DOMContentLoaded', initialize);
