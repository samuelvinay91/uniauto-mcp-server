FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Install required dependencies
RUN apk add --no-cache bash

# Create log directory
RUN mkdir -p logs

# Playwright browsers setup
RUN npx playwright install --with-deps chromium
