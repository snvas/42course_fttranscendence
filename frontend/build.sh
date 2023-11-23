#!bin/bash

env | cat > /app/.env
npm run build
node ./build