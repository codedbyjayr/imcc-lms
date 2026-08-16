FROM node:20-alpine
WORKDIR /app

COPY Backend/package*.json ./Backend/
RUN cd Backend && npm install --omit=dev

COPY Backend ./Backend
COPY Frontend ./Frontend
RUN mkdir -p Backend/uploads

WORKDIR /app/Backend
EXPOSE 5000
CMD ["node", "server.js"]