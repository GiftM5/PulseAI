# 📱 PulseAI Mobile Setup Guide

## 🚀 Access Your App from Phone

Your PulseAI app is now accessible from your phone on your local network:

### 📍 **Access URLs:**
- **Frontend (React App)**: `http://192.168.0.174:3000`
- **Backend API**: `http://192.168.0.174:8000`
- **API Documentation**: `http://192.168.0.174:8000/docs`

### 📱 **Steps to Access from Phone:**

1. **Connect to Same WiFi**: Make sure your phone is on the same WiFi network as your computer
2. **Open Browser**: Use Chrome, Safari, or any modern browser on your phone
3. **Navigate**: Go to `http://192.168.0.174:3000`
4. **Enjoy**: Your PulseAI app will load with full functionality!

## 💓 **Real Heart Rate Detection**

The app now includes **camera-based heart rate detection** that works on your phone:

### 🎯 **How It Works:**
1. **Photoplethysmography (PPG)**: Uses your phone's camera and flashlight
2. **Blood Flow Detection**: Detects subtle color changes in your fingertip
3. **Signal Processing**: Analyzes the light absorption patterns
4. **Heart Rate Calculation**: Converts the signal to beats per minute

### 📋 **Instructions for Use:**

1. **Start Measurement**: Tap "Start Measurement" in the Camera Heart Rate section
2. **Position Finger**: Cover both the camera lens AND flashlight with your fingertip
3. **Stay Still**: Keep your finger steady for 30 seconds
4. **Wait for Results**: The app will analyze and display your heart rate

### ✅ **Tips for Best Results:**

- **Good Coverage**: Completely cover the camera and flashlight
- **Steady Hand**: Avoid movement during measurement
- **Proper Pressure**: Press gently but firmly
- **Good Lighting**: Use in well-lit area or rely on flashlight
- **Clean Lens**: Make sure camera lens is clean
- **Warm Hands**: Cold hands may give poor readings

### 🔧 **Troubleshooting:**

**"Unable to detect heart rate":**
- Ensure finger covers both camera and flashlight
- Try different finger (index finger usually works best)
- Check if flashlight is working
- Make sure you're not moving during measurement

**Low quality readings:**
- Improve finger placement
- Reduce ambient light
- Keep phone more stable
- Try measuring when relaxed

## 🌐 **Network Setup Details**

### 🔧 **Current Configuration:**
- **Your Computer IP**: `192.168.0.174`
- **Frontend Port**: `3000`
- **Backend Port**: `8000`
- **CORS Enabled**: For cross-origin requests from mobile

### 🔒 **Security Notes:**
- This setup is for local network testing only
- For production, you'd need proper SSL certificates
- Consider firewall settings if having connection issues

### 📊 **Features Available on Mobile:**

✅ **Full Responsive Design**
✅ **Real-time Vital Signs Dashboard**
✅ **Interactive Charts with Touch Support**
✅ **Camera-based Heart Rate Detection**
✅ **AI Risk Assessment Alerts**
✅ **Smooth Animations and Transitions**
✅ **Dark Theme Optimized for Mobile**

## 🚀 **Advanced: Deploy to Internet**

To make your app accessible from anywhere (not just local network):

### Option 1: Ngrok (Quick & Easy)
```bash
# Install ngrok
npm install -g ngrok

# Expose frontend
ngrok http 3000

# Expose backend (in another terminal)
ngrok http 8000
```

### Option 2: Cloud Deployment
- **Frontend**: Deploy to Vercel, Netlify, or GitHub Pages
- **Backend**: Deploy to Heroku, Railway, or DigitalOcean
- **Database**: Add PostgreSQL or MongoDB for user data

## 🎯 **Next Steps**

1. **Test on Phone**: Access the app and try the camera heart rate feature
2. **Calibrate**: Compare with a real pulse oximeter for accuracy
3. **Enhance**: Add more vital signs (SpO2 via camera is also possible)
4. **Share**: Show friends and family your AI health monitoring app!

## 📞 **Support**

If you encounter issues:
1. Check that both servers are running
2. Verify you're on the same WiFi network
3. Try refreshing the browser
4. Check browser console for errors
5. Ensure camera permissions are granted

---

**🎉 Congratulations!** You now have a fully functional, mobile-accessible health monitoring app with real heart rate detection capabilities!
