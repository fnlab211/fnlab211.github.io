// 날씨 API 연동 (OpenWeatherMap 사용)
const API_BASE_URL = '/api';

// API 키가 없을 경우 에러 메시지 표시
function showError(message) {
    console.error(message);
    document.getElementById('weather-info-group').innerHTML = `
        <div style="color: #ff4444; text-align: center; padding: 20px;">
            ${message}
        </div>
    `;
}

const DEFAULT_CITY = 'Seoul';
const DEFAULT_COORD = {
    lat: 37.5683,
    lon: 126.9778
};

// 한국 주요 도시 이름 한글 매핑
const CITY_NAMES = {
    'Seoul': '서울',
    'Busan': '부산',
    'Incheon': '인천',
    'Daegu': '대구',
    'Daejeon': '대전',
    'Gwangju': '광주',
    'Suwon': '수원',
    'Ulsan': '울산',
    'Sejong': '세종',
    'Jeju': '제주'
};

let currentCity = DEFAULT_CITY;
let currentCoord = DEFAULT_COORD;

function getKoreanCityName(cityName) {
    return CITY_NAMES[cityName] || cityName;
}

function updateWeatherTitle(cityName) {
    const title = document.querySelector('.weather-title');
    if (title) {
        title.innerHTML = `오늘의 날씨 <div class="weather-city-name">🚩 ${getKoreanCityName(cityName)}</div>`;
    }
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                currentCoord = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                // 좌표로 도시 이름 가져오기
                fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${currentCoord.lat}&lon=${currentCoord.lon}&limit=1&appid=${API_KEY}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data[0]) {
                            currentCity = data[0].name;
                            updateWeatherTitle(currentCity);
                            fetchWeather();
                        }
                    })
                    .catch(() => {
                        currentCity = DEFAULT_CITY;
                        currentCoord = DEFAULT_COORD;
                        updateWeatherTitle(currentCity);
                        fetchWeather();
                    });
            },
            error => {
                console.log('위치 정보를 가져올 수 없습니다:', error);
                currentCity = DEFAULT_CITY;
                currentCoord = DEFAULT_COORD;
                updateWeatherTitle(currentCity);
                fetchWeather();
            }
        );
    } else {
        console.log('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
        currentCity = DEFAULT_CITY;
        currentCoord = DEFAULT_COORD;
        updateWeatherTitle(currentCity);
        fetchWeather();
    }
}

function fetchWeather() {
    const weatherDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    if (!weatherDiv) return;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${API_KEY}&lang=kr&units=metric`)
        .then(res => res.json())
        .then(data => {
            weatherDiv.innerHTML = `<div>${data.weather[0].description}</div><div>${Math.round(data.main.temp)}°C</div>`;
            weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon">`;
        });
}

function fetchForecast(dateStr) {
    const group = document.getElementById('weather-forecast-group');
    if (!group) return;
    group.innerHTML = '';

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${currentCoord.lat}&lon=${currentCoord.lon}&appid=${API_KEY}&lang=kr&units=metric`)
    .then(res => res.json())
    .then(data => {
        // dateStr: 'YYYY-MM-DD'와 일치하는 데이터만 추출
        const list = data.list.filter(item => item.dt_txt.startsWith(dateStr));
        // 특정 시간대만 추출
        const hours = ['06:00:00', '09:00:00', '12:00:00', '15:00:00', '18:00:00'];
        const filtered = hours.map(hh => list.find(item => item.dt_txt.endsWith(hh))).filter(Boolean);
        if (filtered.length === 0) {
            group.innerHTML += '<span>예보 데이터가 없습니다.</span>';
            return;
        }
        const html = filtered.map(f => `
            <div class="weather-forecast-item">
                <div class="weather-forecast-time">${f.dt_txt.slice(11, 16)}</div>
                <div class="weather-forecast-icon"><img src='https://openweathermap.org/img/wn/${f.weather[0].icon}.png' alt="icon"></div>
                <div class="weather-forecast-temp">${Math.round(f.main.temp)}°C</div>
            </div>
        `).join('');
        group.innerHTML += `<div class="weather-forecast-list">${html}</div>`;
    })
    .catch(() => {
        group.innerHTML += '<span>날씨 예보를 불러올 수 없습니다.</span>';
    });
}

// 페이지 로드 시 위치 정보 가져오기
document.addEventListener('DOMContentLoaded', getLocation);

window.fetchWeather = fetchWeather;
window.fetchForecast = fetchForecast;

// 현재 날씨 정보 가져오기
async function getCurrentWeather() {
    try {
        const response = await fetch(`${API_BASE_URL}/weather?city=${currentCity}`);
        if (!response.ok) {
            throw new Error('날씨 정보를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        showError(error.message);
        return null;
    }
}

// 날씨 예보 가져오기
async function getWeatherForecast() {
    try {
        const response = await fetch(`${API_BASE_URL}/forecast?lat=${currentCoord.lat}&lon=${currentCoord.lon}`);
        if (!response.ok) {
            throw new Error('날씨 예보를 가져오는데 실패했습니다.');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        showError(error.message);
        return null;
    }
}