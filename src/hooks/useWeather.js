import { useState, useCallback } from 'react';

const WMO_CODES = {
  0: { label: 'Trời quang', icon: '☀️' },
  1: { label: 'Ít mây', icon: '🌤️' },
  2: { label: 'Có mây', icon: '⛅' },
  3: { label: 'Nhiều mây', icon: '☁️' },
  45: { label: 'Sương mù', icon: '🌫️' },
  48: { label: 'Sương muối', icon: '🌫️' },
  51: { label: 'Mưa phùn nhẹ', icon: '🌦️' },
  53: { label: 'Mưa phùn', icon: '🌦️' },
  55: { label: 'Mưa phùn dày', icon: '🌧️' },
  61: { label: 'Mưa nhẹ', icon: '🌧️' },
  63: { label: 'Mưa vừa', icon: '🌧️' },
  65: { label: 'Mưa to', icon: '🌧️' },
  71: { label: 'Tuyết nhẹ', icon: '🌨️' },
  73: { label: 'Tuyết vừa', icon: '❄️' },
  75: { label: 'Tuyết dày', icon: '❄️' },
  80: { label: 'Mưa rào nhẹ', icon: '🌦️' },
  81: { label: 'Mưa rào', icon: '🌧️' },
  82: { label: 'Mưa rào mạnh', icon: '⛈️' },
  95: { label: 'Giông bão', icon: '⛈️' },
  96: { label: 'Giông kèm mưa đá', icon: '⛈️' },
  99: { label: 'Giông mưa đá lớn', icon: '🌩️' },
};

export function getWeatherInfo(code) {
  return WMO_CODES[code] ?? { label: 'Không xác định', icon: '🌡️' };
}

export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = useCallback(async (city) => {
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      // Step 1: Geocoding via Nominatim
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'vi' } }
      );
      const geoData = await geoRes.json();

      if (!geoData.length) {
        setError('Không tìm thấy thành phố. Vui lòng thử lại.');
        return;
      }

      const { lat, lon, display_name } = geoData[0];

      // Step 2: Weather via Open-Meteo
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum` +
        `&timezone=auto&forecast_days=5`
      );
      const weatherData = await weatherRes.json();

      setWeather({ ...weatherData, displayName: display_name });
    } catch {
      setError('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { weather, loading, error, fetchWeather };
}
