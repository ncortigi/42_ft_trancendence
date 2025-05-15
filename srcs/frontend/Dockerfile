FROM node:18-alpine

WORKDIR /app

# Copy only package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Create logs directory
RUN mkdir -p /app/logs

# Copy the rest of the application
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]