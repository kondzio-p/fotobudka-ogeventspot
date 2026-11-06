FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY dist/ ./

ENV HOST=0.0.0.0
ENV PORT=4321

# Port, który SSR używa
EXPOSE 4321

# Uruchamiamy SSR
CMD ["node", "server/entry.mjs"]
