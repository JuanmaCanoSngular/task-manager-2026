# Tasks Manager App

A modern, accessible task management application built for the [DevChallenges Task Manager App challenge](https://devchallenges.io/challenge/task-manager-app). This project demonstrates modern React development practices with a focus on accessibility, drag-and-drop functionality, and responsive design.

## 🎯 About the App

Tasks Manager App is a comprehensive task management solution that allows users to organize their work using a Kanban-style board system. The application features a clean, intuitive interface with full keyboard navigation support and accessibility features.

### Key Features

- **📋 Task Management**: Create, edit, and delete tasks with rich metadata
- **🏷️ Task Organization**: Organize tasks by status (Todo, In Progress, In Review, Done)
- **🎨 Visual Customization**: Add background images to tasks for better visual organization
- **🏷️ Tag System**: Categorize tasks with up to 4 tags per task
- **🔄 Drag & Drop**: Intuitive drag-and-drop interface for moving tasks between status columns
- **🌙 Dark Mode**: Full dark/light theme support
- **♿ Accessibility**: WCAG compliant with keyboard navigation and screen reader support
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **💾 Local Storage**: Tasks persist in browser local storage
- **⚡ Real-time Updates**: Instant UI updates with no page refreshes

### User Experience

- **Intuitive Interface**: Clean, modern design that's easy to navigate
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Visual Feedback**: Smooth animations and hover effects
- **Error Handling**: User-friendly error messages and validation
- **Performance**: Fast, responsive interface with optimized rendering

## 🛠️ Technical Stack

This project is built with modern web technologies and follows best practices for React development:

### Core Technologies

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework

### State Management

- **Zustand** - Lightweight state management with persistence
- **Immer** - Immutable state updates

### UI Components

- **Headless UI** - Accessible, unstyled UI components
- **Heroicons** - Beautiful SVG icons
- **@hello-pangea/dnd** - Drag and drop functionality

### Development Tools

- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **Husky** - Git hooks for code quality
- **TypeScript ESLint** - TypeScript-specific linting rules

### Testing

- **Vitest** - Fast unit testing
- **React Testing Library** - Component testing utilities
- **JSDOM** - DOM testing environment

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/task-manager.git
   cd task-manager
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run validate` - Run linting and type checking

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── boards/         # Board-related components
│   ├── tasks/          # Task-related components
│   ├── layout/         # Layout components
│   └── common/         # Shared components
├── interfaces/         # TypeScript interfaces
├── services/          # API and external services
├── stores/            # Zustand state stores
├── styles/            # Global styles and CSS
└── main.tsx           # Application entry point
```

## 🧪 Testing

The project includes comprehensive testing with Vitest and React Testing Library:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test -- --watch
```

## 📦 Build and Deployment

### Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deployment Options

- **Vercel**: Connect your GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist/` folder or connect your repository
- **GitHub Pages**: Use GitHub Actions for automatic deployment
- **Any static hosting**: The app is a static SPA that works on any web server

## 🔧 Development Guidelines

### Code Quality

- **TypeScript**: All code must be properly typed
- **ESLint**: Follow the configured linting rules
- **Prettier**: Maintain consistent code formatting
- **Testing**: Write tests for new features

### Accessibility

- **WCAG 2.1 AA**: Follow accessibility guidelines
- **Keyboard Navigation**: Ensure all features work with keyboard
- **Screen Readers**: Test with screen reader software
- **ARIA Labels**: Use proper ARIA attributes

### Performance

- **Bundle Size**: Keep the bundle size minimal
- **Lazy Loading**: Implement lazy loading where appropriate
- **Optimization**: Use React.memo and useMemo for expensive operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [DevChallenges](https://devchallenges.io/) for providing the challenge
- [React](https://reactjs.org/) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand) for lightweight state management

---

Built with ❤️ for the DevChallenges community
