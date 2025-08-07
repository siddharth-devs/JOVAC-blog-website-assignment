import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import '../styles/CategoryPosts.css';

const CategoryPosts = () => {
  const { category } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    fetchCategoryPosts();
  }, [category, currentPage]);

  const fetchCategoryPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/category/${category}?page=${currentPage}&limit=9`);
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setTotalPosts(data.totalPosts);
      } else {
        setError(data.message || 'Failed to load posts');
      }
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="category-posts-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-posts-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="category-posts-container">
      <div className="category-header">
        <h1>{category} Posts</h1>
        <p>{totalPosts} posts found in {category}</p>
      </div>

      {posts.length > 0 ? (
        <>
          <div className="posts-grid">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : (
        <div className="no-posts">
          <h2>No posts found in {category}</h2>
          <p>Be the first to create a post in this category!</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPosts; 