# Use an appropriate base image for your service
FROM node:18-alpine

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

# Install yt-dlp
RUN pip3 install yt-dlp --break-system-packages

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
