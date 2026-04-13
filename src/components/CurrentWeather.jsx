import { getWeatherInfo } from '../hooks/useWeather';

export default function CurrentWeather({ weather }) {
  const { current, current_units, displayName } = weather;
  const { label, icon } = getWeatherInfo(current.weather_code);

  return (
    <div className="card current-weather">
      <p className="location-name">{displayName}</p>
      <div className="current-main">
        <span className="weather-icon-large">{icon}</span>
        <div>
          <p className="temperature">{current.temperature_2m}{current_units.temperature_2m}</p>
          <p className="weather-label">{label}</p>
        </div>
      </div>
      <div className="current-details">
        <div className="detail-item">
          <span>🌡️ Cảm giác</span>
          <strong>{current.apparent_temperature}{current_units.apparent_temperature}</strong>
        </div>
        <div className="detail-item">
          <span>💧 Độ ẩm</span>
          <strong>{current.relative_humidity_2m}{current_units.relative_humidity_2m}</strong>
        </div>
        <div className="detail-item">
          <span>💨 Gió</span>
          <strong>{current.wind_speed_10m} {current_units.wind_speed_10m}</strong>
        </div>
        <div className="detail-item">
          <span>🔽 Áp suất</span>
          <strong>{current.surface_pressure} hPa</strong>
        </div>
      </div>
    </div>
  );
}
