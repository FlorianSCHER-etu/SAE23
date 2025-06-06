# 🌦️ Instant Weather V2

**Instant Weather V2** est une application web moderne, responsive et accessible, qui permet d'afficher les prévisions météo de n'importe quelle commune française à partir d’un code postal. Elle utilise les données de l’API Météo Concept et de l’API Géo du gouvernement, avec une carte interactive grâce à Leaflet.

---

##  Hébergement

>  **Remarque importante concernant GitHub** :

Le site **n'est pas hébergé via mon compte principal GitHub**, car celui-ci est actuellement **introuvable ou inaccessible**.  
Pour contourner ce problème, **un second compte GitHub a été créé uniquement à des fins d’hébergement et les commits principale sont expliqués à la fin**. Le dossier images montrera le problème rencontrés ainsi que les commits réalisé sur le compte innaccessible  
Cela explique pourquoi les commits ne sont pas associés à mon compte principal.

 Accès en ligne : [InstantWeather-SCHER-Florian](https://florianscher-etu.github.io/SAE23/)

 <img width="1279" alt="image" src="https://github.com/user-attachments/assets/ee75d399-e256-4f31-94e0-2912f6ddf724" />


---

##  Fonctionnalités principales

- Recherche météo par code postal + sélection dynamique de la commune
- Prévisions météo de 1 à 7 jours
- Affichage conditionnel :
  - Latitude / Longitude
  - Précipitations
  - Vitesse et direction du vent
  - Carte interactive Leaflet
- Historique des 5 dernières recherches
- Thème clair / sombre dynamique
- Design responsive (mobile-friendly)
- Gestion des erreurs et messages utilisateur
- Détection de chargement (spinner)
- Accessibilité (ARIA, navigation clavier)
- Optimisation des performances avec debounce

---

##  Architecture du projet

```
project-root/
├── index.html        ← Structure HTML
├── script.js         ← Logique JavaScript
├── style.css         ← Design & animations
```

---

##  Technologies utilisées

| Technologie       | Rôle                                               |
|-------------------|----------------------------------------------------|
| HTML5             | Structure sémantique                               |
| CSS3              | Thèmes, responsive design, animations              |
| JavaScript (ES6+) | Logique, gestion des API, interface utilisateur    |
| Leaflet.js        | Carte interactive                                  |
| API Géo           | Recherche de communes à partir d’un code postal   |
| API Météo Concept | Prévisions météo                                   |
| Web Storage       | Historique temporaire en mémoire                   |
| Google Fonts      | Typographie moderne ("Inter")                      |

---

##  Installation et utilisation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/FlorianSCHER/SAE23-InstanWeather
   cd instant-weather-v2
   ```

2. **Lancer l’application** :
   Ouvrir simplement `index.html` dans un navigateur :
   ```bash
   open index.html
   ```

> **Aucune dépendance serveur requise**. L'application est entièrement **client-side**.

---

##  Structure des fichiers

### `index.html`
- Formulaire (code postal, commune, nombre de jours)
- Checkboxes : latitude, longitude, pluie, vent, carte
- Sections : carte Leaflet, météo, historique
- Lien vers `script.js` et `style.css`

### `script.js`
- Sélection DOM centralisée
- Classes :
  - `MapManager` : gestion de la carte Leaflet
  - `SearchHistory` : gestion historique en mémoire
  - `ThemeManager` : thème clair/sombre + raccourcis clavier
- Appels API, gestion erreurs, affichage dynamique
- Détection nombre de jours à afficher

### `style.css`
- Thèmes clair/sombre avec CSS variables
- Animations (`hover`, `slideIn`, `spin`)
- Responsive : media queries, flex, grid
- Accessibilité : focus visible, transitions douces

---

## Bonnes pratiques

- Séparation stricte HTML / CSS / JS
- Utilisation de `aria-*` pour l'accessibilité
- Design mobile-first
- Code lisible, commenté
- Messages d’erreur clairs et animés

---

##  Liste des commits

> Tous ces commits ont été faits via un **compte secondaire** uniquement dédié au déploiement, car **le compte principal est actuellement inaccessible**.

<img width="578" alt="image" src="https://github.com/user-attachments/assets/0022ead0-784f-4333-a642-6842870ea937" />

### Commit 1
**Message** : `feat: initial structure with basic HTML layout and minimal CSS`  
- Structure HTML de base
- CSS avec design responsive
- Pas encore de JavaScript

---

### Commit 2  
**Message** : `feat: add postal code lookup and commune selection`  
- Requête vers l’API `geo.api.gouv.fr`
- Sélection dynamique des communes
- Validation du code postal
- Gestion erreurs et chargement

---

### Commit 3  
**Message** : `feat: implement dark mode toggle with localStorage persistence`  
- Thème sombre avec CSS variables
- Sauvegarde du thème dans `localStorage`
- Transitions animées

---

### Commit 4  
**Message** : `feat: integrate weather API and display forecast cards`  
- Intégration de l’API `meteo-concept.com`
- Affichage des cartes météo
- Icônes dynamiques, styles météo
- Corrections de jours excédentaires

---

### Commit 5  
**Message** : `feat: add search history with localStorage persistence`  
- Sauvegarde des recherches en mémoire
- Interface de relance via boutons
- Pré-remplissage du formulaire
- Limitation à 5 éléments uniques
- Correctifs sur l'affichage des jours météo

---

### Commit 6  
**Message** : `feat: add interactive Leaflet map with theme support`  
- Carte Leaflet centrée sur la France
- Marqueurs et popups interactifs
- Adaptation automatique au thème
- Transitions et responsive
- Intégration dans le workflow et historique

---

##  À améliorer (TODO)

- Localisation multilingue
- Passer l’historique à `localStorage` si nécessaire
- Ajout de graphiques (température, pluie)

---

##  Auteur

> Réalisé par **SCHER Florian** dans le cadre du projet **SAE23** (BUT Réseaux & Télécoms)  
> L’**IA** a été utilisée pour le **debug** et le **déploiement Leaflet**

---

## Conformité

- Respect des normes **W3C**
- Accessibilité renforcée (ARIA, navigation clavier)
- Fonctionne sur navigateurs modernes

---

## APIs utilisées

### [API Météo Concept](https://api.meteo-concept.com/)
- Prévisions journalières / horaires
- Requiert une clé (token)
- Données utilisées : météo, température, vent, pluie

### [API Géo (gouv.fr)](https://geo.api.gouv.fr/)
- Recherche des communes françaises par code postal
- Réponses en JSON

### [Leaflet.js](https://leafletjs.com/)
- Bibliothèque cartographique
- Affichage des localisations sur carte OpenStreetMap

---

##  Inspirations & sources

- [Leaflet Examples](https://leafletjs.com/examples.html)
- Design inspiré par : Tailwind UI, Dribbble
- Patterns JS (debounce, gestion erreurs)
- Références : MDN Web Docs, OpenClassrooms, StackOverflow
