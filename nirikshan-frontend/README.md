# NIRIKSHAN Frontend

This is the React frontend application for the NIRIKSHAN Construction Compliance Monitoring System.

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Leaflet** - Maps integration
- **Lucide React** - Icons

## 📦 Installation

```bash
npm install
```

## 🏃 Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔨 Build

```bash
npm run build
```

Build artifacts will be in the `dist/` directory.

## 🧪 Lint

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   └── ui/          # Base UI components (Card, Button, etc.)
├── pages/           # Page components
├── services/        # API services
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── i18n/            # Internationalization
└── layouts/         # Layout components
```

## 🔗 Backend Integration

The frontend connects to the NIRIKSHAN backend API. Configure the API URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=false
```

## 🌐 Features

- **Multi-language Support**: Hindi and English
- **Role-based UI**: Different interfaces for different user roles
- **Real-time Updates**: Live dashboard statistics
- **ML Analysis Integration**: AI-powered inspection analysis
- **Geospatial Features**: Interactive maps for inspection locations
- **Responsive Design**: Works on desktop and mobile devices

## 📱 Pages

- **Login**: User authentication
- **Dashboard**: Role-specific dashboards
- **Inspections**: Inspection management
- **Complaints**: Complaint handling
- **Evidence**: Evidence upload and management
- **Analysis**: ML-powered analysis results

## 🔐 Authentication

Uses JWT tokens for authentication. Tokens are stored in memory and sent with API requests.

## 🎨 Styling

Uses Tailwind CSS for styling. Custom configurations in `tailwind.config.js`.

## 🌍 Internationalization

Supports multiple languages through React Context. Translations in `src/i18n/translations.ts`.

## 📝 Environment Variables

- `VITE_API_BASE_URL`: Backend API URL
- `VITE_USE_MOCK_API`: Use mock data for development (true/false)

## 🤝 Contributing

Please follow the main project's contribution guidelines.
