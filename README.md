# FU News - Next.js Frontend

A modern, responsive news platform built with Next.js, TypeScript, and Tailwind CSS. This is the frontend application for the FU News system, featuring both public news browsing and admin/staff management interfaces.

## Features

### Public Features
- 📰 Homepage with featured news and latest articles
- 🗂️ Category-based news browsing
- 🔍 Advanced search functionality
- 📱 Fully responsive design
- ⚡ Fast loading with optimized performance

### Admin/Staff Features
- 🔐 JWT-based authentication
- 📝 News article management (CRUD)
- 🏷️ Category and tag management
- 👥 User account management (Admin only)
- 📊 Content management dashboard

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Custom hooks
- **API Integration**: RESTful API with OData query support
- **Authentication**: JWT tokens with automatic refresh

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API server running (typically on port 5000)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME=FU News
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Development Settings
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── (public)/           # Public routes group
│   │   ├── page.tsx        # Homepage
│   │   ├── category/[id]/  # Category pages
│   │   ├── article/[id]/   # Article detail pages
│   │   └── search/         # Search page
│   ├── (admin)/            # Admin routes group
│   │   ├── auth/login/     # Login page
│   │   ├── admin/          # Admin dashboard
│   │   └── staff/          # Staff dashboard
│   └── globals.css         # Global styles
├── components/             # Reusable components
│   ├── ui/                 # Base UI components
│   ├── layout/             # Layout components
│   ├── news/               # News-specific components
│   └── forms/              # Form components
├── hooks/                  # Custom React hooks
│   ├── useNews.ts          # News-related operations
│   ├── useCategories.ts    # Category operations
│   └── useAuth.ts          # Authentication
├── lib/                    # Utility libraries
│   ├── api.ts              # API client
│   ├── api-services.ts     # API service functions
│   └── utils.ts            # General utilities
├── types/                  # TypeScript definitions
│   └── api.ts              # API response types
├── constants/              # Application constants
│   └── api.ts              # API endpoints and configs
└── context/                # React Context providers
```

## API Integration

The application integrates with a RESTful API that follows OData conventions:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/revoke-token` - Logout

### Public Endpoints (No Auth Required)
- `GET /api/news-articles` - Get news articles with filtering
- `GET /api/news-articles/{id}` - Get single article
- `GET /api/categories` - Get categories

### Admin/Staff Endpoints (Auth Required)
- News management: `GET/POST/PUT/DELETE /api/news-articles`
- Category management: `GET/POST/PUT/DELETE /api/categories`
- Tag management: `GET/POST/PUT/DELETE /api/tags`
- Account management: `GET/POST/PUT/DELETE /api/system-accounts` (Admin only)

### Query Parameters (OData)
- `$filter` - Filter results
- `$orderby` - Sort results
- `$top` - Limit results
- `$skip` - Skip results for pagination
- `$select` - Select specific fields
- `$expand` - Include related data

## Key Hooks

### News Hooks (`src/hooks/useNews.ts`)
- `useLatestNews(limit)` - Get latest news for homepage
- `useNewsByCategory(categoryId, page, limit)` - Category news with pagination
- `useNewsById(id)` - Single article fetching
- `useNewsSearch(keyword)` - Search with debouncing
- `useFeaturedNews()` - Featured news for banner
- `useAllNewsAdmin()` - Admin news management

### Category Hooks (`src/hooks/useCategories.ts`)
- `useActiveCategories()` - Public category navigation
- `useAllCategories()` - Admin category management
- `useCategoryById(id)` - Single category details

### Authentication Hooks (`src/hooks/useAuth.ts`)
- `useAuth()` - Main authentication state
- `useRoleCheck(role)` - Role-based access control
- `useLoginForm()` - Login form management

## Development Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Run tests
npm test
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | Yes | `http://localhost:5000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | No | `FU News` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | No | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | No | `development` |

## Error Handling

The application includes comprehensive error handling:

- **Network errors**: Automatic retry and user-friendly messages
- **Authentication errors**: Auto-redirect to login
- **Validation errors**: Field-specific error messages
- **Loading states**: Skeleton loaders throughout the app
- **Empty states**: Informative messages for no data

## Performance Optimizations

- **Server Components**: Used by default for better performance
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Proper caching strategies for API calls
- **Lazy Loading**: Components loaded on demand

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.
