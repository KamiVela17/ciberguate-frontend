FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ARG BACKEND_URL=http://backend:8000
ENV BACKEND_URL=$BACKEND_URL
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
ENV NODE_ENV=production PORT=3000
WORKDIR /app
RUN addgroup -g 10001 -S app && adduser -u 10001 -S app -G app
COPY --from=builder --chown=app:app /app ./
USER app
EXPOSE 3000
CMD ["npm", "run", "start"]
