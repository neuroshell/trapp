# Trapp Backend (Sync Server)

This is an optional sync server that stores a JSON payload per device ID.
It is intended to be used by the mobile app for backup / multi-device sync.

## Getting Started

```bash
cd backend
npm install
npm start
```

By default the server runs on `http://localhost:4000` and stores state in `data.json`.

## API

### POST /sync

Body:
```json
{
  "deviceId": "<device-id>",
  "payload": { ... }
}
```

Response:
```json
{ "ok": true, "device": { ... } }
```

### GET /sync?deviceId=<device-id>

Response:
```json
{ "ok": true, "device": { ... } }
```
