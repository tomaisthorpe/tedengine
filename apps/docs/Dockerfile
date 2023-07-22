FROM node:18.4-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --package-lock

FROM node:18.4-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --chown=nextjs:nodejs ./.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY ./package.json ./package.json

USER nextjs

CMD ["npm", "run", "start"]