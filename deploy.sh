#!/bin/bash
echo '🚀 Начинаем деплой OnlineGame_v3 (Modular Monolith)'

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

# 3. Определяем команду docker compose
if docker compose version >/dev/null 2>&1; then
    DOCKER_CMD="docker compose"
else
    DOCKER_CMD="docker-compose"
fi
echo "🛠️ Используем команду: $DOCKER_CMD"

# 4. Пересборка и запуск контейнеров
echo '🔨 Обновление Docker контейнеров...'
$DOCKER_CMD -f docker-compose.prod.yml up -d --build

# 5. Ожидание готовности БД
echo '⏳ Ожидание инициализации базы данных...'
sleep 5

# 6. Запуск миграций и сидов
echo '🌱 Наполнение базы данных (Seeding)...'
# Запускаем скрипты внутри контейнера backend
# Мы используем -T для неинтерактивного запуска
docker exec -t online_games_backend_prod python seed_users.py
docker exec -t online_games_backend_prod python seed.py
docker exec -t online_games_backend_prod python seed_gamification.py

echo '✅ Деплой и сидинг успешно завершены!'
echo '🌐 Проект доступен по адресу: http://thompson.uz:8090'
