# 🚀 Quick Start Guide - JOVAC Blog

Get your blog website up and running in minutes!

## Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**

## 🎯 Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Clone or download the project
# Navigate to the project directory
cd blog-website-jovac

# Run the automated setup script
node setup.js
```

### Option 2: Manual Setup

```bash
# 1. Install server dependencies
npm install

# 2. Install client dependencies
cd client && npm install && cd ..

# 3. Create .env file
echo "NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000" > .env

# 4. Create necessary directories
mkdir -p server/data server/uploads
```

## 🏃‍♂️ Start Development

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📱 What You'll See

1. **Home Page**: Browse blog posts with modern UI
2. **Authentication**: Register/login with secure JWT tokens
3. **Blog Posts**: Create, edit, and manage your posts
4. **Comments**: Engage with readers through comments
5. **Responsive Design**: Works perfectly on all devices

## 🔧 Available Scripts

```bash
npm run dev          # Start both frontend and backend
npm run server       # Start only the backend server
npm run client       # Start only the frontend
npm run build        # Build frontend for production
npm start           # Start production server
```

## 🌟 Key Features

- ✅ **User Authentication** (Register/Login)
- ✅ **Blog Post Management** (CRUD operations)
- ✅ **Comments System** (Nested comments)
- ✅ **File Uploads** (Image support)
- ✅ **Search & Filtering** (By category/tags)
- ✅ **Responsive Design** (Mobile-first)
- ✅ **Modern UI/UX** (Beautiful gradients)
- ✅ **Security** (JWT, password hashing)
- ✅ **Pagination** (Efficient loading)

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express.js**
- **JWT Authentication**
- **bcryptjs** (Password hashing)
- **multer** (File uploads)
- **JSON file storage** (Easy to upgrade to MongoDB)

### Frontend
- **React.js** (v18)
- **React Router** (Navigation)
- **Axios** (HTTP client)
- **React Icons** (Beautiful icons)
- **Modern CSS** (Responsive design)

## 📁 Project Structure

```
blog-website-jovac/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── styles/        # CSS files
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── data/              # JSON data files
│   ├── uploads/           # File uploads
│   └── index.js           # Server entry point
├── package.json
└── README.md
```

## 🔐 Default Credentials

After setup, you can:
1. **Register** a new account
2. **Login** with your credentials
3. **Create** your first blog post

## 🚀 Deployment

### Backend Deployment
```bash
# Set production environment
NODE_ENV=production
JWT_SECRET=your-production-secret-key

# Start production server
npm start
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy the 'client/build' folder
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   ```

2. **Node modules issues**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Client build issues**
   ```bash
   cd client
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📞 Support

- Check the main [README.md](README.md) for detailed documentation
- Review the API endpoints in the server routes
- Explore the component structure in the client folder

## 🎉 You're Ready!

Your JOVAC Blog is now running! Start creating amazing content and sharing your stories with the world.

---

**Happy Blogging! 🚀** 