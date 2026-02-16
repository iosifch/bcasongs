# GEMINI.md

## 1. Business Needs
This application serves as a digital songbook. It allows users to manage, view, and organize song lyrics and setlists, facilitating smooth live performances and rehearsals while handling musical keys efficiently.

## 2. Features
- **Song Library**: Browse and search a comprehensive collection of songs.
- **Song Details**: View lyrics and manage musical keys.
- **Playlists/Setlists**: Create, manage, and share lists of songs.
- **User Authentication**: Logged-in users can **edit songs** and **create/manage playlists**.

## 3. Technical Structure & Environment

### Structure
- **Views**: Located in `src/views`, representing main pages (SongList, SongDetail, Playlist).
- **Components**: Reusable UI elements in `src/components`.
- **Services**: Business logic and data access (e.g., `SongsRepository`, `LyricsService`) in `src/services`.
- **Router**: Navigation logic defined in `src/router/index.js`.

### Technology Stack
- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **UI Framework**: Vuetify 3
- **Backend/Persistence**: Firebase (Firestore)
- **Runtime Environment**: Node.js (via Docker)

### Environment Configuration & Rules
> [!IMPORTANT]
> **ALL development commands must be executed within the running Docker container.**
> Do not run `npm` commands directly on the host machine. Instead, use `docker compose exec`.
> It is assumed that the container is already running.
- **Docker**: The project is containerized using `Dockerfile` (node:lts-alpine) and `docker-compose.yml`.
- **Environment Variables**: Managed via `.env` files.
- **Start Development Server**: `docker compose up -d`
- **Install Dependencies**: `docker compose exec app npm install`

### Package Management
All package management commands must be run inside the container:
- **Install Package**: `docker compose exec app npm install <package_name>`
- **Uninstall Package**: `docker compose exec app npm uninstall <package_name>`
- **Audit Dependencies**: `docker compose exec app npm audit`

### Testing Instructions
- **Vitest** is used for unit and component testing.
- Tests are located alongside source files (e.g., `src/services/SongsRepository.spec.js`).
- **Run Tests (Watch Mode)**: `docker compose exec app npm test`
- **Run Tests (Single Run)**: `docker compose exec app npm run test:run`

### Git Workflow & Version Control
- **Commit Messages**: Must be descriptive and follow Conventional Commits (e.g., `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`).
- **Push Policy**: Commits and pushes to the repository are **ONLY** performed upon explicit request by the programmer.
- **Branch Specification**: Always specify the target branch in the push command. Use the branch requested by the programmer or, if unspecified, the current branch.

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
