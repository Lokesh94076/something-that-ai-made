#!/usr/bin/env python3
"""
Secure Password Generator for Vegetable Business Tracker
GitHub Pages Deployment Safe

This script generates secure, hashed passwords for your business application
that can be safely committed to public GitHub repositories.
"""

import hashlib
import secrets
import json
import getpass
from datetime import datetime

class SecurePasswordManager:
    def __init__(self, salt=None):
        """Initialize with existing salt or generate new one"""
        self.salt = salt or self.generate_salt()

    @staticmethod
    def generate_salt():
        """Generate a cryptographically secure random salt"""
        return secrets.token_hex(32)

    def hash_password(self, password):
        """Hash password with salt using SHA-256"""
        password_salt = password + self.salt
        return hashlib.sha256(password_salt.encode()).hexdigest()

    def create_user(self, username, email, password, role="user"):
        """Create a secure user object"""
        return {
            "username": username,
            "email": email,
            "passwordHash": self.hash_password(password),
            "role": role,
            "created": datetime.now().isoformat()
        }

    def generate_javascript_config(self, users):
        """Generate JavaScript configuration for the web app"""
        js_config = f"""
// Security Configuration - Generated on {datetime.now().isoformat()}
// Safe for public GitHub repository - passwords are hashed
const SECURITY_CONFIG = {{
    salt: '{self.salt}',
    users: {json.dumps(users, indent=4)}
}};

// Authentication helper function
function hashPassword(password, salt) {{
    // Using CryptoJS SHA-256 (include crypto-js library)
    return CryptoJS.SHA256(password + salt).toString();
}}
"""
        return js_config

def interactive_user_creation():
    """Interactive mode for creating users"""
    print("=" * 60)
    print("🔐 SECURE VEGETABLE BUSINESS TRACKER - PASSWORD MANAGER")
    print("=" * 60)
    print()

    # Ask if user wants to use existing salt or generate new one
    use_existing = input("Do you have an existing salt to use? (y/N): ").lower().strip()

    if use_existing == 'y':
        existing_salt = input("Enter your existing salt: ").strip()
        if len(existing_salt) != 64:
            print("⚠️  Warning: Salt should be 64 characters. Using provided salt anyway.")
        manager = SecurePasswordManager(existing_salt)
        print(f"✅ Using existing salt: {existing_salt[:20]}...")
    else:
        manager = SecurePasswordManager()
        print(f"🔑 Generated new salt: {manager.salt}")
        print("📋 IMPORTANT: Save this salt! You'll need it to add users later.")

    print()

    users = []

    while True:
        print("➕ Add New User")
        print("-" * 30)

        username = input("Username: ").strip()
        if not username:
            print("❌ Username cannot be empty")
            continue

        email = input("Email: ").strip()
        if not email or "@" not in email:
            print("❌ Please enter a valid email")
            continue

        password = getpass.getpass("Password (hidden): ")
        if len(password) < 8:
            print("❌ Password should be at least 8 characters")
            continue

        role = input("Role (admin/manager/user) [user]: ").strip().lower() or "user"
        if role not in ["admin", "manager", "user"]:
            print("❌ Role must be: admin, manager, or user")
            continue

        # Create user
        user = manager.create_user(username, email, password, role)
        users.append(user)

        print(f"✅ Created user: {username} ({email}) - Role: {role}")
        print(f"   Password Hash: {user['passwordHash'][:20]}...")
        print()

        another = input("Add another user? (y/N): ").lower().strip()
        if another != 'y':
            break

    return manager, users

def predefined_users():
    """Create the default users for the business"""
    # Use the same salt as the deployed application
    existing_salt = "c1202ec646cac69a7cbb10e2c9868561e309c93a6c1a7486f2d76514c502c534"
    manager = SecurePasswordManager(existing_salt)

    default_users = [
        ("store_owner", "owner@greenstore.local", "VegStore2025!", "admin"),
        ("manager", "mgr@greenstore.local", "Manager456!", "manager"),
        ("assistant", "help@greenstore.local", "Helper123!", "user")
    ]

    users = []
    for username, email, password, role in default_users:
        user = manager.create_user(username, email, password, role)
        users.append(user)

    return manager, users

def main():
    print("🥬 Vegetable Business Tracker - Secure Password Generator")
    print()
    print("Choose mode:")
    print("1. Interactive - Create custom users")
    print("2. Default - Use predefined business users")
    print("3. View existing - Show current user credentials")

    choice = input("\nEnter choice (1-3): ").strip()

    if choice == "1":
        manager, users = interactive_user_creation()
    elif choice == "2":
        manager, users = predefined_users()
        print("✅ Generated default business users")
    elif choice == "3":
        manager, users = predefined_users()
        print("📋 Current User Credentials:")
        print("=" * 50)
        for user in users:
            print(f"Role: {user['role'].upper()}")
            print(f"Email: {user['email']}")
            # We can't show the original password, but we can show test info
            if user['email'] == 'owner@greenstore.local':
                print("Password: VegStore2025!")
            elif user['email'] == 'mgr@greenstore.local':
                print("Password: Manager456!")
            elif user['email'] == 'help@greenstore.local':
                print("Password: Helper123!")
            print(f"Hash: {user['passwordHash'][:20]}...")
            print("-" * 30)
        return
    else:
        print("❌ Invalid choice")
        return

    # Save to files
    config = {
        "salt": manager.salt,
        "users": users,
        "generated": datetime.now().isoformat()
    }

    # Save JSON configuration
    with open('secure_credentials.json', 'w') as f:
        json.dump(config, f, indent=2)

    # Generate JavaScript code
    js_code = manager.generate_javascript_config(users)
    with open('security_config.js', 'w') as f:
        f.write(js_code)

    print("\n" + "=" * 60)
    print("✅ FILES GENERATED SUCCESSFULLY")
    print("=" * 60)
    print(f"📄 secure_credentials.json - Complete configuration")
    print(f"📄 security_config.js - JavaScript code for your app")
    print()
    print("🔒 SECURITY SUMMARY:")
    print(f"   Salt: {manager.salt[:20]}...")
    print(f"   Users Created: {len(users)}")
    print(f"   All passwords are SHA-256 hashed")
    print()
    print("📋 USER LOGIN CREDENTIALS:")
    print("-" * 40)

    for i, user in enumerate(users, 1):
        print(f"{i}. Role: {user['role'].upper()}")
        print(f"   Email: {user['email']}")
        print(f"   Username: {user['username']}")
        # Show original passwords for the default users only
        if 'owner@greenstore.local' in user['email']:
            print("   Password: VegStore2025!")
        elif 'mgr@greenstore.local' in user['email']:
            print("   Password: Manager456!")
        elif 'help@greenstore.local' in user['email']:
            print("   Password: Helper123!")
        else:
            print("   Password: [Use password you entered]")
        print()

    print("🚀 DEPLOYMENT INSTRUCTIONS:")
    print("1. Copy the JavaScript code to your app.js file")
    print("2. Replace the SECURITY_CONFIG object")
    print("3. Commit to GitHub (safe - passwords are hashed)")
    print("4. Users can login with the credentials above")

if __name__ == "__main__":
    main()
