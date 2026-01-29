# Absolute Cinema Backend

The backend API for the Absolute Cinema project, built with Laravel 11. This RESTful API handles all data management and business logic for the cinema website.

## Overview

The backend provides a complete REST API for managing:
- Movies, actors, directors, and genres
- Content metadata (maturity ratings, languages, statuses)
- Image uploads and file storage

## Tech Stack

- **Framework**: Laravel 11
- **Database**: MySQL
- **Authentication**: Laravel Sanctum (token-based API authentication)
- **API Style**: RESTful
- **Validation**: Laravel Request validation classes
- **Testing**: PHPUnit

## Project Structure

```
app/
├── Http/
│   ├── Controllers/      # API endpoint controllers
│   └── Requests/         # Form request validation classes
├── Models/               # Eloquent models
│   ├── Actor.php
│   ├── Director.php
│   ├── Genre.php
│   ├── Language.php
│   ├── MaturityRating.php
│   ├── Movie.php
│   ├── Status.php
│   ├── User.php
│   └── BaseModel.php     # Base model with common functionality
└── Providers/            # Service providers

config/                   # Configuration files
database/
├── migrations/           # Database schema migrations
└── seeders/              # Database seeders
routes/                   # API routes definition
```

## Installation

1. **Install dependencies**:
   ```bash
   composer install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure database** in `.env`:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=absolute_cinema
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Run migrations and seeders**:
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

5. **Create symbolic link for file storage**:
   ```bash
   php artisan storage:link
   ```

6. **Start the development server**:
   ```bash
   php artisan serve
   ```

The API will be available at `http://localhost:8000`

## Common Commands

```bash
# Database
php artisan migrate              # Run migrations
php artisan migrate:fresh        # Reset and re-run all migrations
php artisan db:seed              # Run seeders
php artisan db:seed --class=DatabaseSeeder  # Run specific seeder

# Artisan
php artisan tinker               # Interactive shell
php artisan make:model Movie     # Generate a new model
php artisan make:controller API/MovieController  # Generate a controller

# Cache & Config
php artisan config:cache         # Cache configuration
php artisan cache:clear          # Clear application cache
```

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).