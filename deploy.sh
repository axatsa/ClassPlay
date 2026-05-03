#!/bin/bash
set -e
echo '🚀 Начинаем деплой OnlineGame_v3 (Modular Monolith)'

PROJECT_DIR="/home/temp/OnlineGame_v3"

if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
else
    echo "❌ Ошибка: Папка $PROJECT_DIR не найдена!"
    exit 1
fi

# 2. Принудительное обновление кода
echo '🔄 Принудительная загрузка кода из GitHub...'
git fetch origin main
git reset --hard origin/main

# 3. Определяем команду docker compose
if docker compose version >/dev/null 2>&1; then
    DOCKER_CMD="docker compose"
elif docker-compose version >/dev/null 2>&1; then
    DOCKER_CMD="docker-compose"
else
    echo "❌ Ошибка: Docker Compose не найден!"
    exit 1
fi
echo "🛠️ Используем команду: $DOCKER_CMD"

# 4. Остановка и УДАЛЕНИЕ старых контейнеров
echo '🧹 Очистка старых контейнеров...'
$DOCKER_CMD -f docker-compose.prod.yml down --remove-orphans

# Принудительное удаление, если down не справился
docker rm -f online_games_db_prod online_games_backend_prod online_games_frontend_prod 2>/dev/null || true

# 5. Сборка и запуск новых
echo '🔨 Пересборка и запуск контейнеров...'
$DOCKER_CMD -f docker-compose.prod.yml up -d --build --force-recreate

# 6. Ожидание готовности БД (с loop-проверкой вместо sleep)
echo '⏳ Ожидание готовности базы данных...'
MAX_WAIT=60
WAITED=0
until docker exec online_games_db_prod pg_isready -U postgres >/dev/null 2>&1; do
    if [ $WAITED -ge $MAX_WAIT ]; then
        echo "❌ База данных не поднялась за ${MAX_WAIT}с!"
        exit 1
    fi
    sleep 2
    WAITED=$((WAITED + 2))
    echo "   ...ждём БД (${WAITED}с)"
done
echo "✅ База данных готова (${WAITED}с)"

# 7. Миграция схемы (добавление новых колонок)
echo '⚙️ Синхронизация схемы базы данных...'
docker exec -t online_games_backend_prod python scripts/fix_db.py

# 8. Миграция Telegram-платежей (новые колонки)
echo '💳 Применяем миграцию Telegram-платежей...'
PG_USER=$(grep ^POSTGRES_USER .env | cut -d= -f2)
PG_DB=$(grep ^POSTGRES_DB .env | cut -d= -f2)
docker cp migrations/telegram_payments.sql online_games_db_prod:/tmp/telegram_payments.sql
docker exec -t online_games_db_prod psql -U "$PG_USER" -d "$PG_DB" -f /tmp/telegram_payments.sql && \
    echo "✅ Миграция telegram_payments применена" || \
    echo "⚠️  Миграция уже была применена или не нужна — продолжаем"

# 9. Запуск сидов
echo '🌱 Наполнение базы данных (Seeding)...'
docker exec -t online_games_backend_prod python scripts/seed_users.py
docker exec -t online_games_backend_prod python scripts/seed.py
docker exec -t online_games_backend_prod python scripts/seed_gamification.py

# 10. Проверка Telegram бота
echo '🤖 Проверяем статус Telegram бота...'
if docker ps | grep -q online_games_telegram_bot; then
    echo "✅ Telegram бот запущен"
else
    echo "⚠️  Telegram бот не запустился, проверь: docker logs online_games_telegram_bot"
fi

echo ''
echo '✅ Деплой успешно завершен!'
echo '🌐 Проект доступен по адресу: https://classplay.uz!'
echo '🤖 Telegram бот: @ClassPlayEdu_Purchase_Bot'
echo ''
echo 'Полезные команды:'
echo '  docker logs online_games_telegram_bot -f   # логи бота'
echo '  docker logs online_games_backend_prod -f   # логи backend'
