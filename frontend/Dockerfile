# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory within the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your SvelteKit application to the container
COPY . .
RUN npm run build

# Expose the port your SvelteKit app will run on
EXPOSE 3001

# Command to start your SvelteKit app
CMD ["node", "./build"]