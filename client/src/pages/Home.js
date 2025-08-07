import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import CategoryFilter from '../components/CategoryFilter';
import '../styles/Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = async (page = 1, category = '', search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 9
      });

      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const response = await axios.get(`/api/posts?${params}`);
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  const handlePageChange = (page) => {
    fetchPosts(page, selectedCategory, searchQuery);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-message">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => fetchPosts(1, selectedCategory, searchQuery)} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to JOVAC Blog</h1>
        <p>Discover amazing stories, insights, and perspectives from our community</p>
      </div>

      <div className="home-content">
        <aside className="sidebar">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </aside>

        <main className="main-content">
          {posts.length === 0 ? (
            <div className="no-posts">
              <h2>No posts found</h2>
              <p>
                {selectedCategory || searchQuery
                  ? `No posts found for "${selectedCategory || searchQuery}"`
                  : 'No posts available at the moment.'}
              </p>
              {selectedCategory && (
                <Link to="/" className="btn btn-primary">
                  View All Posts
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="posts-grid">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home; 