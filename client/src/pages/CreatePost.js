import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaUpload, FaSave, FaTimes } from 'react-icons/fa';
import '../styles/CreatePost.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Technology',
    tags: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 
    'Business', 'Education', 'Entertainment', 'Sports', 'Politics'
  ];

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

    setLoading(true);
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

      const response = await axios.post('/api/posts', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate(`/post/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <div className="create-post-container">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to create a new post.</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <div className="create-post-header">
        <h1>Create New Post</h1>
        <p>Share your thoughts and stories with the world</p>
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
              <span>Choose an image</span>
            </label>
          </div>
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
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
          <button type="submit" disabled={loading} className="submit-btn">
            <FaSave /> {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost; 