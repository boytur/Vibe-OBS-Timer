FROM node:22-alpine AS builder
WORKDIR /app
# copy lockfile first for reproducible installs
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# copy source excluding node_modules (handled by .dockerignore)
COPY . .
ARG MONGODB_URI
ARG NEXT_PUBLIC_APP_URL
ARG NODE_ENV
ENV MONGODB_URI=${MONGODB_URI}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NODE_ENV=${NODE_ENV}
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
# install only production deps
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3001
CMD ["pnpm", "start"]
