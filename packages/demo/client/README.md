# VibeCodingBoilerplate Web

This is the web version of the VibeCodingBoilerplate application, built with Vite and React.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository
2. Navigate to the web directory
3. Install dependencies

```bash
cd web
npm install
```

4. Create a `.env` file based on `.env.example` and fill in your Supabase credentials

### Development

To start the development server:

```bash
npm run dev
```

### Building for Production

To build the application for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Architecture

This project follows the architecture patterns outlined in the RapidAppDev boilerplate:

- **Logic Classes**: Business logic is separated from UI components
- **Services**: External functionality is provided through service classes
- **Storage**: Data persistence is handled through storage interfaces
- **Theme**: Consistent theming is applied throughout the application

## Project Structure

- `src/app`: Main application components
- `src/components`: Reusable UI components
- `src/features`: Feature-specific code
- `src/hooks`: Custom React hooks
- `src/screens`: Screen components with their logic
- `src/services`: Service classes for various functionalities
- `src/storage`: Storage interfaces and implementations
- `src/utils`: Utility functions and helpers
