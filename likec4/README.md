# Архитектура «Снеговые мешки» (LikeC4)

Модель архитектуры SaaS по [техническому заданию](../Техническое_задание_снеговых_мешков.docx) в формате [LikeC4](https://likec4.dev/).

## Диаграммы

| View | Уровень C4 | Описание |
|------|------------|----------|
| `index` | C1 | Контекст: пользователи и внешние системы |
| `contextFull` | C1 | Контекст с post-MVP (CRM, владелец здания) |
| `containers` | C2 | Frontend, API, Worker, БД, Redis, S3 |
| `backend` | C3 | Компоненты Go API |
| `frontend` | C3 | Компоненты Vue 3 |
| `worker` | C3 | Пайплайн обработки чертежей |
| `mvpFlow` | Flow | Сквозной сценарий MVP |
| `deployment` | Deploy | Production-контейнеры |

## Просмотр

### Онлайн (рекомендуется)

1. Установите зависимости в корне `likec4/`:

   ```bash
   npm install
   ```

2. Запустите dev-сервер:

   ```bash
   npx likec4 serve
   ```

3. Откройте в браузере URL из вывода команды (обычно `http://localhost:5173`).

### Экспорт в PNG/SVG

```bash
npx likec4 build
npx likec4 export png -o ./diagrams
```

## Структура файлов

- `specification.c4` — типы элементов и стили
- `model.c4` — элементы, иерархия, связи
- `views.c4` — проекции (диаграммы)
- `likec4.config.json` — конфигурация проекта

## Соответствие ТЗ

| Требование ТЗ | Элемент модели |
|---------------|----------------|
| Vue 3 frontend | `snowbag.webApp` |
| Go REST API | `snowbag.api` |
| go-geom, GEOS, GDAL | `geoEngine` |
| Аналитика снеговых мешков | `analyticsEngine` |
| PostgreSQL + PostGIS | `snowbag.postgis` |
| S3 (MinIO / Yandex) | `snowbag.objectStorage` |
| SSO | `auth` → `corporateSSO` |
| Яндекс.Карты | `mapsWidget` → `yandexMaps` |
| PDF / Excel / JSON | `exportService` |
| Асинхронная обработка DWG/PDF | `snowbag.worker` |
