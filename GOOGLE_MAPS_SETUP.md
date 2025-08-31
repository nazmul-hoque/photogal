# 🗺️ Google Maps Integration Setup

This guide will help you set up Google Maps integration for the enhanced location features in PhotoGal.

## 🚀 **Features Added:**

1. **Interactive Photo Maps** - View photo locations on Google Maps
2. **Travel Timeline** - Chronological journey visualization
3. **Location Discovery** - Group photos by proximity
4. **Enhanced PhotoModal** - Maps below photos when viewing

## 📋 **Prerequisites:**

- Google Cloud Platform account
- Billing enabled on your Google Cloud project
- Google Maps JavaScript API enabled

## 🔑 **Step 1: Get Google Maps API Key**

1. **Go to Google Cloud Console:**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create or Select Project:**
   - Create a new project or select existing one
   - Enable billing for the project

3. **Enable APIs:**
   - Go to "APIs & Services" > "Library"
   - Search for and enable these APIs:
     - **Google Maps JavaScript API**
     - **Geocoding API** (for address to coordinates)
     - **Places API** (for location details)

4. **Create API Key:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your new API key

5. **Restrict API Key (Recommended):**
   - Click on your API key
   - Under "Application restrictions" select "HTTP referrers"
   - Add your domain (e.g., `localhost:3000/*` for development)
   - Under "API restrictions" select the APIs you enabled above

## ⚙️ **Step 2: Configure Environment Variables**

1. **Create `.env` file in your project root:**
   ```bash
   touch .env
   ```

2. **Add your API key:**
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

3. **Restart your development server:**
   ```bash
   npm start
   # or
   pnpm start
   ```

## 🎯 **Step 3: Test the Integration**

1. **Open PhotoGal in your browser**
2. **Navigate to "Places" section** - You should see:
   - Location Discovery component
   - Travel Timeline component
3. **Click on any photo** - In the modal, you should see:
   - "Show Map" button in the Location section
   - Interactive map below the photo when clicked

## 🔧 **Advanced Configuration**

### **Custom Map Styling:**
Edit `src/components/ui/GoogleMap.jsx` to customize:
- Map colors and themes
- Marker styles
- Info window content
- Map controls

### **Geocoding Service:**
Currently using mock coordinates. To enable real geocoding:
1. Uncomment the geocoding code in `src/services/locationService.js`
2. Ensure Geocoding API is enabled
3. Test with real location strings

### **Location Clustering:**
Adjust clustering radius in `LocationDiscovery.jsx`:
```javascript
const [filterRadius, setFilterRadius] = useState(5); // 5km default
```

## 🚨 **Troubleshooting**

### **Map Not Loading:**
- Check browser console for errors
- Verify API key is correct
- Ensure billing is enabled
- Check API restrictions on your key

### **"Failed to load map" Error:**
- Verify Google Maps JavaScript API is enabled
- Check network connectivity
- Ensure API key has proper restrictions

### **Coordinates Not Showing:**
- Check that photos have `coordinates` property
- Verify location service is working
- Check browser console for errors

## 💰 **Cost Considerations**

- **Google Maps JavaScript API**: $7 per 1000 map loads
- **Geocoding API**: $5 per 1000 requests
- **Places API**: $17 per 1000 requests

**Free Tier**: $200 monthly credit (approximately 28,500 map loads)

## 🔒 **Security Best Practices**

1. **Restrict API Key:**
   - Limit to specific domains
   - Enable only necessary APIs
   - Set up usage quotas

2. **Monitor Usage:**
   - Set up billing alerts
   - Monitor API usage in Google Cloud Console
   - Set daily quotas if needed

3. **Environment Variables:**
   - Never commit API keys to version control
   - Use `.env` files for local development
   - Use secure environment variables in production

## 🎉 **You're All Set!**

Once configured, you'll have:
- ✅ Interactive maps in photo modals
- ✅ Travel timeline visualization
- ✅ Location-based photo discovery
- ✅ Proximity-based photo clustering
- ✅ Beautiful location-aware interface

Your PhotoGal app now rivals professional photo applications with world-class location features!

## 📚 **Additional Resources**

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Pricing](https://cloud.google.com/maps-platform/pricing)
- [Best Practices](https://developers.google.com/maps/documentation/javascript/best-practices)
