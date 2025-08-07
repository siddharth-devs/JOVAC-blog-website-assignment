import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaUpload, FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import '../styles/CreatePost.css';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Technology',
    tags: '',
    image: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);

  const categories = [
    'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 
    'Business', 'Education', 'Entertainment', 'Sports', 'Politics'
  ];

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts/${id}`);
      const post = response.data;
      
      // Check if user can edit this post
      if (user.id !== post.authorId && user.role !== 'admin') {
        setError('You do not have permission to edit this post');
        setLoading(false);
        return;
      }

      setFormData({
        title: post.title,
        content: post.content,
        category: post.category,
        tags: post.tags ? post.tags.join(', ') : '',
        image: null
      });

      if (post.image) {
        setOriginalImage(post.image);
        setImagePreview(post.image);
      }
    } catch (err) {
      setError('Failed to load post');
    } finally {
      setLoading(false);
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
        image: file
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
    
    if (!user) {
      navigate('/login');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await axios.put(`/api/posts/${id}`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate(`/post/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/post/${id}`);
  };

  const handleBack = () => {
    navigate(`/post/${id}`);
  };

  if (loading) {
    return (
      <div className="create-post-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error && error.includes('permission')) {
    return (
      <div className="create-post-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>{error}</p>
          <button onClick={handleBack}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="create-post-container">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to edit posts.</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <div className="create-post-header">
        <button onClick={handleBack} className="back-btn">
          <FaArrowLeft /> Back to Post
        </button>
        <h1>Edit Post</h1>
        <p>Update your post content and settings</p>
      </div>

      <form onSubmit={handleSubmit} className="create-post-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter your post title..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Enter tags separated by commas (e.g., javascript, react, web-development)"
          />
          <small>Separate tags with commas</small>
        </div>

        <div className="form-group">
          <label htmlFor="image">Featured Image</label>
          <div className="image-upload">
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <label htmlFor="image" className="file-label">
              <FaUpload />
              <span>Choose a new image</span>
            </label>
          </div>
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(originalImage);
                  setFormData(prev => ({ ...prev, image: null }));
                }}
                className="remove-image"
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Write your post content here... You can use HTML tags for formatting."
            rows="15"
            required
          />
          <small>You can use HTML tags for formatting (e.g., &lt;strong&gt;, &lt;em&gt;, &lt;h2&gt;, etc.)</small>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="cancel-btn">
            <FaTimes /> Cancel
          </button>
          <button type="submit" disabled={saving} className="submit-btn">
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost; 