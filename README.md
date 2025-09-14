# KB-Sage: Knowledge Base Management System

KB-Sage is a modern, responsive web application for managing and interacting with a knowledge base. Built with Vue 3 and Vite, it provides an intuitive interface for searching, viewing, and managing documents with support for various file types.

## 🌟 Features

- **User Authentication**: Secure login system with role-based access control
- **Document Management**: Upload, view, and manage various file types (documents, images, PDFs)
- **Advanced Search**: Full-text search capabilities across documents
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes for comfortable viewing
- **Quiz Generation**: Generate quizzes from document content
- **Admin Dashboard**: Administrative interface for user and content management

## 🚀 Tech Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Markdown Processing**: Marked.js
- **Code Highlighting**: Highlight.js
- **State Management**: Vue's Composition API (Pinia not currently used)
- **Styling**: CSS3 with responsive design patterns
- **Package Manager**: npm

## 📁 Project Structure

```
kb-sage/
├── public/                  # Static files
│   └── favicon.ico          # Application favicon
├── src/
│   ├── components/          # Vue components
│   │   ├── AdminDashboard.vue    # Admin interface
│   │   ├── AnimatedBackground.vue # Dynamic background component
│   │   ├── FileEditModal.vue     # File editing interface
│   │   ├── FileModalOpener.vue   # Modal for file operations
│   │   ├── FileTabs.vue          # Tabbed interface for open files
│   │   ├── HomePage.vue          # Landing page
│   │   ├── LoginPage.vue         # Authentication interface
│   │   ├── QuizModal.vue         # Quiz generation and display
│   │   ├── ReportTable.vue       # Data reporting component
│   │   ├── SearchPage.vue        # Search interface
│   │   ├── SearchSidebar.vue     # Sidebar for search results
│   │   ├── SettingsModal.vue     # Application settings
│   │   ├── SidebarFiles.vue      # File browser sidebar
│   │   ├── ToastNotification.vue # Notification system
│   │   └── user.vue              # User profile component
│   │
│   ├── api.js               # API service layer
│   ├── App.vue              # Root Vue component
│   └── main.js              # Application entry point
│
├── index.html               # Main HTML template
├── jsconfig.json            # JavaScript configuration
├── LICENSE                  # License file
├── package.json             # Project dependencies and scripts
└── vite.config.js           # Vite configuration
```

## 🛠️ Development Setup

### Prerequisites

- Node.js ^20.19.0 or >=22.12.0
- npm (included with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kb-sage
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server with hot-reload:
```bash
npm run dev
```

### Building for Production

Build the application for production:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## 🏗️ Architecture

### Component Structure

The application follows a modular component architecture:

1. **Core Components**:
   - `App.vue`: Root component handling routing and layout
   - `HomePage.vue`: Main dashboard and entry point
   - `LoginPage.vue`: Authentication interface

2. **Document Management**:
   - `FileTabs.vue`: Manages open documents in a tabbed interface
   - `FileEditModal.vue`: Provides editing capabilities
   - `SidebarFiles.vue`: File browser and navigation

3. **Search & Discovery**:
   - `SearchPage.vue`: Main search interface
   - `SearchSidebar.vue`: Displays search results

4. **Administration**:
   - `AdminDashboard.vue`: Administrative controls and user management
   - `ReportTable.vue`: Data reporting and analytics

### State Management

The application uses Vue's Composition API for state management, with shared state managed through composables and props. Key state management patterns include:

- Local component state for UI-specific data
- Props and events for parent-child communication
- Reactive references (`ref`) and reactive objects (`reactive`) for component state
- Composables for shared logic and state

### API Integration

The `api.js` module handles all API communication, providing methods for:
- Authentication and authorization
- File uploads and downloads
- Document search and retrieval
- User management (admin functions)

## 🎨 Styling

The application uses vanilla CSS with a mobile-first approach. Key styling features include:

- Responsive design with media queries
- CSS variables for theming (dark/light mode)
- Flexbox and CSS Grid for layouts
- Custom animations and transitions
- Accessibility-focused design patterns

## 🔒 Security Considerations

- JWT-based authentication
- Role-based access control
- Input validation on both client and server
- Secure file handling
- Environment variables for sensitive configuration

## 📄 License

This project is licensed under the terms of the MIT license. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please follow the standard fork-and-pull request workflow.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📧 Contact

For questions or support, please contact the development team.
