import './App.css';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import { useWeather } from './hooks/useWeather';

function App() {
  const { weather, loading, error, fetchWeather } = useWeather();

  return (
    <div className="app">
      <header className="app-header">
        <h1>???? Weather App</h1>
        <p className="subtitle">Dự báo thời tiết - Powered by Open-Meteo</p>
      </header>

      <main className="app-main">
        <SearchBar onSearch={fetchWeather} loading={loading} />

        {error && <div className="error-box">{error}</div>}


        {loading && (
          <div className="loading-box">
            <span className="spinner-lg" />
            <p>Dang tai du lieu thoi tiet...</p>
          </div>
        )}

        {weather && !loading && (
          <div className="results">
            <CurrentWeather weather={weather} />
            <Forecast weather={weather} />
          </div>
        )}

        {!weather && !loading && !error && (
          <div className="empty-state">
            <p>Nhap ten thanh pho de xem thoi tiet</p>
            <div className="quick-cities">
              {['Ha Noi', 'Ho Chi Minh', 'Da Nang', 'Tokyo', 'Paris'].map((c) => (
                <button key={c} className="quick-btn" onClick={() => fetchWeather(c)}>{c}</button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Du lieu tu Open-Meteo &amp; Nominatim</p>
      </footer>
    </div>
  );
}

export default App;