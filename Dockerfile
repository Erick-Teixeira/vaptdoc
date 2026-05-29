FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    openjdk-17-jdk-headless \
    ffmpeg \
    libreoffice \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-por \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]
