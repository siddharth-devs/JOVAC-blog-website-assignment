import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaEye, FaUser, FaCalendar, FaTag } from 'react-icons/fa';
import '../styles/PostCard.css';

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <article className="post-card">
      <div className="post-image">
        {post.image ? (
          <img src={post.image} alt={post.title} />
        ) : (
          <div className="post-image-placeholder">
            <FaTag />
          </div>
        )}
        <div className="post-category">
          <span>{post.category}</span>
        </div>
      </div>

      <div className="post-content">
        <div className="post-meta">
          <div className="post-author">
            <FaUser />
            <span>{post.author?.username || 'Anonymous'}</span>
          </div>
          <div className="post-date">
            <FaCalendar />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>

        <h2 className="post-title">
          <Link to={`/post/${post.id}`}>{post.title}</Link>
        </h2>

        <p className="post-excerpt">
          {truncateText(post.content)}
        </p>

        <div className="post-tags">
          {post.tags && post.tags.length > 0 && (
            <div className="tags">
              {post.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="tag">
                  #{tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="tag-more">+{post.tags.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        <div className="post-stats">
          <div className="stat">
            <FaHeart className={post.likes?.includes(post.author?.id) ? 'liked' : ''} />
            <span>{post.likes?.length || 0}</span>
          </div>
          <div className="stat">
            <FaEye />
            <span>{post.views || 0}</span>
          </div>
        </div>

        <Link to={`/post/${post.id}`} className="read-more">
          Read More
        </Link>
      </div>
    </article>
  );
};

export default PostCard; 