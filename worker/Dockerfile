FROM node:20-slim AS builder
WORKDIR /app

# Install root deps first — provides @supabase/supabase-js and @anthropic-ai/sdk
# types to tsc when it compiles ../lib/ files (Node resolves up the tree from lib/).
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts

# Install worker deps
COPY worker/package.json ./worker/
RUN cd worker && npm install --ignore-scripts

# Copy only the source needed for the worker build
COPY lib/ ./lib/
COPY worker/src/ ./worker/src/
COPY worker/tsconfig.json ./worker/

RUN cd worker && npm run build

# ── runtime image ────────────────────────────────────────────────────────────
FROM node:20-slim
WORKDIR /app

# dist mirrors rootDir (".."): compiled lib/ and worker/src/ land under dist/
COPY --from=builder /app/worker/dist ./dist
# worker/node_modules provides runtime packages; Node walks up to /app/node_modules
COPY --from=builder /app/worker/node_modules ./node_modules

EXPOSE 8080
CMD ["node", "dist/worker/src/server.js"]
