#!/usr/bin/env python3
"""
Simple HTTPS server for PulseAI mobile testing
This creates a self-signed certificate and serves the built React app over HTTPS
"""

import http.server
import ssl
import socketserver
import os
import subprocess
import sys
from pathlib import Path

def create_self_signed_cert():
    """Create a self-signed certificate for HTTPS"""
    print("Creating self-signed certificate...")
    
    # Create certificate using openssl
    cmd = [
        'openssl', 'req', '-x509', '-newkey', 'rsa:4096', '-keyout', 'key.pem', 
        '-out', 'cert.pem', '-days', '365', '-nodes', '-subj', 
        '/C=US/ST=State/L=City/O=Organization/CN=192.168.0.174'
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print("✅ Certificate created successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to create certificate: {e}")
        return False
    except FileNotFoundError:
        print("❌ OpenSSL not found. Please install openssl.")
        return False

def build_react_app():
    """Build the React app for production"""
    print("Building React app...")
    try:
        subprocess.run(['npm', 'run', 'build'], check=True, cwd='.')
        print("✅ React app built successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to build React app: {e}")
        return False

def start_https_server():
    """Start HTTPS server serving the built React app"""
    PORT = 3443  # Use different port for HTTPS
    
    # Change to dist directory (where Vite builds the app)
    if os.path.exists('dist'):
        os.chdir('dist')
        print(f"📁 Serving from: {os.getcwd()}")
    else:
        print("❌ dist folder not found. Make sure to build the app first.")
        return False
    
    # Create HTTPS server
    Handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        # Wrap with SSL
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain('../cert.pem', '../key.pem')
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        print(f"🚀 HTTPS Server running on:")
        print(f"   Computer: https://localhost:{PORT}")
        print(f"   Phone:    https://192.168.0.174:{PORT}")
        print(f"")
        print(f"⚠️  You'll see a security warning - click 'Advanced' → 'Proceed anyway'")
        print(f"   This is normal for self-signed certificates.")
        print(f"")
        print(f"Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    print("🔒 Setting up HTTPS for PulseAI mobile testing...")
    print("=" * 50)
    
    # Step 1: Create certificate
    if not create_self_signed_cert():
        sys.exit(1)
    
    # Step 2: Build React app
    if not build_react_app():
        sys.exit(1)
    
    # Step 3: Start HTTPS server
    start_https_server()
