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

def create_cert():
    """Create self-signed certificate"""
    print("🔒 Creating self-signed certificate...")
    
    try:
        # Create certificate
        subprocess.run([
            'openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-keyout', 'key.pem', 
            '-out', 'cert.pem', '-days', '30', '-nodes', '-subj', 
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
    if os.path.exists('dist'):
        os.chdir('dist')
        print(f"📁 Serving from: {os.getcwd()}")
    else:
        print("❌ dist folder not found!")
        return
    
    # Create server
    Handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        # Add SSL
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain('../cert.pem', '../key.pem')
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
