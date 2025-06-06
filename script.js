// =============================================================================
// Configuration de l'API Météo Concept
// =============================================================================
const API_TOKEN = 'bb6a7662777718c0c42a70b7f4ef03df56b77efe2cea3f3f2b857b1106adb8b8';
const API_BASE_URL = 'https://api.meteo-concept.com/api';

// =============================================================================
// Sélection des éléments DOM principaux
// =============================================================================
const form = document.getElementById('weatherForm');
const weatherResults = document.getElementById('weatherResults');
const postalInput = document.getElementById('postalCodeInput');
const communeSelect = document.getElementById('communeSelect');
const daysSelect = document.getElementById('daysSelect');
const themeToggle = document.getElementById('themeToggle');
const searchHistorySection = document.getElementById('searchHistory');
const historyButtonsContainer = document.getElementById('historyButtons');
const mapContainer = document.getElementById('mapContainer');
const mapElement = document.getElementById('map');

const additionalInfoCheckboxes = document.getElementById('additionalInfo');
const latitudeCheckbox = document.getElementById('showLatitude');
const longitudeCheckbox = document.getElementById('showLongitude');
const rainCheckbox = document.getElementById('showRain');
const windSpeedCheckbox = document.getElementById('showWindSpeed');
const windDirectionCheckbox = document.getElementById('showWindDirection');
const mapCheckbox = document.getElementById('showMap');

// =============================================================================
// Gestion de la carte Leaflet
// =============================================================================
class MapManager {
  constructor() {
    this.map = null;
    this.marker = null;
    this.isInitialized = false;
  }

  initializeMap() {
    if (this.isInitialized) return;

    try {
      // Initialiser la carte Leaflet centrée sur la France
      this.map = L.map(mapElement).setView([46.603354, 1.888334], 6);

      // Ajouter les tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(this.map);

      this.isInitialized = true;
      console.log('Carte initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
      showMessage('Erreur lors du chargement de la carte', 'error');
    }
  }

  showLocation(communeData) {
    if (!this.isInitialized) {
      this.initializeMap();
    }

    if (!this.map) {
      console.error('Carte non initialisée');
      return;
    }

    try {
      const lat = communeData.lat;
      const lon = communeData.lon;

      // Supprimer le marqueur précédent s'il existe
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      // Créer un nouveau marqueur avec popup informatif
      this.marker = L.marker([lat, lon]).addTo(this.map);
      
      // Contenu du popup avec informations détaillées
      const popupContent = `
        <div class="map-popup">
          <h3>📍 ${communeData.nom}</h3>
          <p><strong>Code INSEE:</strong> ${communeData.code}</p>
          <p><strong>Coordonnées:</strong></p>
          <p>• Latitude: ${lat.toFixed(6)}°</p>
          <p>• Longitude: ${lon.toFixed(6)}°</p>
          <p><em>Prévisions météo disponibles</em></p>
        </div>
      `;

      this.marker.bindPopup(popupContent).openPopup();

      // Centrer la carte sur la commune avec un zoom approprié
      this.map.setView([lat, lon], 12, {
        animate: true,
        duration: 1.0
      });

      // Afficher le conteneur de la carte avec animation
      mapContainer.style.display = 'block';
      
      // Forcer le redimensionnement de la carte après l'affichage
      setTimeout(() => {
        this.map.invalidateSize();
      }, 300);

      showMessage(`Carte centrée sur ${communeData.nom}`, 'success');
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la localisation:', error);
      showMessage('Erreur lors de l\'affichage de la localisation sur la carte', 'error');
    }
  }

  hideMap() {
    mapContainer.style.display = 'none';
  }

  updateMapTheme(isDark) {
    if (!this.map || !this.isInitialized) return;

    // Appliquer les filtres CSS pour le mode sombre via JavaScript
    const mapPane = this.map.getContainer();
    if (isDark) {
      mapPane.style.filter = 'brightness(0.8) contrast(1.2) hue-rotate(180deg)';
    } else {
      mapPane.style.filter = '';
    }
  }
}

const mapManager = new MapManager();

// =============================================================================
// Gestion de l'historique des recherches
// =============================================================================
class SearchHistory {
  constructor() {
    this.maxHistoryItems = 5;
    this.historyKey = 'weatherSearchHistory';
    this.loadHistory();
    this.updateHistoryDisplay();
  }

  loadHistory() {
    // Utilisation de variables en mémoire plutôt que localStorage
    this.history = window.weatherSearchHistory || [];
  }

  saveHistory() {
    // Stockage en mémoire plutôt que localStorage
    window.weatherSearchHistory = this.history;
  }

  addSearch(communeData, days, options) {
    const searchItem = {
      commune: communeData,
      days: days,
      options: options,
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random().toString(36).substr(2, 9)
    };

    // Supprimer l'élément s'il existe déjà (éviter les doublons)
    this.history = this.history.filter(item => 
      !(item.commune.code === communeData.code && item.days === days)
    );

    // Ajouter au début de la liste
    this.history.unshift(searchItem);

    // Limiter à maxHistoryItems éléments
    if (this.history.length > this.maxHistoryItems) {
      this.history = this.history.slice(0, this.maxHistoryItems);
    }

    this.saveHistory();
    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    if (this.history.length === 0) {
      searchHistorySection.style.display = 'none';
      return;
    }

    searchHistorySection.style.display = 'block';
    historyButtonsContainer.innerHTML = '';

    this.history.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'history-button';
      button.innerHTML = `
        <span>${item.commune.nom}</span>
        <small>${item.days} jour${item.days > 1 ? 's' : ''}</small>
      `;
      
      button.addEventListener('click', () => {
        this.replaySearch(item);
      });

      historyButtonsContainer.appendChild(button);
    });
  }

  async replaySearch(searchItem) {
    try {
      // Remplir le formulaire avec les données de l'historique
      postalInput.value = searchItem.commune.code.substring(0, 5); // Extraire le code postal du code INSEE
      
      // Simuler la recherche de communes
      await this.populateCommunes(searchItem.commune.code.substring(0, 5));
      
      // Sélectionner la commune
      const communeOption = Array.from(communeSelect.options).find(option => {
        if (!option.value) return false;
        const optionData = JSON.parse(option.value);
        return optionData.code === searchItem.commune.code;
      });
      
      if (communeOption) {
        communeSelect.value = communeOption.value;
        daysSelect.disabled = false;
      }

      // Définir le nombre de jours
      daysSelect.value = searchItem.days.toString();

      // Définir les options
      latitudeCheckbox.checked = searchItem.options.showLatitude;
      longitudeCheckbox.checked = searchItem.options.showLongitude;
      rainCheckbox.checked = searchItem.options.showRain;
      windSpeedCheckbox.checked = searchItem.options.showWindSpeed;
      windDirectionCheckbox.checked = searchItem.options.showWindDirection;
      mapCheckbox.checked = searchItem.options.showMap;

      // Lancer la recherche automatiquement
      const weatherData = await getWeatherData(searchItem.commune.lat, searchItem.commune.lon, searchItem.days);
      displayWeatherResults(weatherData, searchItem.commune, searchItem.options);
      
      showMessage(`Recherche relancée pour ${searchItem.commune.nom}`, 'success');
    } catch (error) {
      showMessage('Erreur lors de la relance de la recherche', 'error');
      console.error('Erreur replay:', error);
    }
  }

  async populateCommunes(codePostal) {
    try {
      const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=nom,code,centre&format=json`);
      if (!response.ok) throw new Error('Erreur réseau');
      const communes = await response.json();

      if (communes.length === 0) {
        communeSelect.innerHTML = '<option value="">Aucune commune trouvée</option>';
        return;
      }

      communeSelect.innerHTML = '<option value="">-- Sélectionnez une commune --</option>';
      communes.forEach(commune => {
        const option = document.createElement('option');
        option.value = JSON.stringify({
          code: commune.code,
          nom: commune.nom,
          lat: commune.centre.coordinates[1],
          lon: commune.centre.coordinates[0]
        });
        option.textContent = commune.nom;
        communeSelect.appendChild(option);
      });
    } catch (err) {
      communeSelect.innerHTML = '<option value="">Erreur de récupération</option>';
      throw err;
    }
  }

  clearHistory() {
    this.history = [];
    this.saveHistory();
    this.updateHistoryDisplay();
    showMessage('Historique effacé', 'info');
  }
}

const searchHistory = new SearchHistory();

// =============================================================================
// Gestion des thèmes (clair/sombre)
// =============================================================================
class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || this.getPreferredTheme();
    this.initTheme();
    this.setupEventListeners();
  }

  getStoredTheme() {
    // Utilisation de variables en mémoire plutôt que localStorage
    return window.storedTheme || null;
  }

  getPreferredTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  setStoredTheme(theme) {
    // Stockage en mémoire plutôt que localStorage
    window.storedTheme = theme;
  }

  initTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.updateThemeIcon();
    // Mettre à jour le thème de la carte
    mapManager.updateMapTheme(this.currentTheme === 'dark');
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.setStoredTheme(this.currentTheme);
    this.updateThemeIcon();

    // Mettre à jour le thème de la carte
    mapManager.updateMapTheme(this.currentTheme === 'dark');

    themeToggle.style.transform = 'translateY(-50%) scale(0.8)';
    setTimeout(() => {
      themeToggle.style.transform = 'translateY(-50%) scale(1)';
    }, 150);

    showMessage(`Mode ${this.currentTheme === 'dark' ? 'sombre' : 'clair'} activé`, 'info');
  }

  updateThemeIcon() {
    const themeIcon = themeToggle.querySelector('.theme-icon');
    themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
    themeToggle.setAttribute('aria-label',
      this.currentTheme === 'light' ?
        'Activer le mode sombre' :
        'Activer le mode clair'
    );
  }

  setupEventListeners() {
    themeToggle.addEventListener('click', () => this.toggleTheme());

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!this.getStoredTheme()) {
        this.currentTheme = e.matches ? 'dark' : 'light';
        this.initTheme();
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }
}

const themeManager = new ThemeManager();

// =============================================================================
// Validation d'un code postal français
// =============================================================================
function validatePostalCode(code) {
  return /^\d{5}$/.test(code);
}

// =============================================================================
// Recherche des communes associées à un code postal
// =============================================================================
postalInput.addEventListener('input', debounce(async () => {
  const codePostal = postalInput.value.trim();
  communeSelect.innerHTML = '<option value="">Chargement...</option>';
  daysSelect.disabled = true;

  if (codePostal.length === 5 && validatePostalCode(codePostal)) {
    try {
      const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${codePostal}&fields=nom,code,centre&format=json`);
      if (!response.ok) throw new Error('Erreur réseau');
      const communes = await response.json();

      if (communes.length === 0) {
        communeSelect.innerHTML = '<option value="">Aucune commune trouvée</option>';
        return;
      }

      communeSelect.innerHTML = '<option value="">-- Sélectionnez une commune --</option>';
      communes.forEach(commune => {
        const option = document.createElement('option');
        option.value = JSON.stringify({
          code: commune.code,
          nom: commune.nom,
          lat: commune.centre.coordinates[1],
          lon: commune.centre.coordinates[0]
        });
        option.textContent = commune.nom;
        communeSelect.appendChild(option);
      });

      showMessage(`${communes.length} commune(s) trouvée(s)`, 'success');
    } catch (err) {
      communeSelect.innerHTML = '<option value="">Erreur de récupération</option>';
      showMessage('Impossible de récupérer les communes.', 'error');
      console.error(err);
    }
  } else {
    communeSelect.innerHTML = '<option value="">Entrez un code postal valide</option>';
  }
}, 300));

// =============================================================================
// Activation du sélecteur de jours après sélection de la commune
// =============================================================================
communeSelect.addEventListener('change', () => {
  daysSelect.disabled = !communeSelect.value;
  if (communeSelect.value) {
    const communeData = JSON.parse(communeSelect.value);
    showMessage(`Commune sélectionnée : ${communeData.nom}`, 'success');
    
    // Afficher automatiquement la localisation sur la carte si l'option est cochée
    if (mapCheckbox.checked) {
      mapManager.showLocation(communeData);
    }
  }
});

// =============================================================================
// Gestion de la checkbox de la carte
// =============================================================================
mapCheckbox.addEventListener('change', () => {
  if (mapCheckbox.checked && communeSelect.value) {
    const communeData = JSON.parse(communeSelect.value);
    mapManager.showLocation(communeData);
  } else {
    mapManager.hideMap();
  }
});

// =============================================================================
// Récupération des prévisions météorologiques
// =============================================================================
async function getWeatherData(lat, lon, days) {
  try {
    showMessage('Récupération des données météo...', 'info');

    const forecastResponse = await fetch(`${API_BASE_URL}/forecast/daily?token=${API_TOKEN}&latlng=${lat},${lon}&days=${days}`);
    if (!forecastResponse.ok) throw new Error(`Erreur API météo: ${forecastResponse.status}`);

    const forecastData = await forecastResponse.json();

    const currentResponse = await fetch(`${API_BASE_URL}/observations/around?token=${API_TOKEN}&latlng=${lat},${lon}`);
    const currentData = currentResponse.ok ? await currentResponse.json() : null;

    return { forecast: forecastData, current: currentData };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// =============================================================================
// Affichage des résultats météorologiques
// =============================================================================
function displayWeatherResults(weatherData, communeData, selectedOptions, requestedDays) {
  const { forecast } = weatherData;

  if (!forecast || !forecast.forecast) {
    showMessage('Données météo indisponibles', 'error');
    return;
  }

  weatherResults.innerHTML = '';

  const title = document.createElement('h2');
  title.textContent = `Prévisions pour ${communeData.nom}`;
  title.className = 'weather-title';
  weatherResults.appendChild(title);

  // Afficher la carte si l'option est cochée
  if (selectedOptions.showMap) {
    mapManager.showLocation(communeData);
  } else {
    mapManager.hideMap();
  }

  if (selectedOptions.showLatitude || selectedOptions.showLongitude) {
    const locationInfo = document.createElement('div');
    locationInfo.className = 'location-info card';
    locationInfo.innerHTML = `
      <h3>Informations géographiques</h3>
      ${selectedOptions.showLatitude ? `<p><strong>Latitude:</strong> ${communeData.lat.toFixed(6)}°</p>` : ''}
      ${selectedOptions.showLongitude ? `<p><strong>Longitude:</strong> ${communeData.lon.toFixed(6)}°</p>` : ''}
    `;
    weatherResults.appendChild(locationInfo);
  }

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'weather-cards-container';

  // FIX: Limiter le nombre de cartes affichées au nombre de jours demandés
  const daysToShow = Math.min(forecast.forecast.length, requestedDays || forecast.forecast.length);
  
  for (let i = 0; i < daysToShow; i++) {
    const day = forecast.forecast[i];
    const card = createWeatherCard(day, i, selectedOptions);
    cardsContainer.appendChild(card);
  }

  weatherResults.appendChild(cardsContainer);
  showMessage(`${daysToShow} jour${daysToShow > 1 ? 's' : ''} de prévisions affichées`, 'success');
}

// =============================================================================
// Création d'une carte météo individuelle
// =============================================================================
function createWeatherCard(dayData, index, options) {
  const card = document.createElement('div');
  card.className = 'weather-card card';

  const date = new Date(dayData.datetime);
  const dayName = index === 0 ? 'Aujourd\'hui' :
    index === 1 ? 'Demain' :
    date.toLocaleDateString('fr-FR', { weekday: 'long' });

  const weatherIcon = getWeatherIcon(dayData.weather);

  let cardContent = `
    <div class="weather-card-header">
      <h3>${dayName}</h3>
      <div class="weather-date">${date.toLocaleDateString('fr-FR')}</div>
    </div>
    <div class="weather-main">
      <div class="weather-icon">${weatherIcon}</div>
      <div class="weather-temp">
        <span class="temp-max">${Math.round(dayData.tmax)}°</span>
        <span class="temp-min">${Math.round(dayData.tmin)}°</span>
      </div>
    </div>
    <div class="weather-description">
      ${getWeatherDescription(dayData.weather)}
    </div>
  `;

  const additionalInfo = [];

  if (options.showRain && dayData.rr1) {
    additionalInfo.push(`Pluie : ${dayData.rr1} mm`);
  }

  if (options.showWindSpeed && dayData.wind10m) {
    additionalInfo.push(`Vent : ${Math.round(dayData.wind10m)} km/h`);
  }

  if (options.showWindDirection && dayData.dirwind10m !== undefined) {
    const windDirection = getWindDirection(dayData.dirwind10m);
    additionalInfo.push(`Direction : ${windDirection} (${dayData.dirwind10m}°)`);
  }

  if (additionalInfo.length > 0) {
    cardContent += `
      <div class="weather-additional">
        ${additionalInfo.map(info => `<div class="additional-item">${info}</div>`).join('')}
      </div>
    `;
  }

  card.innerHTML = cardContent;
  return card;
}

// =============================================================================
// Gestion de la soumission du formulaire
// =============================================================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!communeSelect.value) {
    showMessage('Veuillez sélectionner une commune', 'error');
    return;
  }

  const communeData = JSON.parse(communeSelect.value);
  const days = parseInt(daysSelect.value);
  
  const selectedOptions = {
    showLatitude: latitudeCheckbox.checked,
    showLongitude: longitudeCheckbox.checked,
    showRain: rainCheckbox.checked,
    showWindSpeed: windSpeedCheckbox.checked,
    showWindDirection: windDirectionCheckbox.checked,
    showMap: mapCheckbox.checked
  };

  try {
    const weatherData = await getWeatherData(communeData.lat, communeData.lon, days);
    displayWeatherResults(weatherData, communeData, selectedOptions, days);
    
    // Ajouter à l'historique après une recherche réussie
    searchHistory.addSearch(communeData, days, selectedOptions);
    
  } catch (error) {
    showMessage('Erreur lors de la récupération des données météo', 'error');
    console.error('Erreur météo:', error);
  }
});

// =============================================================================
// Fonctions utilitaires
// =============================================================================
function getWeatherIcon(code) {
  const icons = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 4: '🌫️',
    10: '🌦️', 11: '🌧️', 12: '🌧️', 13: '⛈️', 14: '⛈️', 15: '⛈️',
    20: '🌨️', 21: '🌨️', 22: '❄️', 30: '🌪️'
  };
  return icons[code] || '🌤️';
}

function getWeatherDescription(code) {
  const descriptions = {
    0: 'Soleil', 1: 'Peu nuageux', 2: 'Ciel voilé', 3: 'Nuageux', 4: 'Très nuageux',
    10: 'Pluie faible', 11: 'Pluie modérée', 12: 'Pluie forte',
    13: 'Pluie verglaçante faible', 14: 'Pluie verglaçante modérée', 15: 'Pluie verglaçante forte',
    20: 'Neige faible', 21: 'Neige modérée', 22: 'Neige forte',
    30: 'Pluie et neige', 40: 'Brouillard', 100: 'Orages'
  };
  return descriptions[code] || 'Conditions variables';
}

function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  return directions[Math.round(degrees / 22.5) % 16];
}

function showMessage(message, type = 'info') {
  const existingMessages = document.querySelectorAll(`.${type}-message`);
  existingMessages.forEach(msg => {
    msg.style.opacity = '0';
    msg.style.transform = 'translateY(-10px)';
    setTimeout(() => msg.remove(), 300);
  });

  const messageDiv = document.createElement('div');
  messageDiv.className = `${type}-message`;
  messageDiv.textContent = message;
  messageDiv.style.transition = 'all 0.3s ease';
  form.insertAdjacentElement('afterend', messageDiv);

  requestAnimationFrame(() => {
    messageDiv.style.opacity = '1';
    messageDiv.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(-10px)';
    setTimeout(() => messageDiv.remove(), 300);
  }, 4000);
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// =============================================================================
// Fonctions d'aide pour le développement
// =============================================================================
function clearSearchHistory() {
  searchHistory.clearHistory();
}

// Rendre la fonction disponible globalement pour les tests
window.clearSearchHistory = clearSearchHistory;

// =============================================================================
// Initialisation au chargement
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  showMessage(`Application initialisée - Thème : ${themeManager.currentTheme}`, 'info');
});