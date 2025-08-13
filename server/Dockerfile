FROM node:18-slim

WORKDIR /app

# Install build dependencies for sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy server source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Create data directory for database
RUN mkdir -p data

# Set proper permissions
RUN chmod 755 uploads
RUN chmod 755 data

# Expose port
EXPOSE 5000

# Start the server - fix the path
CMD ["node", "index.js"]
