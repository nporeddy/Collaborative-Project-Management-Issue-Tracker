# syntax=docker/dockerfile:1.7

# ---------- STAGE 1: Builder ----------
# Builds the React app with Vite into static files
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time arg — passed at docker build via --build-arg
ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=$VITE_API_URL

# Install deps first for layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---------- STAGE 2: Production ----------
# Tiny nginx image just to serve the static files
FROM nginx:alpine AS production

# Replace default nginx config with our SPA-friendly one
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files into nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]