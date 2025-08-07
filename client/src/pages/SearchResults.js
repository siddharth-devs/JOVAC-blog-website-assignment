import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { FaSearch, FaTimes } from 'react-icons/fa';
import '../styles/SearchResults.css';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    setSearchQuery(query);
    if (query) {
      fetchSearchResults();
    } else {
      setPosts([]);
      setLoading(false);
    }
  }, [query, currentPage]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts?search=${encodeURIComponent(query)}&page=${currentPage}&limit=9`);
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setTotalResults(data.totalPosts);
      } else {
        setError(data.message || 'Failed to load search results');
      }
    } catch (err) {
      setError('Failed to load search results');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      setCurrentPage(1);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setPosts([]);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (!query) {
    return (
      <div className="search-results-container">
        <div className="search-header">
          <h1>Search Posts</h1>
          <p>Find the content you're looking for</p>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for posts, authors, or topics..."
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <FaSearch />
            </button>
          </div>
        </form>

        <div className="search-suggestions">
          <h3>Popular Searches</h3>
          <div className="suggestion-tags">
            {['Technology', 'React', 'JavaScript', 'Web Development', 'Programming', 'Design'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  setSearchParams({ q: tag });
                }}
                className="suggestion-tag"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="search-results-container">
        <div className="search-header">
          <h1>Search Results</h1>
          <p>Searching for "{query}"...</p>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results-container">
        <div className="search-header">
          <h1>Search Results</h1>
          <p>Error occurred while searching</p>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="search-header">
        <h1>Search Results</h1>
        <p>
          {totalResults} result{totalResults !== 1 ? 's' : ''} found for "{query}"
        </p>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for posts, authors, or topics..."
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <FaSearch />
            </button>
            <button type="button" onClick={handleClearSearch} className="clear-btn">
              <FaTimes />
            </button>
          </div>
        </form>
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
        <div className="no-results">
          <h2>No results found for "{query}"</h2>
          <p>Try adjusting your search terms or browse our categories instead.</p>
          
          <div className="search-suggestions">
            <h3>Try searching for:</h3>
            <div className="suggestion-tags">
              {['Technology', 'React', 'JavaScript', 'Web Development', 'Programming', 'Design'].map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    setSearchParams({ q: tag });
                  }}
                  className="suggestion-tag"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults; 