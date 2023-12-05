# Use an official Node.js runtime as the base image
FROM node:20 AS build

# Set the working directory within the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your SvelteKit application to the container
COPY . .

# Expose the port your SvelteKit app will run on
EXPOSE 3001

#ENV HOST=127.0.0.1
#env | cat > /app/.env
#RUN npm run build
#RUN node ./build/index.js
#RUN node ./build


# Command to start your SvelteKit app
CMD ["bash", "./build.sh"]

#FROM devforth/spa-to-http:latest AS production
#COPY --from=build /app/build/ .

#FROM nginx:alpine AS production
#USER root
#WORKDIR /usr/share/nginx/html
#RUN rm -rf ./*
#COPY --from=build /app/build .
#ENTRYPOINT [ "nginx", "-g", "daemon off;"]


