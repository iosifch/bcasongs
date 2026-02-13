# AGENTS.md

## 1. Business Needs
This application serves as a digital songbook. It allows users to manage, view, and organize song lyrics and chords, facilitating smooth live performances and rehearsals while handling setlists efficiently.

## 2. Features
- **Song Library**: Browse and search a comprehensive collection of songs.
- **Song Details**: View lyrics and chords rendered from ChordPro format.
- **Playlists/Setlists**: Create, manage, and share lists of songs.
- **User Authentication**: Logged-in users can **edit songs** and **create/manage playlists**.

## 3. Technical Structure & Environment

### Structure
- **Views**: Located in `src/views`, representing main pages (SongList, SongDetail, Playlist).
- **Components**: Reusable UI elements in `src/components`.
- **Services**: Business logic and data access (e.g., `SongsRepository`, `ChordProService`) in `src/services`.
- **Router**: Navigation logic defined in `src/router/index.js`.

### Technology Stack
- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **UI Framework**: Vuetify 3
- **Backend/Persistence**: Firebase (Firestore)
- **Runtime Environment**: Node.js (via Docker)

### Environment Configuration
- **Docker**: The project is containerized using `Dockerfile` (node:lts-alpine) and `docker-compose.yml`.
- **Environment Variables**: Managed via `.env` files.

## 4. Testing & Development

### Strict Development Rule
> [!IMPORTANT]
> **ALL development commands must be executed within the running Docker container.**
> Do not run `npm` commands directly on the host machine. Instead, use `docker compose exec`.
> It is assumed that the container is already running.

### Commands
- **Run Development Server (Detached)**:
  ```bash
  docker compose up -d
  ```
- **Install Dependencies**:
  ```bash
  docker compose exec app npm install
  ```
- **Run Tests (Watch Mode)**:
  ```bash
  docker compose exec app npm test
  ```
- **Run Tests (Single Run)**:
  ```bash
  docker compose exec app npm run test:run
  ```

### Testing Framework
- **Vitest** is used for unit and component testing.
- Tests are located alongside source files (e.g., `src/services/SongsRepository.spec.js`).

## 5. Development Guidelines

### Code Style & Best Practices
- **Vue.js**:
  - specifically use the **Composition API** with `<script setup>`.
  - logic should be extracted into composables or services where possible.
- **Vuetify**:
  - Use native Vuetify 3 components (e.g., `<v-card>`, `<v-btn>`) for all UI elements.
  - Follow Material Design principles.
- **JavaScript**:
  - Use modern ES Modules syntax.
  - Ensure code is clean, readable, and well-documented.
  - Use `async/await` for asynchronous operations.
