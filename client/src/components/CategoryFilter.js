import React from 'react';
import '../styles/CategoryFilter.css';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { name: 'All', count: null },
    { name: 'Technology', count: 15 },
    { name: 'Lifestyle', count: 12 },
    { name: 'Travel', count: 8 },
    { name: 'Food', count: 6 },
    { name: 'Health', count: 4 },
    { name: 'Business', count: 7 },
    { name: 'Education', count: 5 }
  ];

  return (
    <div className="category-filter">
      <h3>Categories</h3>
      <ul className="category-list">
        {categories.map((category) => (
          <li key={category.name} className="category-item">
            <button
              className={`category-button ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.name === 'All' ? '' : category.name)}
            >
              {category.name}
              {category.count && <span className="count">{category.count}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryFilter; 