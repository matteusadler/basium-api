#!/bin/sh
npx prisma generate --schema=./packages/database/prisma/schema.prisma
node apps/api/dist/main
