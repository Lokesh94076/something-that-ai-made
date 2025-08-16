// Simple authentication - 2 accounts only
const DEMO_USERS = {
    "me": { password: "123", role: "admin", username: "me" },
    "123": { password: "123", role: "user", username: "123" }
};

let currentUser = null;
let businessData = {
    date: new Date().toISOString().split('T')[0],
    selling: {
        UP: 1200,
        DOWN: 900, 
        THELA: 600,
        ONLINE: 800
    },
    totalExpenses: 500,
    cashInDrawer: 2500,
    settings: { includeThelaSales: false }
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

function formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Authentication
function authenticateUser(username, password) {
    const user = DEMO_USERS[username];
    return (user && user.password === password) ? user : null;
}

// Calculate totals automatically
function calculateTotals() {
    let totalSales = businessData.selling.UP + businessData.selling.DOWN + businessData.selling.ONLINE;
    
    // Add THELA only if toggle is ON
    if (businessData.settings.includeThelaSales) {
        totalSales += businessData.selling.THELA;
    }
    
    const netProfit = totalSales - businessData.totalExpenses;
    
    return { totalSales, netProfit };
}

// Save to historical database
function saveToHistory() {
    const totals = calculateTotals();
    const historyEntry = {
        id: Date.now(),
        date: businessData.date,
        timestamp: new Date().toISOString(),
        updatedBy: currentUser ? currentUser.username : 'system',
        data: {
            selling: { ...businessData.selling },
            totalExpenses: businessData.totalExpenses,
            cashInDrawer: businessData.cashInDrawer,
            totalSales: totals.totalSales,
            netProfit: totals.netProfit,
            thelaIncluded: businessData.settings.includeThelaSales
        }
    };
    
    // Add to history array
    historicalData.unshift(historyEntry); // Add to beginning for newest first
    
    // Keep only last 100 records to prevent storage overflow
    if (historicalData.length > 100) {
        historicalData = historicalData.slice(0, 100);
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('vegBusinessHistory', JSON.stringify(historicalData));
        console.log('Data saved to history database');
        
        // Show success message
        showNotification('Data saved successfully!', 'success');
    } catch (e) {
        console.warn('Could not save to history database:', e);
        showNotification('Warning: Could not save to database', 'warning');
    }
}

// Load historical data
function loadHistoricalData() {
    try {
        const saved = localStorage.getItem('vegBusinessHistory');
        if (saved) {
            historicalData = JSON.parse(saved);
            console.log(`Loaded ${historicalData.length} historical records`);
        }
    } catch (e) {
        console.warn('Could not load historical data:', e);
        historicalData = [];
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Update Dashboard Display
function updateDashboard() {
    // Update date
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.textContent = formatDate(businessData.date);
    
    // Update individual location sales
    document.getElementById('up-sale').textContent = formatCurrency(businessData.selling.UP);
    document.getElementById('down-sale').textContent = formatCurrency(businessData.selling.DOWN);
    document.getElementById('thela-sale').textContent = formatCurrency(businessData.selling.THELA);
    document.getElementById('online-sale').textContent = formatCurrency(businessData.selling.ONLINE);
    
    // Update expenses and cash
    document.getElementById('total-expenses-display').textContent = formatCurrency(businessData.totalExpenses);
    document.getElementById('cash-drawer-display').textContent = formatCurrency(businessData.cashInDrawer);
    
    // Calculate and display totals
    const totals = calculateTotals();
    document.getElementById('total-sales').textContent = formatCurrency(totals.totalSales);
    document.getElementById('net-profit').textContent = formatCurrency(totals.netProfit);
    
    // Update THELA toggle
    const thelaToggle = document.getElementById('thela-toggle');
    if (thelaToggle) thelaToggle.checked = businessData.settings.includeThelaSales;
    
    // Update admin form values
    if (currentUser && currentUser.role === 'admin') {
        document.getElementById('up-input').value = businessData.selling.UP;
        document.getElementById('down-input').value = businessData.selling.DOWN;
        document.getElementById('thela-input').value = businessData.selling.THELA;
        document.getElementById('online-input').value = businessData.selling.ONLINE;
        document.getElementById('expenses-input').value = businessData.totalExpenses;
        document.getElementById('drawer-input').value = businessData.cashInDrawer;
    }
    
    // Update history display
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    const historyContainer = document.getElementById('history-list');
    if (!historyContainer) return;
    
    if (historicalData.length === 0) {
        historyContainer.innerHTML = '<div class="no-history">No historical data available</div>';
        return;
    }
    
    // Show last 10 records
    const recentRecords = historicalData.slice(0, 10);
    historyContainer.innerHTML = recentRecords.map(record => `
        <div class="history-item">
            <div class="history-header">
                <span class="history-date">${formatDate(record.date)}</span>
                <span class="history-time">${formatDateTime(record.timestamp)}</span>
                <span class="history-user">by ${record.updatedBy}</span>
            </div>
            <div class="history-data">
                <div class="history-row">
                    <span>Sales:</span>
                    <span>UP: ${formatCurrency(record.data.selling.UP)} | DOWN: ${formatCurrency(record.data.selling.DOWN)} | THELA: ${formatCurrency(record.data.selling.THELA)} | ONLINE: ${formatCurrency(record.data.selling.ONLINE)}</span>
                </div>
                <div class="history-row">
                    <span>Total Sales:</span>
                    <span>${formatCurrency(record.data.totalSales)} ${record.data.thelaIncluded ? '(with THELA)' : '(without THELA)'}</span>
                </div>
                <div class="history-row">
                    <span>Expenses:</span>
                    <span>${formatCurrency(record.data.totalExpenses)}</span>
                </div>
                <div class="history-row">
                    <span>Net Profit:</span>
                    <span class="profit-value">${formatCurrency(record.data.netProfit)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Export history data
function exportHistoryData() {
    if (historicalData.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    // Convert to CSV format
    const headers = ['Date', 'Time', 'Updated By', 'UP Sales', 'DOWN Sales', 'THELA Sales', 'ONLINE Sales', 'Total Sales', 'Expenses', 'Net Profit', 'Cash in Drawer'];
    const csvData = [headers.join(',')];
    
    historicalData.forEach(record => {
        const row = [
            record.date,
            formatDateTime(record.timestamp),
            record.updatedBy,
            record.data.selling.UP,
            record.data.selling.DOWN,
            record.data.selling.THELA,
            record.data.selling.ONLINE,
            record.data.totalSales,
            record.data.totalExpenses,
            record.data.netProfit,
            record.data.cashInDrawer
        ];
        csvData.push(row.join(','));
    });
    
    // Download CSV file
    const csvContent = csvData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vegetable-business-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('History exported successfully!', 'success');
}

// Save current data (without history)
function saveCurrentData() {
    try {
        localStorage.setItem('vegBusinessData', JSON.stringify(businessData));
    } catch (e) {
        console.warn('Could not save current data');
    }
}

// Load current data
function loadCurrentData() {
    try {
        const saved = localStorage.getItem('vegBusinessData');
        if (saved) {
            businessData = { ...businessData, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('Could not load current data');
    }
}

// Initialize Page
function initializePage() {
    console.log('Initializing page...');
    
    // Load saved data
    loadCurrentData();
    loadHistoricalData();
    
    // Hide spinner immediately
    showSpinner(false);
    
    // Show login screen
    showLoginScreen();
    
    // Login form handler
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        showSpinner(true);
        
        const username = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Simulate authentication delay
        setTimeout(() => {
            const user = authenticateUser(username, password);
            
            if (user) {
                currentUser = user;
                showSpinner(false);
                showMainApp();
                
                // Update user info
                document.getElementById('user-name').textContent = user.username;
                const roleBadge = document.getElementById('user-role-badge');
                roleBadge.textContent = user.role.toUpperCase();
                roleBadge.className = `role-badge ${user.role}`;
                
                // Show/hide admin controls
                const adminElements = document.querySelectorAll('.admin-only');
                adminElements.forEach(el => {
                    el.style.display = user.role === 'admin' ? 'block' : 'none';
                });
                
                updateDashboard();
            } else {
                showSpinner(false);
                showLoginScreen();
                document.getElementById('login-error').style.display = 'block';
                document.getElementById('login-error').textContent = 'Invalid username or password!';
            }
        }, 600);
    });
    
    // Logout handler
    document.getElementById('logout-btn').addEventListener('click', function() {
        currentUser = null;
        showLoginScreen();
        loginForm.reset();
    });
    
    // Admin form handler
    const updateForm = document.getElementById('update-data-form');
    if (updateForm) {
        updateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (currentUser && currentUser.role === 'admin') {
                // Get values from form
                businessData.selling.UP = parseFloat(document.getElementById('up-input').value) || 0;
                businessData.selling.DOWN = parseFloat(document.getElementById('down-input').value) || 0;
                businessData.selling.THELA = parseFloat(document.getElementById('thela-input').value) || 0;
                businessData.selling.ONLINE = parseFloat(document.getElementById('online-input').value) || 0;
                businessData.totalExpenses = parseFloat(document.getElementById('expenses-input').value) || 0;
                businessData.cashInDrawer = parseFloat(document.getElementById('drawer-input').value) || 0;
                
                // Save to current data and history
                saveCurrentData();
                saveToHistory(); // This saves to historical database
                
                // Update display
                updateDashboard();
            }
        });
    }
    
    // THELA toggle handler
    const thelaToggle = document.getElementById('thela-toggle');
    if (thelaToggle) {
        thelaToggle.addEventListener('change', function() {
            businessData.settings.includeThelaSales = this.checked;
            saveCurrentData();
            updateDashboard();
        });
    }
    
    // Export button handler
    const exportBtn = document.getElementById('export-history');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportHistoryData);
    }
    
    console.log('Page initialized successfully');
}

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}
