# JustHear.me - React TypeScript Application

A modern React TypeScript application for anonymous listening and validation services.

## 🚀 Features

- **Modern React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **Error Boundaries** for graceful error handling
- **Environment Configuration** for different deployments
- **ESLint** with TypeScript and React rules
- **Component Architecture** with proper separation of concerns

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, CSS Modules
- **UI Components**: Radix UI, Custom Components
- **State Management**: React Context, Custom Hooks
- **Build Tool**: Vite
- **Linting**: ESLint with TypeScript support
- **Code Quality**: Prettier (recommended)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd justhear-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   VITE_ENABLE_ANALYTICS=false
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── ui/             # Base UI components
│   ├── sections/       # Page sections
│   └── ErrorBoundary.tsx
├── config/             # Configuration files
│   └── environment.ts  # Environment configuration
├── constants/          # Static data and constants
│   └── data.ts        # Application data
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx            # Main application component
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔧 Configuration

### TypeScript Configuration

The project uses a modern TypeScript configuration with:
- Strict type checking
- JSX support
- Path aliases (`@/*` points to `src/*`)
- Modern ES2020 target

### Vite Configuration

Optimized for:
- Fast development with HMR
- Code splitting
- Tree shaking
- Source maps in development

### ESLint Configuration

Enforces:
- React Hooks rules
- TypeScript best practices
- Code quality standards
- Accessibility guidelines

## 🏛️ Architecture

### Component Architecture

- **Functional Components** with hooks
- **Error Boundaries** for error handling
- **Custom Hooks** for reusable logic
- **TypeScript** for type safety

### State Management

- **React Context** for global state
- **Custom Hooks** for local state
- **Local Storage** for persistence

### Styling

- **Tailwind CSS** for utility-first styling
- **CSS Modules** for component-specific styles
- **Responsive Design** with mobile-first approach

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment Variables

Set the following environment variables for production:

- `VITE_API_BASE_URL` - Your API base URL
- `VITE_ENABLE_ANALYTICS` - Enable/disable analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Write meaningful component and function names
- Add proper TypeScript types
- Follow ESLint rules

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email hello@justhear.me or create an issue in the repository.
