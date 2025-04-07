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

# Set environment variables
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
