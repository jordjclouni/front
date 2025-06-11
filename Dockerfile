# Сборка React-приложения
FROM node:20 as build

RUN node -v
RUN npm -v || { echo "npm not found"; exit 1; }

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build || { echo "Build failed"; exit 1; }

# Отдаём через nginx с бэкендом
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем бэкенд (пример для Flask)
COPY backend /app/backend
WORKDIR /app/backend
RUN pip install -r requirements.txt

ARG PORT=5000
ARG BACKEND_PORT=5001
EXPOSE $PORT
CMD ["sh", "-c", "python app.py $BACKEND_PORT & nginx -g 'daemon off;'"]