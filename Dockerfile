FROM node:latest

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
# RUN npm ci --only=production
RUN npm ci --only=production

# Change to client directory
WORKDIR /usr/src/app/client

# Install client dependencies
COPY client/package*.json ./
RUN npm install

# Change to app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

# Build React
WORKDIR /usr/src/app/client
RUN npm run build

# Back to app directory and run server
WORKDIR /usr/src/app

ENV PORT=80
ENV NODE_ENV=prod
EXPOSE 80
CMD [ "node", "--experimental-json-modules", "./bin/www.js"]