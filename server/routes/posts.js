const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const router = express.Router();

// Data file paths
const POSTS_FILE = path.join(__dirname, '../data/posts.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = path.dirname(POSTS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Load posts from file
const loadPosts = async () => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(POSTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Save posts to file
const savePosts = async (posts) => {
  await ensureDataDir();
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));
};

// Load users from file
const loadUsers = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const users = await loadUsers();
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all posts with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const posts = await loadPosts();
    const users = await loadUsers();

    // Filter posts
    let filteredPosts = posts;
    
    if (category) {
      filteredPosts = filteredPosts.filter(post => post.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Add author information
    const postsWithAuthors = filteredPosts.map(post => {
      const author = users.find(user => user.id === post.authorId);
      return {
        ...post,
        author: author ? {
          id: author.id,
          username: author.username,
          avatar: author.avatar
        } : null
      };
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = postsWithAuthors.slice(startIndex, endIndex);

    res.json({
      posts: paginatedPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredPosts.length / limit),
        totalPosts: filteredPosts.length,
        hasNextPage: endIndex < filteredPosts.length,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await loadPosts();
    const users = await loadUsers();
    
    const post = posts.find(p => p.id === id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add author information
    const author = users.find(user => user.id === post.authorId);
    const postWithAuthor = {
      ...post,
      author: author ? {
        id: author.id,
        username: author.username,
        avatar: author.avatar,
        bio: author.bio
      } : null
    };

    res.json({ post: postWithAuthor });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new post
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const posts = await loadPosts();
    
    const newPost = {
      id: uuidv4(),
      title,
      content,
      category: category || 'General',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      image: req.file ? `/uploads/${req.file.filename}` : '',
      authorId: req.user.id,
      likes: [],
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    posts.push(newPost);
    await savePosts(posts);

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    
    const posts = await loadPosts();
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = posts[postIndex];
    
    // Check if user is the author
    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    // Update post
    posts[postIndex] = {
      ...post,
      title: title || post.title,
      content: content || post.content,
      category: category || post.category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : post.tags,
      image: req.file ? `/uploads/${req.file.filename}` : post.image,
      updatedAt: new Date().toISOString()
    };

    await savePosts(posts);

    res.json({
      message: 'Post updated successfully',
      post: posts[postIndex]
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await loadPosts();
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = posts[postIndex];
    
    // Check if user is the author
    if (post.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    posts.splice(postIndex, 1);
    await savePosts(posts);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await loadPosts();
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = posts[postIndex];
    const likeIndex = post.likes.indexOf(req.user.id);
    
    if (likeIndex === -1) {
      // Like the post
      post.likes.push(req.user.id);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }

    posts[postIndex] = {
      ...post,
      updatedAt: new Date().toISOString()
    };

    await savePosts(posts);

    res.json({
      message: likeIndex === -1 ? 'Post liked' : 'Post unliked',
      likes: post.likes.length
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const posts = await loadPosts();
    const users = await loadUsers();

    const categoryPosts = posts.filter(post => post.category === category);
    
    // Sort by creation date (newest first)
    categoryPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Add author information
    const postsWithAuthors = categoryPosts.map(post => {
      const author = users.find(user => user.id === post.authorId);
      return {
        ...post,
        author: author ? {
          id: author.id,
          username: author.username,
          avatar: author.avatar
        } : null
      };
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPosts = postsWithAuthors.slice(startIndex, endIndex);

    res.json({
      posts: paginatedPosts,
      category,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(categoryPosts.length / limit),
        totalPosts: categoryPosts.length,
        hasNextPage: endIndex < categoryPosts.length,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get category posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 