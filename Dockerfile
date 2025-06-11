# Сборка React-приложения
FROM node:20 as build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Отдаём через nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

# Устанавливаем порт из переменной окружения Railway
ARG PORT=80
EXPOSE $PORT
CMD ["nginx", "-g", "daemon off;"]