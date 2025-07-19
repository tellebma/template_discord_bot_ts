FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Remove source files after build
RUN rm -rf src/ tsconfig.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S botuser -u 1001

# Change ownership of app directory
RUN chown -R botuser:nodejs /app
USER botuser

EXPOSE 3000

CMD ["npm", "start"]