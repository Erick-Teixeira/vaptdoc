FROM node:24-bookworm-slim AS base

ENV HOST=0.0.0.0

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    ffmpeg \
    fonts-dejavu-core \
    libreoffice \
    openjdk-17-jdk-headless \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-por \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

FROM base AS deps

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

FROM deps AS build

COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM base AS production

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["node", "dist/server.js"]
