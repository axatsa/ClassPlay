#!/bin/bash
echo '🚀 Начинаем деплой OnlineGame_v3 (Modular Monolith)'

PROJECT_DIR="/home/temp/OnlineGame_v3"

if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
else
    echo "❌ Ошибка: Папка $PROJECT_DIR не найдена!"
    exit 1
fi

# 2. Принудительное обновление кода (удаляем локальные конфликты в скрипте)
echo '🔄 Принудительная загрузка кода из GitHub...'
git fetch origin main
git reset --hard origin/main

# 3. Определяем команду docker compose
# Проверяем наличие docker-compose (v1) или docker compose (v2)
if docker compose version >/dev/null 2>&1; then
    DOCKER_CMD="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    DOCKER_CMD="docker-compose"
else
    echo "❌ Ошибка: Docker Compose не найден!"
    exit 1
fi
echo "🛠️ Используем команду: $DOCKER_CMD"

# 4. Пересборка и запуск контейнеров
echo '🔨 Пересборка и запуск контейнеров...'
# Остановка старых
$DOCKER_CMD -f docker-compose.prod.yml down
# Сборка и запуск новых
$DOCKER_CMD -f docker-compose.prod.yml up -d --build

# 5. Ожидание готовности БД
echo '⏳ Ожидание инициализации базы данных...'
sleep 5

# 6. Запуск сидов
echo '🌱 Наполнение базы данных (Seeding)...'
docker exec -t online_games_backend_prod python seed_users.py
docker exec -t online_games_backend_prod python seed.py
docker exec -t online_games_backend_prod python seed_gamification.py

echo '✅ Деплой успешно завершен!'
echo '🌐 Проект доступен по адресу: http://thompson.uz:8090'
