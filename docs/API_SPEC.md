# PhoneShim API 명세서

- Base URL: `http://localhost:3000`
- 공통 응답 포맷
  - 성공: `{ "success": true, "data": { ... } }` (단, DELETE는 `204 No Content`로 body 없음)
  - 실패: `{ "success": false, "error": { "code": "STRING", "message": "STRING" } }`
- 상태 표기 기준: **dev 브랜치**
  - ✅ 구현완료 (dev에 머지됨)
  - ⬜ 미구현 (dev에 없음)
  - 참고: `totalGoal`/`monitoredApp`/`appGoal`/`reminder`/`alertSetting`은 **`main`에는 이미 구현되어 있으나 `dev`엔 아직 반영 안 됨** (브랜치 동기화 필요)
- ⚠️ **임시 인증 안내**: JWT 도입 전까지 `src/shared/middlewares/authMiddleware.ts`가 `x-user-id` 헤더로 사용자를 식별하도록 만들어져 있음. 단, 현재 `app.ts`/라우터에 아직 연결되어 있지 않아 실제로는 미적용 상태 (연결 시 아래 "인증 필요" 표시된 API는 요청 헤더에 `x-user-id: <uuid>` 필요)

## 전체 엔드포인트 목록

| 도메인 | Method | Path | 설명 | 상태 |
| --- | --- | --- | --- | --- |
| System | GET | /health | 서버 상태 확인 | ✅ |
| Auth | POST | /api/auth/google | 구글 소셜 로그인/회원가입 | ⬜ |
| Auth | POST | /api/auth/kakao | 카카오 소셜 로그인/회원가입 | ⬜ |
| Auth | POST | /api/auth/logout | 로그아웃 | ⬜ |
| Auth | POST | /api/auth/link-account | 중복 이메일 계정 연동 | ⬜ |
| User | GET | /api/users/me | 내 프로필 조회 | ⬜ |
| User | PUT | /api/users/me | 프로필/목표 문구 수정 | ⬜ |
| User | DELETE | /api/users/me | 회원 탈퇴 (14일 유예) | ⬜ |
| TotalGoal | POST | /api/total-goals | 전체 목표 시간 생성 | ⬜ |
| TotalGoal | GET | /api/total-goals | 내 전체 목표 조회 | ⬜ |
| TotalGoal | GET | /api/total-goals/:id | 전체 목표 단건 조회 | ⬜ |
| TotalGoal | PATCH | /api/total-goals/:id | 전체 목표 수정 | ⬜ |
| TotalGoal | DELETE | /api/total-goals/:id | 전체 목표 삭제 | ⬜ |
| MonitoredApp | POST | /api/monitored-apps | 주의어플 등록 | ⬜ |
| MonitoredApp | GET | /api/monitored-apps | 주의어플 목록 조회 | ⬜ |
| MonitoredApp | GET | /api/monitored-apps/:id | 주의어플 단건 조회 | ⬜ |
| MonitoredApp | PATCH | /api/monitored-apps/:id | 주의어플 수정 | ⬜ |
| MonitoredApp | DELETE | /api/monitored-apps/:id | 주의어플 삭제 | ⬜ |
| AppGoal | POST | /api/app-goals | 앱별 목표 생성 | ⬜ |
| AppGoal | GET | /api/app-goals?monitoredAppId= | 앱별 목표 조회 | ⬜ |
| AppGoal | GET | /api/app-goals/:id | 앱별 목표 단건 조회 | ⬜ |
| AppGoal | PATCH | /api/app-goals/:id | 앱별 목표 수정 | ⬜ |
| AppGoal | DELETE | /api/app-goals/:id | 앱별 목표 삭제 | ⬜ |
| AI | POST | /api/ai/suggest-goal | 목표 시간/횟수 AI 제안 | ⬜ |
| Reminder | POST | /api/reminders | 할 일 생성 | ⬜ |
| Reminder | GET | /api/reminders | 날짜별 할 일 목록 조회 | ⬜ |
| Reminder | GET | /api/reminders/:id | 할 일 단건 조회 | ⬜ |
| Reminder | PATCH | /api/reminders/:id | 할 일 수정 | ⬜ |
| Reminder | DELETE | /api/reminders/:id | 할 일 삭제 | ⬜ |
| UsageLog | GET | /api/usage-logs | 타임테이블(사용 기록) 조회 | ⬜ |
| UsageReason | POST | /api/usage-reasons | 사용 이유 입력 | ⬜ |
| UsageReason | GET | /api/usage-reasons/calendar | 날짜별 입력 여부(O/X) 조회 | ⬜ |
| Report | GET | /api/reports/summary | 주간/월간 요약(워드클라우드 등) | ⬜ |
| Report | POST | /api/ai/daily-feedback | AI 데일리 피드백 | ⬜ |
| AlertSetting | POST | /api/alert-settings | 알림 설정 생성 | ⬜ |
| AlertSetting | GET | /api/alert-settings | 알림 설정 조회 | ⬜ |
| AlertSetting | GET | /api/alert-settings/:id | 알림 설정 단건 조회 | ⬜ |
| AlertSetting | PATCH | /api/alert-settings/:id | 알림 시각 수정 | ⬜ |
| AlertSetting | DELETE | /api/alert-settings/:id | 알림 설정 삭제 | ⬜ |

---

## System

### GET /health ✅

**Response 200**

```json
{ "success": true, "data": { "status": "ok" } }
```

---

## Auth ⬜

### POST /api/auth/google / POST /api/auth/kakao

**설명**: 소셜 로그인 성공 시 신규면 가입, 기존이면 로그인 후 인증 정보 발급 (AUTH-01~04)

**Request Body**

```json
{
  "idToken": "소셜 제공자로부터 받은 토큰"
}
```

**Response 201** (신규 가입) **/ 200** (기존 로그인)

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-or-session-token",
    "user": {
      "id": "uuid",
      "email": "a@a.com",
      "name": "홍길동",
      "provider": "GOOGLE",
      "isNewUser": false
    }
  }
}
```

**Error 401**

```json
{ "success": false, "error": { "code": "INVALID_SOCIAL_TOKEN", "message": "소셜 토큰 검증에 실패했습니다." } }
```

### POST /api/auth/logout — 인증 필요

**Response 204**: No Content

### POST /api/auth/link-account — 인증 필요

**설명**: 동일 이메일 중복 가입 시 계정 연동 여부 확인 (ERR-01)

```json
{ "provider": "KAKAO", "idToken": "..." }
```

**Response 200**

```json
{ "success": true, "data": { "linked": true } }
```

---

## User (MyPage) ⬜ — 인증 필요

> `motivation`(목표/다짐 문구) 필드는 현재 Prisma 스키마에 없음 — DB 확정 후 반영 필요

### GET /api/users/me

**Response 200**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "a@a.com",
    "name": "홍길동",
    "profileImage": "https://...",
    "motivation": "스마트폰 그만 보고 공부에 집중하기",
    "createdAt": "..."
  }
}
```

### PUT /api/users/me

```json
{ "name": "홍길동", "motivation": "스마트폰 그만 보고 공부에 집중하기" }
```

**Response 200**: 위 GET과 동일한 형태로 갱신된 데이터 반환

### DELETE /api/users/me

**설명**: 탈퇴 요청 → `withdrawalRequestedAt` 기록, 14일 유예 후 영구 삭제 (MY-03)

**Response 204**: No Content

---

## TotalGoal ⬜ — 인증 필요 (`x-user-id` 헤더로 사용자 식별, body에 `userId` 불필요)

### POST /api/total-goals

```json
{
  "targetMinutes": 120,
  "restrictAfter": false
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "targetMinutes": 120,
    "restrictAfter": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### GET /api/total-goals

**설명**: 로그인한 사용자(`x-user-id`)의 전체 목표 조회

**Response 200**: 위와 동일한 단일 객체 (`data`)

### GET /api/total-goals/:id

**Response 200**: 위와 동일한 단일 객체

### PATCH /api/total-goals/:id

```json
{ "targetMinutes": 150, "restrictAfter": true }
```

**Response 200**: 갱신된 객체

### DELETE /api/total-goals/:id

**Response 204**: No Content

---

## MonitoredApp ⬜ — 인증 필요 (`x-user-id` 헤더, body에 `userId` 불필요)

### POST /api/monitored-apps

```json
{
  "appName": "YouTube",
  "appIcon": "https://...",
  "order": 1
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "appName": "YouTube",
    "appIcon": "https://...",
    "order": 1,
    "createdAt": "..."
  }
}
```

### GET /api/monitored-apps

**설명**: 로그인한 사용자의 주의어플 전체 목록

**Response 200**: 배열(`data: [...]`)

### GET /api/monitored-apps/:id

**Response 200**: 단일 객체

### PATCH /api/monitored-apps/:id

```json
{ "appName": "Instagram", "order": 2 }
```

### DELETE /api/monitored-apps/:id

**Response 204**: No Content

---

## AppGoal ⬜ — 인증 불필요 (monitoredAppId 기준으로 조회, 소유자 검증 로직은 추후 보강 필요)

### POST /api/app-goals

```json
{
  "monitoredAppId": "uuid",
  "targetMinutes": 30,
  "targetCount": 5,
  "restrictAfter": false,
  "goalReason": "숏폼 그만 보고 싶어서"
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "monitoredAppId": "uuid",
    "targetMinutes": 30,
    "targetCount": 5,
    "restrictAfter": false,
    "goalReason": "숏폼 그만 보고 싶어서"
  }
}
```

### GET /api/app-goals?monitoredAppId=uuid (쿼리 파라미터 필수)

**Response 200**: 단일 객체 (`monitoredAppId`당 1개, `@unique` 제약)

**Error 400** (쿼리 누락 시)

```json
{ "success": false, "error": { "code": "INVALID_MONITORED_APP_ID", "message": "monitoredAppId 쿼리 파라미터는 필수입니다." } }
```

### GET /api/app-goals/:id

**Response 200**: 단일 객체

### PATCH /api/app-goals/:id

```json
{ "targetMinutes": 20, "targetCount": 3 }
```

### DELETE /api/app-goals/:id

**Response 204**: No Content

---

## AI ⬜ (DB 미확정)

### POST /api/ai/suggest-goal

**설명**: 사용자가 입력한 목표 문구(`goalReason`)를 바탕으로 제한 시간/횟수 제안 (SET108)

```json
{ "goalReason": "숏폼 그만 보고 싶어서" }
```

**Response 200**

```json
{ "success": true, "data": { "suggestedMinutes": 30, "suggestedCount": 5 } }
```

---

## Reminder ⬜ — 인증 필요 (`x-user-id` 헤더, body에 `userId` 불필요)

### POST /api/reminders

```json
{
  "date": "2026-07-05",
  "title": "과제하기",
  "startTime": "2026-07-05T14:00:00Z",
  "endTime": "2026-07-05T16:00:00Z",
  "restrictMode": "SPECIFIC_APP",
  "restrictedAppIds": ["uuid1", "uuid2"]
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "date": "2026-07-05",
    "title": "과제하기",
    "startTime": "...",
    "endTime": "...",
    "restrictMode": "SPECIFIC_APP",
    "restrictedAppIds": ["uuid1", "uuid2"]
  }
}
```

### GET /api/reminders?date=2026-07-05

**Response 200**: 배열(`data: [...]`)

### GET /api/reminders/:id

**Response 200**: 단일 객체

### PATCH /api/reminders/:id

```json
{ "title": "과제 마무리", "restrictMode": "FULL_PHONE" }
```

### DELETE /api/reminders/:id

**Response 204**: No Content

---

## UsageLog ⬜

### GET /api/usage-logs?date=2026-07-05 — 인증 필요

**설명**: 타임테이블(REP101) — 하루 동안 주의어플별 사용 시간대

**Response 200**

```json
{
  "success": true,
  "data": [
    {
      "monitoredAppId": "uuid",
      "appName": "YouTube",
      "startTime": "...",
      "endTime": "...",
      "usedMinutes": 15
    }
  ]
}
```

---

## UsageReason ⬜ — 인증 필요 (입력 가능 시간대 22:00~10:00 정책 적용, REP-01)

### POST /api/usage-reasons

```json
{
  "monitoredAppId": "uuid",
  "date": "2026-07-05",
  "timeRangeStart": "...",
  "timeRangeEnd": "...",
  "reason": "친구랑 약속 잡느라"
}
```

**Response 201**: 생성된 객체 반환

**Error 403** (허용 시간대 외 입력 시)

```json
{ "success": false, "error": { "code": "OUT_OF_INPUT_WINDOW", "message": "사용 이유는 22:00~10:00 사이에만 입력할 수 있습니다." } }
```

### GET /api/usage-reasons/calendar?month=2026-07

**설명**: 해당 월 중 입력 완료한 날짜 O/X 표시 (REP106)

```json
{ "success": true, "data": { "2026-07-01": true, "2026-07-02": false } }
```

---

## Report ⬜ — 인증 필요

### GET /api/reports/summary?range=week

**설명**: 워드클라우드 + AI 한줄평 (REP104~105). `range`는 `week`(최근 7일) 또는 `month`(최근 30일)

```json
{
  "success": true,
  "data": {
    "wordCloud": [{ "word": "약속", "count": 5 }],
    "aiComment": "이번 주는 약속으로 인한 사용이 많았어요."
  }
}
```

**Error 422** (최소 집계 기준 미달, REP-03)

```json
{ "success": false, "error": { "code": "INSUFFICIENT_DATA", "message": "데이터가 부족해 요약을 생성할 수 없습니다." } }
```

### POST /api/ai/daily-feedback

**설명**: 당일 사용 로그 + 사유 종합 AI 피드백 (REP103, 조건: REP-02)

**Response 200**

```json
{ "success": true, "data": { "feedback": "오늘은 목표 시간을 잘 지켰어요!" } }
```

---

## AlertSetting ⬜ — 인증 필요 (`x-user-id` 헤더, body에 `userId` 불필요)

### POST /api/alert-settings

```json
{ "alertTime": "22:00" }
```

**Response 201**

```json
{ "success": true, "data": { "id": "uuid", "userId": "uuid", "alertTime": "22:00", "updatedAt": "..." } }
```

### GET /api/alert-settings

**Response 200**: 단일 객체

### GET /api/alert-settings/:id

**Response 200**: 단일 객체

### PATCH /api/alert-settings/:id

```json
{ "alertTime": "23:00" }
```

### DELETE /api/alert-settings/:id

**Response 204**: No Content

---

## 공통 에러 응답

```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Requested resource was not found" }
}
```
