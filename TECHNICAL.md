# WikiAi Technical Documentation

## Table of Contents
1. [Application Architecture](#application-architecture)
2. [Component Hierarchy](#component-hierarchy)
3. [State Management](#state-management)
4. [API Integration](#api-integration)
5. [Routing](#routing)
6. [Authentication Flow](#authentication-flow)
7. [File Management](#file-management)
8. [Search Implementation](#search-implementation)
9. [Styling System](#styling-system)
10. [Testing Strategy](#testing-strategy)
11. [Performance Considerations](#performance-considerations)
12. [Error Handling](#error-handling)
13. [Browser Compatibility](#browser-compatibility)
14. [Build Process](#build-process)
15. [Deployment](#deployment)

## Application Architecture

WikiAi follows a component-based architecture using Vue 3's Composition API. The application is structured as a Single Page Application (SPA) with client-side routing.

### Core Technologies
- **Vue 3**: Progressive JavaScript framework
- **Vite**: Next-generation frontend tooling
- **Vue Router**: Client-side routing
- **Marked.js**: Markdown processing
- **Highlight.js**: Syntax highlighting

## Component Hierarchy

### Root Component (`App.vue`)
- Manages application layout and global state
- Handles authentication state
- Renders main navigation and content area
- Manages dark/light theme

### Core Components

1. **Authentication**
   - `LoginPage.vue`: Handles user authentication
   - `user.vue`: User profile management

2. **Document Management**
   - `FileTabs.vue`: Tabbed interface for open documents
   - `FileEditModal.vue`: Document editing interface
   - `FileModalOpener.vue`: Modal for file operations
   - `SidebarFiles.vue`: File browser and navigation
   - `FileUpload.vue`: File upload functionality

3. **Search & Discovery**
   - `SearchPage.vue`: Main search interface
   - `SearchSidebar.vue`: Displays search results and filters

4. **Administration**
   - `AdminDashboard.vue`: Administrative controls
   - `ReportTable.vue`: Data reporting and analytics

5. **UI Components**
   - `AnimatedBackground.vue`: Dynamic background effects
   - `ToastNotification.vue`: User notifications
   - `QuizModal.vue`: Interactive quiz interface

## State Management

The application uses Vue's Composition API for state management with the following patterns:

### Reactive State
```javascript
// Example from App.vue
const state = reactive({
  token: localStorage.getItem('token') || null,
  darkMode: false,
  currentView: 'home',
  openedFiles: [],
  activeTab: null
});
```

### Composable Functions
Reusable logic is extracted into composable functions:
- `useFileHandling.js`: File operations
- `useSearch.js`: Search functionality
- `useAuth.js`: Authentication logic

## API Integration

The `api.js` module provides a clean interface for all backend communication:

```javascript
// Example API methods
export default {
  // Authentication
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },
  
  // File operations
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    
    return fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    }).then(handleResponse);
  }
};
```

## Routing

The application uses client-side routing with the following routes:
- `/`: Home/Dashboard
- `/login`: Authentication
- `/files`: File management
- `/search`: Document search
- `/admin`: Administration panel (admin only)

## Authentication Flow

1. User submits credentials via `LoginPage.vue`
2. On success, JWT token is stored in localStorage
3. Token is included in subsequent API requests
4. Protected routes verify token validity
5. Auto-logout on token expiration

## File Management

### Supported File Types
- Documents (TXT, DOCX, ODT)
- PDF files
- Images (JPG, PNG, GIF)
- Markdown (MD)

### File Operations
- Upload (drag & drop support)
- Download
- Preview
- Delete
- Edit (text-based files)

## Search Implementation

### Features
- Full-text search across documents
- Filter by file type
- Sort by relevance/date
- Highlight matching terms
- Pagination of results

## Styling System

### CSS Architecture
- Mobile-first responsive design
- CSS Variables for theming
- BEM naming convention
- Utility classes for common patterns

### Theming
```css
:root {
  --primary-color: #4a6fa5;
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #e0e0e0;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #f0f0f0;
  --border-color: #444444;
}
```

## Testing Strategy

### Unit Testing
- Component tests with Vue Test Utils
- Utility function tests
- Mock API responses

### E2E Testing
- Cypress for full application testing
- Test critical user flows
- Visual regression testing

## Performance Considerations

### Code Splitting
- Route-based code splitting
- Lazy-loaded components
- Dynamic imports for large dependencies

### Asset Optimization
- Image compression
- SVG icons where possible
- Font subsetting

## Error Handling

### Global Error Handling
```javascript
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue error:', err);
  showErrorToast(err.message);
};
```

### API Error Handling
- Network error handling
- HTTP status code handling
- User-friendly error messages

## Browser Compatibility

### Supported Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (Chromium-based)

### Polyfills
- Included via @vitejs/plugin-legacy
- Automatic polyfill injection based on browser support

## Build Process

### Development
```bash
npm run dev
```
- Fast hot module replacement
- Source maps
- Development server with hot reload

### Production
```bash
npm run build
```
- Minification
- Tree-shaking
- Code splitting
- Asset hashing for cache busting

## Deployment

### Requirements
- Node.js 16+
- Modern web server (Nginx, Apache, etc.)
- HTTPS (required for service workers)

### Environment Variables
```
VITE_API_BASE_URL=your_api_url
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

### Deployment Steps
1. Build the application: `npm run build`
2. Deploy the contents of the `dist` directory
3. Configure your web server to serve `index.html` for all routes
4. Set up proper caching headers for static assets

## Monitoring and Analytics

### Error Tracking
- Sentry integration for error reporting
- Error logging to backend

### Performance Monitoring
- Web Vitals tracking
- Custom performance metrics

## Security Considerations

### Client-Side Security
- Content Security Policy (CSP)
- XSS protection
- CSRF protection for state-changing operations
- Secure cookie handling

### Data Protection
- Sensitive data never stored in client-side storage
- Secure token handling
- Input sanitization

## Future Improvements

### Planned Features
- Offline support with Service Workers
- Real-time collaboration
- Advanced document annotation
- Bulk operations
- Enhanced search filters

### Technical Debt
- Migrate to TypeScript
- Implement more comprehensive tests
- Optimize bundle size
- Improve accessibility (a11y)
