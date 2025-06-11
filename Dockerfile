FROM node:20 as build

RUN echo "Node version: $(node -v)"
RUN npm -v || { echo "npm not found"; cat /etc/os-release; exit 1; }  # Показать ОС

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build || { echo "Build failed"; ls -la /app; exit 1; }

# Отдаём через nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

ARG PORT=80
EXPOSE $PORT
CMD ["nginx", "-g", "daemon off;"]