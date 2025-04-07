FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create log directory
RUN mkdir -p logs

# Set environment variables
ENV NODE_ENV=production
