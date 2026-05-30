# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy configurations and source files
COPY tsconfig*.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY vite.config.ts ./
COPY index.html ./
COPY public/ ./public/
COPY src/ ./src/

# Compile & build the SPA bundle
RUN npm run build

# Stage 2: Serve the build via Nginx
FROM nginx:alpine

# Copy built artifacts from stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
