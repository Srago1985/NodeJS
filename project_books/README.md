# Project Books API

REST API для работы с книгами (сейчас используется in-memory репозиторий-заглушка вместо базы данных).

## Run

```bash
npm install
npm run start
```

По умолчанию сервер стартует на порту `8080`.
Можно указать порт через переменную окружения `PORT`.

## Endpoints

- `POST /book`
- `GET /book/:isbn`
- `DELETE /book/:isbn`
- `PATCH /book/:isbn/title/:title`
- `GET /books/author/:author`
- `GET /books/publisher/:publisher`
- `GET /authors/book/:isbn`
- `GET /publishers/author/:author`
- `DELETE /author/:author`

## Error Contract

Все ошибки возвращаются в едином JSON-формате:

```json
{
  "timestamp": "2026-07-23T18:12:44.537Z",
  "status": 404,
  "code": "NOT_FOUND",
  "message": "Book with isbn unknown not found",
  "path": "/book/unknown"
}
```

### Error Codes

- `BAD_REQUEST` -> HTTP `400`
- `NOT_FOUND` -> HTTP `404`
- `CONFLICT` -> HTTP `409`
- `INTERNAL_SERVER_ERROR` -> HTTP `500`

### Typical Cases

- `400 BAD_REQUEST`
  - Невалидный payload книги при `POST /book`
  - Пустой `isbn`, `author`, `publisher`, `title` в path-параметрах
- `404 NOT_FOUND`
  - Книга не найдена по `isbn`
  - Автор не найден при `DELETE /author/:author`
  - Роут не существует
- `409 CONFLICT`
  - Книга с таким `isbn` уже существует

## Author Deletion Rule

- При `DELETE /author/:author`: если у книги после удаления автора не остается ни одного автора, такая книга удаляется из хранилища.
- HTTP-контракт endpoint-ов остается неизменным.

## Notes

- Хранилище временное (in-memory): данные очищаются после перезапуска сервера.
- Слой репозитория сделан как порт для будущей замены на MongoDB/SQL.
