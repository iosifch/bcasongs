# Unit Tests — Run unit tests with Vitest

## Purpose
Run the project's unit test suite using Vitest and report results.

## Execution environment
All commands **must be run inside the Docker container** using `docker compose exec`:

```bash
docker compose exec app <command>
```

## Test framework details
- **Runner**: Vitest
- **Environment**: happy-dom
- **Globals**: enabled (no need to import `describe`, `it`, `expect`)
- **Config file**: `vitest.config.js`

## Test file conventions
- Test files use the `.spec.js` suffix
- Tests are co-located with source files inside `src/`:
  - `src/composables/*.spec.js`
  - `src/services/*.spec.js`

## Steps

### 1. Run all tests (single run)
```bash
docker compose exec app npm run test:run
```
This executes all `.spec.js` files once and exits with a status code (0 = pass, 1 = fail).

**Use this mode when**: verifying code changes, CI pipelines, or when asked to "run the tests".

### If the command fails with a container error
If step 1 fails with an error like `no container found` or `service "app" is not running`, the Docker container is not started. In this case:

1. **Start the dev server** by following the `skills/dev-server.md` skill
2. **Retry** the test command from step 1

### 2. Run tests in watch mode (interactive development)
```bash
docker compose exec app npm test
```
This starts Vitest in watch mode — tests re-run automatically when source files change.

**Use this mode when**: the user is actively developing and wants continuous feedback.

### 3. Run a specific test file
```bash
docker compose exec app npx vitest run src/services/SongsRepository.spec.js
```
Replace the path with the relevant test file.

### 4. Run tests matching a pattern
```bash
docker compose exec app npx vitest run --reporter=verbose -t "test name pattern"
```

## Interpreting results
- **✓ (green)**: test passed
- **✗ (red)**: test failed — read the assertion error and diff to understand the failure
- **Summary line**: shows total tests, passed, failed, and duration

## On failure
1. Read the error message and stack trace
2. Identify the failing assertion
3. Check the relevant source file for the bug
4. Fix the issue and re-run the failing test to confirm

## Important
- Always use `docker compose exec app npm run test:run` (single run) unless the user explicitly asks for watch mode
- Do **not** modify test files to make them pass unless explicitly asked
- Report test results clearly: number of tests passed/failed and which ones failed
