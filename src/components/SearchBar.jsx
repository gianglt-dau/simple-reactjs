import { useState } from 'react';

export default function SearchBar({ onSearch, loading }) {
  const [city, setCity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(city);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Nhập tên thành phố... (e.g. Hà Nội, Tokyo, London)"
        disabled={loading}
        autoFocus
      />
      <button type="submit" disabled={loading || !city.trim()}>
        {loading ? <span className="spinner" /> : '🔍 Tìm kiếm'}
      </button>
    </form>
  );
}
