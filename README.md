# Blog Website JOVAC

A modern, full-stack blog website built with React.js, Node.js, and Express.js.

## Features

- **User Authentication**: Register, login, and profile management
- **Blog Posts**: Create, read, update, and delete blog posts
- **Comments System**: Nested comments with like/unlike functionality
- **File Uploads**: Image upload support for blog posts
- **Responsive Design**: Modern UI that works on all devices
- **Search & Filtering**: Search posts and filter by categories
- **Pagination**: Efficient loading of posts and comments
- **Real-time Updates**: Dynamic content updates

## Tech Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **JWT**: Authentication and authorization
- **bcryptjs**: Password hashing
- **multer**: File upload handling
- **helmet**: Security middleware
- **cors**: Cross-origin resource sharing

### Frontend
- **React.js**: User interface library
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **CSS3**: Styling with modern design
- **Responsive Design**: Mobile-first approach

### Data Storage
- **JSON Files**: File-based data storage (easily upgradable to MongoDB/PostgreSQL)

## Project Structure

```
blog-website-jovac/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── utils/
│   │   └── styles/
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── comments.js
│   ├── data/              # JSON data files
│   ├── uploads/           # File uploads
│   └── index.js
├── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CLIENT_URL=http://localhost:3000
   ```

3. **Start the server**:
   ```bash
   npm run server
   ```

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the React app**:
   ```bash
   npm start
   ```

### Development Mode

Run both frontend and backend simultaneously:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `GET /api/posts/category/:category` - Get posts by category

### Comments
- `GET /api/comments/post/:postId` - Get comments for a post
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like/unlike comment

## Features in Detail

### User Authentication
- Secure password hashing with bcryptjs
- JWT token-based authentication
- User profile management
- Avatar upload support

### Blog Posts
- Rich text content support
- Image upload for post thumbnails
- Category and tag system
- Like/unlike functionality
- View count tracking
- Search and filtering

### Comments System
- Nested comments (replies)
- Like/unlike comments
- Real-time updates
- Pagination support

### Security Features
- JWT token validation
- Password hashing
- CORS configuration
- Helmet security headers
- Input validation

## Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in your environment
2. Update JWT_SECRET with a strong secret key
3. Configure your database (upgrade from JSON files if needed)
4. Deploy to your preferred hosting service (Heroku, Vercel, AWS, etc.)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables for production API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ by JOVAC** 