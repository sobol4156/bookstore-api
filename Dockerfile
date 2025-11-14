FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

COPY tsconfig.json ./
COPY tsconfig.build.json ./
COPY nest-cli.json ./
COPY eslint.config.mjs ./

RUN pnpm install --frozen-lockfile

RUN pnpm prisma generate

EXPOSE 3000

CMD ["pnpm", "start:dev"]