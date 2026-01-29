# Absolute Cinema

A modern website for a cinema with a comprehensive dashboard for content management. This project provides users with a detailed catalog of movies, along with administrative tools for managing the cinema's content.

## Project Overview

Absolute Cinema is a full-stack application built with a Laravel backend and React frontend. It serves as a public-facing cinema website where users can discover movies, and an administrative dashboard for managing movies, actors, directors, and other cinema content.

### Key Features

- **Movie Database**: Comprehensive catalog with detailed information about movies, actors, and directors
- **Admin Dashboard**: Manage movies, actors, directors, genres, and other content
- **Image Management**: Upload and manage movie posters
- **Arabic language Support**: Support for Arabic language
- **Responsive Design**: Modern, responsive UI for both website and dashboard experiences

## Tech Stack

### Backend
- **Framework**: Laravel 11
- **Database**: MySQL
- **API**: RESTful API with Laravel Sanctum for authentication

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with theme support
- **State Management**: React Context API
- **Internationalization**: i18n for multi-language support

## Project Structure

```
absolute-cinema/
├── backend/          # Laravel API and backend services
└── frontend/         # React application (website + dashboard)
```

## Getting Started

### Prerequisites

- PHP 8.2 or higher
- Node.js 18+ and npm
- MySQL 8.0+
- Composer

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd absolute-cinema
```

#### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your database in .env file
# Then run migrations and seeders
php artisan migrate --seed

# Create symbolic link for file storage
php artisan storage:link

# Start the development server
php artisan serve
```

The backend API will be available at `http://localhost:8000`

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will be available at `http://localhost:5173`

## Documentation

- **Backend**: See [backend/README.md](backend/README.md)
- **Frontend**: See [frontend/README.md](frontend/README.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.