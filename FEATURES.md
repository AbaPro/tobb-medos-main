# TOBB MEDOS Certificate System Features

## Authentication & Authorization
- NextAuth.js integration for secure authentication
- Role-based access control (admin & super-admin roles)
- Protected routes with middleware
- Login/logout functionality
- Password-protected admin panel

## Certificate Management
- Create new certificates with default templates
- Edit existing certificates with form validation
- Delete certificates with confirmation
- View certificate details in a tabbed interface
- View system-generated certificate ID

## Product Management
- Add products to certificates
- Edit product details (description, quantity, unit)
- Remove products from certificates
- Automatic calculation of total packages and weight

## Certificate Verification
- Public certificate verification page
- Verification by MongoDB ID or certificate number
- Shareable verification links
- QR code support for mobile verification

## Admin User Management
- Create admin users (super-admin only)
- Edit admin user details
- Toggle admin user activation status
- Delete admin users
- Change admin user roles

## User Interface
- Clean, modern responsive design
- Tab-based interface for certificate sections
- Mobile-friendly layouts
- Form validation with error messages
- Loading indicators during API operations
- Toast notifications for success/error feedback

## Certificate Listing & Search
- Sortable certificate table
  - Sort by certificate number
  - Sort by exporter name
  - Sort by date
- Full-text search across certificate fields
- Filter certificates by various criteria
- Pagination for large sets of certificates
- Status indicators for certificates

## Data Management
- MongoDB integration for persistent storage
- Mongoose models with validation
- RESTful API endpoints
- Proper error handling
- Type-safe interactions with TypeScript

## Utilities & UX
- Copy verification URLs to clipboard
- Preview certificates before saving
- Direct links to view certificates
- Keyboard shortcuts for common actions
- Tooltips for UI elements
- Optimistic UI updates for better responsiveness

## Security Features
- CSRF protection
- Input sanitization
- Password hashing with bcrypt
- Session management
- Protected API routes
