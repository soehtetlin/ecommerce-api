# Stage 1: Use the official Node.js 18 image as a base
FROM node:18-alpine

# Set the working directory inside the container
# This is where our application code will live
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
# This takes advantage of Docker's layer caching. If these files don't change,
# Docker won't re-run "npm install" on subsequent builds, making it much faster.
COPY package*.json ./

# Install application dependencies defined in package.json
RUN npm install

# Copy the rest of the application source code into the container
COPY . .

# Expose port 3000 to the outside world. 
# This is the port your Express app will listen on.
EXPOSE 3000

# The command to run when the container starts.
# This will execute the "start" script from your package.json file ("node index.js").
CMD [ "npm", "start" ]