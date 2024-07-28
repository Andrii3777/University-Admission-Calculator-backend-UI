# Use the official Node.js image with version 16 as the base image
FROM node:16

# Set the working directory inside the container to /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies using npm
RUN npm install

# Copy the entire application code to the working directory
COPY . .

# Expose the specified port to the outside world
EXPOSE ${APP_PORT}

# Specify the command to run when the container starts
CMD ["npm", "start"]