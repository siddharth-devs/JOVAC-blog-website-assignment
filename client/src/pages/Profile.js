import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaUser, FaEnvelope, FaEdit, FaSave, FaTimes, FaSignOutAlt, FaHeart, FaEye, FaFileAlt } from 'react-icons/fa';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, token, updateProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFormData({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      avatar: null
    });
    
    if (user.avatar) {
      setImagePreview(user.avatar);
    }
    
    fetchUserPosts();
  }, [user, navigate]);

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get('/api/posts', {
        params: { authorId: user.id },
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserPosts(response.data.posts || []);
    } catch (err) {
      console.error('Failed to fetch user posts:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('bio', formData.bio);
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const response = await axios.put('/api/auth/profile', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      await updateProfile(response.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUserPosts();
        setSuccess('Post deleted successfully!');
      } catch (err) {
        setError('Failed to delete post');
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Manage your account and view your posts</p>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <div className="profile-info">
            <div className="profile-avatar">
              <img src={imagePreview || '/default-avatar.png'} alt={user.username} />
              {isEditing && (
                <div className="avatar-upload">
                  <input
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <label htmlFor="avatar" className="file-label">
                    <FaEdit />
                  </label>
                </div>
              )}
            </div>

            <div className="profile-details">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="profile-form">
                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}

                  <div className="form-group">
                    <label htmlFor="username">
                      <FaUser /> Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <FaEnvelope /> Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                      <FaTimes /> Cancel
                    </button>
                    <button type="submit" disabled={saving} className="save-btn">
                      <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-display">
                  <h2>{user.username}</h2>
                  <p className="user-email">{user.email}</p>
                  {user.bio && <p className="user-bio">{user.bio}</p>}
                  <p className="user-role">Role: {user.role || 'User'}</p>
                  <p className="member-since">
                    Member since: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="profile-stats">
                    <div className="stat">
                      <FaFileAlt />
                      <span>{userPosts.length} Posts</span>
                    </div>
                    <div className="stat">
                      <FaHeart />
                      <span>{userPosts.reduce((total, post) => total + post.likes, 0)} Total Likes</span>
                    </div>
                    <div className="stat">
                      <FaEye />
                      <span>{userPosts.reduce((total, post) => total + post.views, 0)} Total Views</span>
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button onClick={() => setIsEditing(true)} className="edit-btn">
                      <FaEdit /> Edit Profile
                    </button>
                    <button onClick={handleLogout} className="logout-btn">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="user-posts-section">
          <h3>Your Posts ({userPosts.length})</h3>
          
          {userPosts.length > 0 ? (
            <div className="user-posts-grid">
              {userPosts.map(post => (
                <div key={post.id} className="user-post-card">
                  {post.image && (
                    <div className="post-image">
                      <img src={post.image} alt={post.title} />
                    </div>
                  )}
                  <div className="post-content">
                    <h4>{post.title}</h4>
                    <p className="post-excerpt">
                      {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                    <div className="post-meta">
                      <span className="category">{post.category}</span>
                      <span className="date">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="post-stats">
                      <span><FaHeart /> {post.likes}</span>
                      <span><FaEye /> {post.views}</span>
                    </div>
                    <div className="post-actions">
                      <button onClick={() => navigate(`/post/${post.id}`)} className="view-btn">
                        View
                      </button>
                      <button onClick={() => navigate(`/edit-post/${post.id}`)} className="edit-btn">
                        Edit
                      </button>
                      <button onClick={() => handleDeletePost(post.id)} className="delete-btn">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-posts">
              <p>You haven't created any posts yet.</p>
              <button onClick={() => navigate('/create-post')} className="create-post-btn">
                Create Your First Post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 