# Smart Photo Organizer

A modern, AI-inspired photo gallery and organization app built with React and Tailwind CSS. Features a clean, minimalist design with pastel colors, resembling Google Photos but with a unique aesthetic.

## Features

- **Smart Search**: Filter photos by tags, date, or location
- **Grid Gallery**: Responsive thumbnail gallery with hover effects
- **Auto-Generated Tags**: Each photo displays AI-detected tags (simulated)
- **Organized Sidebar**: Sections for Recently Added, Favorites, People, Places, and Auto Albums
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Upload Functionality**: Floating upload button for adding new photos
- **Minimalist Design**: Pastel color theme with soft shadows and smooth animations

## Tech Stack

- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **PostCSS**: CSS processing with autoprefixer

## Design Features

- **Color Scheme**: Minimalist pastel colors (primary, secondary, accent)
- **Typography**: Inter font for clean, modern text
- **Shadows**: Soft shadow system for depth
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Google Cloud Platform account with Vision API enabled (for backend)

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# The .env file is already created with default values
# Update REACT_APP_API_URL if your backend runs on a different port
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Backend Setup (Required for Upload Functionality)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Set up Google Cloud credentials:
   - Create a service account in Google Cloud Console
   - Download the JSON key file
   - Set the environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/key.json"
   ```

4. Configure backend environment:
```bash
cp .env.example .env
# Edit .env with your Google Cloud settings
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001` by default.

### Full Development Setup

To run both frontend and backend simultaneously:

1. Terminal 1 - Start backend:
```bash
cd backend && npm run dev
```

2. Terminal 2 - Start frontend:
```bash
npm start
```

### Building for Production

Frontend:
```bash
npm run build
```

Backend:
```bash
cd backend && npm start
```

## Project Structure

```
src/
├── components/
│   ├── PhotoGrid.jsx          # Photo gallery grid component
│   ├── Sidebar.jsx            # Navigation sidebar component
│   ├── SearchBar.jsx          # Search and filter bar component
│   ├── TagBadge.jsx           # Individual tag component
│   └── UploadButton.jsx       # Floating upload button component
├── pages/
│   └── Home.jsx               # Main home page component
├── App.jsx                    # Root application component
├── index.js                   # React DOM entry point
└── index.css                  # Global styles and Tailwind imports
```

## Component Architecture

### Core Components

- **`Home.jsx`**: Main page container that orchestrates all components and manages global state
- **`PhotoGrid.jsx`**: Displays the responsive photo gallery with individual photo cards
- **`Sidebar.jsx`**: Navigation sidebar with sections and mobile overlay support
- **`SearchBar.jsx`**: Search input with filter buttons for photos
- **`TagBadge.jsx`**: Reusable colored tag component with dynamic styling
- **`UploadButton.jsx`**: Floating action button for photo uploads

### Component Responsibilities

- **State Management**: Centralized in `Home.jsx` component
- **Photo Filtering**: Logic handled in `Home.jsx` with `useMemo` optimization
- **Responsive Design**: Each component handles its own responsive behavior
- **Event Handling**: Props-based event system for component communication

## Customization

### Color Theme
Modify the color palette in `tailwind.config.js`:

```javascript
colors: {
  primary: { /* Orange tones */ },
  secondary: { /* Blue tones */ },
  accent: { /* Purple tones */ },
  neutral: { /* Gray tones */ }
}
```

### Mock Data
Currently uses mock data in `SmartPhotoOrganizer.js`. Replace with your API integration:

```javascript
const mockPhotos = [
  // Replace with API call
];
```

## Future Enhancements

- Real AI tag detection integration
- Cloud storage integration
- Advanced filtering options
- Photo editing capabilities
- Sharing functionality
- Bulk operations
- Face recognition for people tagging
- Geo-location mapping

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
