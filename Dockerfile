FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port defined in the application
EXPOSE 3000

# Install required dependencies
RUN apk add --no-cache bash

# Playwright browsers setup
RUN npx playwright install --with-deps chromium
