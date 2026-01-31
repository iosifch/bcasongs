# Vue Songbook App Plan

## Architecture
- **Frontend Framework**: Vue 3 (Composition API)
- **UI Library**: Vuetify 3 (Latest Version) - utilizing idiomatic component structures (slots, props, defaults).
- **Build Tool**: Vite
- **Runtime**: Node.js (Latest LTS)
- **Containerization**: Docker & Docker Compose
- **Execution Strategy**: All commands (npm install, build, etc.) must be executed inside the Docker container.
- **Data Storage**: Local JSON files (simulating a database)

## Data Structure Strategy
We will use a simplified **ChordPro** format stored within JSON. This allows chords to be embedded directly in the text, making it easy to read and parse.

**Example `public/data/songs.json`:**
```json
[
  {
    "id": "1",
    "title": "Amazing Grace",
    "originalKey": "G",
    "content": "[G]Amazing grace how [C]sweet the [G]sound\nThat [G]saved a wretch like [D]me"
  }
]
```

## Implementation Steps

### 1. Project Initialization & Documentation
- **Action**: Create `PLAN.md` with this full plan.
- Initialize Vue 3 project with Vite.
- Install and configure Vuetify 3 (using the official Vite plugin for tree-shaking).
- Install Vue Router.

### 2. Docker Setup
- Create `Dockerfile` using `node:lts-alpine` (Latest LTS).
- Create `docker-compose.yml` to mount the source code and run the dev server.

### 3. Core Logic (The "Music Engine")
- **Parser**: Create a utility to parse the content string. It will split lines and separate chords from lyrics (e.g., converting `[G]Text` into structured objects for rendering).
- **Transposer**: Implement logic to shift musical notes (e.g., G -> A, C -> D). This requires a map of musical keys.

### 4. Data Layer
- Create a `SongService` to fetch and parse the JSON data.
- Store `songs.json` in the `public/` folder so it can be fetched via HTTP during development.

### 5. UI Implementation (Idiomatic Vuetify)
- **Layout**: Use `v-app`, `v-app-bar`, `v-main`, and `v-container` for structure.
- **Song List Page**:
    - Use `v-data-iterator` or `v-row`/`v-col` grid system for responsive cards.
    - Use `v-text-field` for search.
- **Song Detail Page**:
    - **Controls**: Use `v-btn-group` or `v-chip-group` for transposition controls.
    - **Lyrics Display**: A custom component that renders the parsed lines. It will display chords physically above the text using CSS flexbox or grid, styled with Vuetify utility classes where possible.

### 6. Testing & Refinement
- Verify transposition logic handles edge cases (sharp/flat keys).
- Ensure responsive design for mobile usage.
