FROM node:lts-alpine

WORKDIR /app

# Install dependencies first to leverage cache
COPY package.json package-lock.json* ./

# Update npm to latest version to avoid warnings
RUN npm install -g npm@latest

# We don't run npm install here because we want to run it in the running container 
# to ensure node_modules are synced if using volumes, or we can run it here.
# However, for dev, we often mount the volume. 
# Let's install here to have a base, but the volume mount might hide it.
# A common pattern for dev is to install in the entrypoint or manually.
# For this setup, we'll assume the user runs `npm install` via `docker compose run` or `exec`.
# But to make it easier, let's just expose the port.

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
