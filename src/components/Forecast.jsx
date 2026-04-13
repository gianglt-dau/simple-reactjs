import { getWeatherInfo } from '../hooks/useWeather';

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function Forecast({ weather }) {
  const { daily, daily_units } = weather;

  return (
    <div className="card">
      <h3 className="section-title">Dự báo 5 ngày</h3>
      <div className="forecast-grid">
        {daily.time.map((date, i) => {
          const d = new Date(date);
          const dayName = i === 0 ? 'Hôm nay' : DAY_NAMES[d.getDay()];
          const { icon } = getWeatherInfo(daily.weather_code[i]);

          return (
            <div className="forecast-item" key={date}>
              <p className="forecast-day">{dayName}</p>
              <p className="forecast-date">{d.getDate()}/{d.getMonth() + 1}</p>
              <span className="forecast-icon">{icon}</span>
              <p className="forecast-temps">
                <span className="temp-max">{Math.round(daily.temperature_2m_max[i])}{daily_units.temperature_2m_max}</span>
                <span className="temp-min">{Math.round(daily.temperature_2m_min[i])}{daily_units.temperature_2m_min}</span>
              </p>
              {daily.precipitation_sum[i] > 0 && (
                <p className="forecast-rain">🌧 {daily.precipitation_sum[i]} mm</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
