const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Data file paths
const COMMENTS_FILE = path.join(__dirname, '../data/comments.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');
const POSTS_FILE = path.join(__dirname, '../data/posts.json');

// Ensure data directory exists
const ensureDataDir = async () => {
  const dataDir = path.dirname(COMMENTS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Load comments from file
const loadComments = async () => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(COMMENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Save comments to file
const saveComments = async (comments) => {
  await ensureDataDir();
  await fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2));
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

// Load posts from file
const loadPosts = async () => {
  try {
    const data = await fs.readFile(POSTS_FILE, 'utf8');
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

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const comments = await loadComments();
    const users = await loadUsers();
    
    // Filter comments by post ID
    const postComments = comments.filter(comment => comment.postId === postId);
    
    // Sort by creation date (newest first)
    postComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Add user information to comments
    const commentsWithUsers = postComments.map(comment => {
      const user = users.find(u => u.id === comment.userId);
      return {
        ...comment,
        user: user ? {
          id: user.id,
          username: user.username,
          avatar: user.avatar
        } : null
      };
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedComments = commentsWithUsers.slice(startIndex, endIndex);
    
    res.json({
      comments: paginatedComments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(postComments.length / limit),
        totalComments: postComments.length,
        hasNextPage: endIndex < postComments.length,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { postId, content, parentId } = req.body;
    
    if (!postId || !content) {
      return res.status(400).json({ message: 'Post ID and content are required' });
    }
    
    // Check if post exists
    const posts = await loadPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const comments = await loadComments();
      const parentComment = comments.find(c => c.id === parentId);
      
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }
    
    const comments = await loadComments();
    
    const newComment = {
      id: uuidv4(),
      postId,
      userId: req.user.id,
      content,
      parentId: parentId || null,
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    comments.push(newComment);
    await saveComments(comments);
    
    // Add user information to the response
    const commentWithUser = {
      ...newComment,
      user: {
        id: req.user.id,
        username: req.user.username,
        avatar: req.user.avatar
      }
    };
    
    res.status(201).json({
      message: 'Comment created successfully',
      comment: commentWithUser
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const comments = await loadComments();
    const commentIndex = comments.findIndex(c => c.id === id);
    
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const comment = comments[commentIndex];
    
    // Check if user is the author
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }
    
    // Update comment
    comments[commentIndex] = {
      ...comment,
      content,
      updatedAt: new Date().toISOString()
    };
    
    await saveComments(comments);
    
    res.json({
      message: 'Comment updated successfully',
      comment: comments[commentIndex]
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await loadComments();
    const commentIndex = comments.findIndex(c => c.id === id);
    
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const comment = comments[commentIndex];
    
    // Check if user is the author
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Delete the comment and all its replies
    const commentsToDelete = [comment.id];
    const findReplies = (parentId) => {
      comments.forEach(c => {
        if (c.parentId === parentId) {
          commentsToDelete.push(c.id);
          findReplies(c.id);
        }
      });
    };
    findReplies(comment.id);
    
    const filteredComments = comments.filter(c => !commentsToDelete.includes(c.id));
    await saveComments(filteredComments);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike comment
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await loadComments();
    const commentIndex = comments.findIndex(c => c.id === id);
    
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const comment = comments[commentIndex];
    const likeIndex = comment.likes.indexOf(req.user.id);
    
    if (likeIndex === -1) {
      // Like the comment
      comment.likes.push(req.user.id);
    } else {
      // Unlike the comment
      comment.likes.splice(likeIndex, 1);
    }
    
    comments[commentIndex] = {
      ...comment,
      updatedAt: new Date().toISOString()
    };
    
    await saveComments(comments);
    
    res.json({
      message: likeIndex === -1 ? 'Comment liked' : 'Comment unliked',
      likes: comment.likes.length
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await loadComments();
    const users = await loadUsers();
    
    const comment = comments.find(c => c.id === id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Add user information
    const user = users.find(u => u.id === comment.userId);
    const commentWithUser = {
      ...comment,
      user: user ? {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      } : null
    };
    
    res.json({ comment: commentWithUser });
  } catch (error) {
    console.error('Get comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 