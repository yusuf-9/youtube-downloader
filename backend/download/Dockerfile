# Use an appropriate base image for your service
FROM node:18-alpine

# Install Python and pip
RUN apk add --no-cache python3 py3-pip

# Install yt-dlp and ffmpeg
RUN pip3 install yt-dlp --break-system-packages && \
    apk add --no-cache ffmpeg

# Set the working directory inside the container
WORKDIR /app

# Create the downloads directory and ensure permissions
RUN mkdir -p /app/downloads && chmod -R 777 /app/downloads

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Define the command to start your app
CMD ["node", "index.js"]
