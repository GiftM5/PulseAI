# Enable HTTPS for Mobile Camera Access

## Quick HTTPS Setup

Many mobile browsers require HTTPS for camera access. Here are quick solutions:

### Option 1: Vite HTTPS (Recommended)
```bash
# Stop current dev server (Ctrl+C)
# Then restart with HTTPS:
npm run dev -- --https --host 0.0.0.0
```

### Option 2: Using mkcert (More Secure)
```bash
# Install mkcert
npm install -g mkcert

# Create certificates
mkcert create-ca
mkcert create-cert --domains localhost,192.168.0.174

# Start with certificates
npm run dev -- --https --cert ./cert.pem --key ./key.pem --host 0.0.0.0
```

### Option 3: Ngrok (Easiest)
```bash
# Install ngrok
npm install -g ngrok

# In one terminal, keep your app running:
npm run dev

# In another terminal:
ngrok http 3000

# Use the https://xxx.ngrok.io URL on your phone
```

## Testing Steps

1. **Try computer first**: `http://localhost:3000`
2. **If computer works**: Issue is HTTPS/mobile permissions
3. **If computer fails**: Issue is code/browser compatibility

## Browser-Specific Issues

### Chrome Mobile
- Usually works with HTTPS
- Check site permissions in settings

### Safari iOS
- Very strict about HTTPS
- May need to "Add to Home Screen" first
- Check Settings → Safari → Camera

### Android Browsers
- Chrome works best
- Samsung Internet sometimes has issues
- Try Firefox as backup

## Alternative: Use Computer Webcam

If mobile continues to fail, test with your computer's webcam:
1. Go to `http://localhost:3000` on computer
2. Use computer's camera to test the feature
3. Cover computer camera with finger (harder but possible)
