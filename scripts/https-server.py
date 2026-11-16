#!/usr/bin/env python3
"""
Simple HTTPS server for PulseAI mobile testing
"""

import http.server
import ssl
import socketserver
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CERT_DIR = ROOT / 'certs'
CERT_FILE = CERT_DIR / 'cert.pem'
KEY_FILE = CERT_DIR / 'key.pem'

def create_cert():
    """Create self-signed certificate"""
    print("🔒 Creating self-signed certificate...")
    
    CERT_DIR.mkdir(exist_ok=True)
    try:
        # Create certificate
        subprocess.run([
            'openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-keyout', str(KEY_FILE), 
            '-out', str(CERT_FILE), '-days', '30', '-nodes', '-subj', 
            '/C=US/ST=State/L=City/O=PulseAI/CN=192.168.0.174'
        ], check=True, capture_output=True)
        
        print("✅ Certificate created!")
        return True
    except Exception as e:
        print(f"❌ Certificate creation failed: {e}")
        return False

def start_https_server():
    """Start HTTPS server"""
    PORT = 8443
    
    # Change to dist directory
    dist_dir = ROOT / 'dist'
    if dist_dir.exists():
        os.chdir(dist_dir)
        print(f"📁 Serving from: {os.getcwd()}")
    else:
        print("❌ dist folder not found!")
        return
    
    # Create server
    Handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        # Add SSL
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(str(CERT_FILE), str(KEY_FILE))
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        print(f"""
🚀 HTTPS Server running!

📱 On your iPhone, go to:
   https://192.168.0.174:{PORT}

⚠️  You'll see a security warning:
   1. Tap "Advanced"
   2. Tap "Proceed to 192.168.0.174 (unsafe)"
   3. This is normal for self-signed certificates

✅ Camera should work now!

Press Ctrl+C to stop
""")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")

if __name__ == "__main__":
    if not create_cert():
        sys.exit(1)
    start_https_server()
