# Build image
FROM node:22.14.0 AS build
# Set container working directory to /app
WORKDIR /app
# Copy npm instructions
COPY package*.json ./
# Set npm cache to a directory the non-root user can access
RUN npm config set cache /app/.npm-cache --global
# Install dependencies with npm ci (exact versions in the lockfile), suppressing warnings
RUN npm ci --loglevel=error
# Copy app (useless stuff is ignored by .dockerignore)
COPY . .
# Build the app
RUN npm run build
# Delete all non-production dependencies to make copy in line 28 more efficient
RUN npm prune --omit=dev

# Use small production image
FROM node:22.14.0-alpine AS runtime
# Set the env to "production"
ENV NODE_ENV=production
# Set npm cache to a directory the non-root user can access
RUN npm config set cache /app/.npm-cache --global
# Set container working directory to /app
WORKDIR /app
# Copy the built Next.js app and production dependencies
COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/.next ./.next
COPY --chown=node:node --from=build /app/public ./public

# Set a non-root user
USER node
# Expose port for Next.js
EXPOSE 3000
# Start app
CMD ["npm", "start", "--", "-H", "0.0.0.0"]
