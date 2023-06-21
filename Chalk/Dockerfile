FROM node:20-bullseye
WORKDIR /chalk
COPY . .
RUN npm install
RUN npm run compile:css
CMD ["npm","start"]