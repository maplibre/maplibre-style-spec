# Dockerfile for running MapLibre Style Spec documentation locally
# Usage (from repo root):
#   docker build -f docs/Dockerfile -t maplibre-style-spec-docs .
#   docker run -p 8000:8000 maplibre-style-spec-docs

FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Install Node.js 22
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy everything (need source files for npm prepare script)
COPY . .

# Install npm dependencies (with --ignore-scripts to avoid prepare, then run it manually)
RUN npm ci --ignore-scripts \
    && npm run generate-style-spec \
    && npm run generate-docs

# Expose the default MkDocs port
EXPOSE 8000

# Run the docs server
CMD ["uvx", "zensical", "serve", "--dev-addr", "0.0.0.0:8000"]
