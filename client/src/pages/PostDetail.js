import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaHeart, FaEye, FaComment, FaShare, FaEdit, FaTrash, FaReply } from 'react-icons/fa';
import '../styles/PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts/${id}`);
      setPost(response.data);
    } catch (err) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/post/${id}`);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(`/api/posts/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPost(); // Refresh post data
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post('/api/comments', {
        postId: id,
        content: newComment,
        parentId: replyTo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment('');
      setReplyTo(null);
      setReplyText('');
      fetchComments();
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post('/api/comments', {
        postId: id,
        content: replyText,
        parentId: replyTo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReplyTo(null);
      setReplyText('');
      fetchComments();
    } catch (err) {
      console.error('Failed to post reply:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/');
      } catch (err) {
        console.error('Failed to delete post:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="post-detail-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-detail-container">
        <div className="error-message">{error || 'Post not found'}</div>
      </div>
    );
  }

  const renderComments = (commentList, level = 0) => {
    return commentList.map(comment => (
      <div key={comment.id} className={`comment ${level > 0 ? 'reply' : ''}`} style={{ marginLeft: `${level * 20}px` }}>
        <div className="comment-header">
          <div className="comment-author">
            <img src={comment.author.avatar || '/default-avatar.png'} alt={comment.author.username} />
            <span>{comment.author.username}</span>
          </div>
          <div className="comment-date">
            {new Date(comment.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="comment-content">{comment.content}</div>
        <div className="comment-actions">
          <button onClick={() => setReplyTo(comment.id)} className="reply-btn">
            <FaReply /> Reply
          </button>
          {user && (user.id === comment.authorId || user.role === 'admin') && (
            <button onClick={() => handleDeleteComment(comment.id)} className="delete-btn">
              <FaTrash /> Delete
            </button>
          )}
        </div>
        {replyTo === comment.id && (
          <form onSubmit={handleReply} className="reply-form">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              required
            />
            <div className="reply-actions">
              <button type="submit">Reply</button>
              <button type="button" onClick={() => setReplyTo(null)}>Cancel</button>
            </div>
          </form>
        )}
        {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, level + 1)}
      </div>
    ));
  };

  return (
    <div className="post-detail-container">
      <article className="post-detail">
        <header className="post-header">
          <div className="post-meta">
            <span className="category">{post.category}</span>
            <span className="date">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="post-title">{post.title}</h1>
          <div className="post-author">
            <img src={post.author.avatar || '/default-avatar.png'} alt={post.author.username} />
            <div>
              <span className="author-name">{post.author.username}</span>
              <span className="author-bio">{post.author.bio || 'Blog writer'}</span>
            </div>
          </div>
        </header>

        {post.image && (
          <div className="post-image">
            <img src={post.image} alt={post.title} />
          </div>
        )}

        <div className="post-content">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <div className="post-tags">
          {post.tags && post.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>

        <div className="post-actions">
          <button onClick={handleLike} className={`like-btn ${post.liked ? 'liked' : ''}`}>
            <FaHeart /> {post.likes} Likes
          </button>
          <button className="view-btn">
            <FaEye /> {post.views} Views
          </button>
          <button className="comment-btn">
            <FaComment /> {comments.length} Comments
          </button>
          <button className="share-btn">
            <FaShare /> Share
          </button>
          {user && (user.id === post.authorId || user.role === 'admin') && (
            <>
              <button onClick={() => navigate(`/edit-post/${id}`)} className="edit-btn">
                <FaEdit /> Edit
              </button>
              <button onClick={handleDeletePost} className="delete-btn">
                <FaTrash /> Delete
              </button>
            </>
          )}
        </div>
      </article>

      <section className="comments-section">
        <h3>Comments ({comments.length})</h3>
        
        {user ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              required
            />
            <button type="submit">Post Comment</button>
          </form>
        ) : (
          <div className="login-prompt">
            <p>Please <button onClick={() => navigate('/login')}>login</button> to leave a comment.</p>
          </div>
        )}

        <div className="comments-list">
          {comments.length > 0 ? renderComments(comments) : (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default PostDetail; 