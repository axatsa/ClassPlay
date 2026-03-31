#!/bin/bash
echo '🚀 Начинаем деплой OnlineGame_v3 (Modular Monolith)'

# 1. Переходим в папку с основным кодом
# Предполагаем путь /home/temp/OnlineGame_v3 на основе вашего SSH логина
PROJECT_DIR="/home/temp/OnlineGame_v3"

if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
else
    echo "❌ Ошибка: Папка $PROJECT_DIR не найдена!"
    exit 1
fi

# 2. Подтягиваем свежие изменения
echo '🔄 Загрузка кода из GitHub...'
git pull origin main

# 3. Пересборка и запуск контейнеров
echo '🔨 Обновление Docker контейнеров...'
# Используем docker-compose.prod.yml для продакшена
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Ожидание готовности БД
echo '⏳ Ожидание инициализации базы данных...'
sleep 5

# 5. Запуск миграций и сидов
echo '🌱 Наполнение базы данных (Seeding)...'
# Запускаем скрипты внутри контейнера backend
docker exec -t online_games_backend_prod python seed_users.py
docker exec -t online_games_backend_prod python seed.py
docker exec -t online_games_backend_prod python seed_gamification.py

echo '✅ Деплой и сидинг успешно завершены!'
echo '🌐 Проект доступен по адресу: http://thompson.uz:8090'
