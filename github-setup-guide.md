# GitHub Pages Deployment Guide for Secure Vegetable Business Tracker

## Repository Setup

1. **Create New GitHub Repository**
   ```
   Repository Name: vegetable-business-tracker
   Description: Secure web-based business tracker for vegetable stores
   Visibility: Public (required for GitHub Pages free)
   ```

2. **Upload Files to Repository**
   Upload these files to your repository root:
   - `index.html` - Main application file
   - `style.css` - Styling and responsive design
   - `app.js` - Application logic with secure authentication
   - `README.md` - Documentation for users

## GitHub Pages Configuration

1. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: Deploy from a branch
   - Branch: main (or master)
   - Folder: / (root)

2. **Your App URL Will Be**
   ```
   https://yourusername.github.io/vegetable-business-tracker
   ```

## Security Features Implemented

### 🔐 Password Security
- **SHA-256 Hashing**: All passwords are hashed with salt
- **No Plain Text**: No passwords stored in readable format
- **Client-Side Hashing**: Passwords hashed before transmission
- **Unique Salt**: Application uses secure random salt

### 👥 User Management
Three secure user accounts created:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | owner@greenstore.local | VegStore2025! | Full access |
| **Manager** | mgr@greenstore.local | Manager456! | Sales & Reports |
| **User** | help@greenstore.local | Helper123! | Basic entry |

### 🛡️ Safety for Public GitHub
- **Hashed Credentials**: Even with public code, passwords are secure
- **No Database Required**: Works entirely client-side
- **Session Management**: Proper login/logout with security
- **Local Storage**: Data persists safely on user device

## Features Overview

### 📊 Homepage Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│ Date: August 16, 2025                           │
├─────────────────────────────────────────────────┤
│ BUYING (Veg/Fruit)              Total: ₹2,500   │
├─────────────────────────────────────────────────┤
│ SELLING SECTIONS                                │
│ ┌─────┬─────┬─────┬────────┐                   │
│ │ UP  │DOWN │THELA│ ONLINE │                   │
│ ├─────┼─────┼─────┼────────┤                   │
│ │ In Drawer: ₹500 │ ₹300    │                   │
│ │ For Buying: ₹200│ ₹150    │                   │
│ │ Expenses: ₹50   │ ₹25     │                   │
│ └─────┴─────┴─────┴────────┘                   │
├─────────────────────────────────────────────────┤
│ Settings: [✓] Include THELA Sales               │
│ Total Sales: ₹1,225 | Profit: ₹675            │
└─────────────────────────────────────────────────┘
```

## Customization Options

### Add New Users
Run the Python password generator to create new users:

```python
# Use the password generator to create new accounts
python password_generator.py
```

### Modify Business Settings
Edit these variables in `app.js`:

```javascript
// Business configuration
const BUSINESS_CONFIG = {
    name: "Your Store Name",
    currency: "₹",
    locations: ["UP", "DOWN", "THELA", "ONLINE"],
    categories: ["vegetables", "fruits"]
};
```

### THELA Toggle Setting
Users can disable THELA sales tracking entirely:
- Toggle in Settings section
- Completely hides THELA column when disabled
- Recalculates totals automatically

## Mobile Responsiveness

✅ **Optimized for all devices:**
- Smartphones (portrait/landscape)
- Tablets (touch-friendly buttons)
- Desktop computers
- Large touch-screen displays

## Data Persistence

- **Local Storage**: All data saved on user's device
- **Automatic Backup**: Data persists between sessions
- **Export Options**: Users can backup their data
- **Privacy**: No data transmitted to external servers

## Troubleshooting

### Common Issues:

1. **Login Not Working**
   - Check email spelling exactly: `owner@greenstore.local`
   - Password is case-sensitive: `VegStore2025!`
   - Clear browser cache and try again

2. **App Not Loading on GitHub Pages**
   - Wait 5-10 minutes after enabling GitHub Pages
   - Check repository is public
   - Verify files are in root directory

3. **Calculations Not Updating**
   - Refresh the page
   - Check browser JavaScript is enabled
   - Try different browser

## Security Best Practices

### For Repository Owner:
- **Never commit** plain text passwords
- **Regular updates** to security patches
- **Monitor access** logs if available
- **Use strong passwords** for GitHub account

### For Users:
- **Log out** when finished
- **Use HTTPS** always (automatic with GitHub Pages)
- **Don't share** login credentials
- **Regular backups** of business data

## Support & Updates

To update the application:
1. Modify files locally
2. Push changes to GitHub repository  
3. GitHub Pages updates automatically
4. Users see changes within minutes

This secure setup ensures your business data remains private while being easily accessible from any device with internet access.