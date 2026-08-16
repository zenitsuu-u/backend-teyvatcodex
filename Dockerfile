FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN useradd -m appuser
USER appuser

EXPOSE 3000

CMD ["npm", "start"]