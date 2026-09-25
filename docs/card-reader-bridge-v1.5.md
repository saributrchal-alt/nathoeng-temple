# Saributr Card Reader 1.5 bridge (draft)

The temple admin page is prepared on branch `feature/card-reader-15-bridge`. Do not publish this branch until the desktop application's source is available and the local bridge is implemented and tested on the actual Windows reader.

## Desktop application contract

- Keep the current Thai ID-card reading and `saributr-card-v1` JSON format from version 1.4.
- Version 1.5 can stay running in the background. On each successful physical read, replace the latest card in memory and set `read_at` to the current ISO-8601 UTC timestamp. Do not write the card to disk for this workflow.
- Bind an HTTP listener to **127.0.0.1 only**, port **8765**. `GET /v1/card/latest` returns the current card as JSON. Return 404 (or 204) when no fresh card is available. The website refuses reads older than two minutes.
- Response shape:

```json
{
  "format": "saributr-card-v1",
  "read_at": "2026-09-26T00:00:00.000Z",
  "citizen_id": "1234567890123",
  "name_title": "นาย",
  "first_name": "ตัวอย่าง",
  "last_name": "สมาชิก",
  "birth_date": "1982-11-18",
  "avatar_image": "data:image/jpeg;base64,..."
}
```

- Follow the existing parser limits: the full JSON response at most 200,000 characters; `avatar_image` is a JPEG data URL at most 100,000 characters. Empty photo or birth date is allowed.
- For both `OPTIONS` and `GET`, allow only the Origin `https://watt.nathoeng.com` with `Access-Control-Allow-Origin`, `Vary: Origin`, `Access-Control-Allow-Methods: GET, OPTIONS`, and `Access-Control-Allow-Private-Network: true` for Chrome's local network preflight. Deny other origins and send `Cache-Control: no-store`. Do not use wildcard CORS, cookies, or public network binding. Chrome may show a one-time permission prompt for access to the local app.
- Do not send card data to the temple automatically. Only the admin's button retrieves it, checks the selected account and duplicate IDs, confirms the cardholder, then uses the existing admin-only API to save the profile. Username, password, and linked LINE/Telegram accounts are preserved.

## Acceptance checks on the actual Windows computer

1. With app 1.5 running and no card read, the admin button reports no fresh card.
2. Read a card; within two minutes the button displays the selected member name and card name for confirmation, then saves once.
3. A different citizen ID already on the selected member or linked to another member stops before saving.
4. An expired card, unplugged reader, stopped app, or denied Chrome local access reports a clear error.
5. A successful save updates name, citizen ID, date of birth and photo while keeping the member's username/password and LINE/Telegram connections.
