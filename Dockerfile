FROM node:13.8-alpine

WORKDIR /app

# Install deps
COPY package.json package.json
RUN npm install --production

COPY src src
COPY config.js config.js
COPY index.js index.js
COPY private.pem private.pem
COPY public.pem public.pem

EXPOSE 3000

# For prod
CMD ["node", "index.js"]