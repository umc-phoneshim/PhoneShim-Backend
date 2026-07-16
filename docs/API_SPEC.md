# PhoneShim API 명세서

## 1. 공통 정보

- Base URL: `http://localhost:3000`
- API 문서 기준: ERD v1 보완안
- Content-Type: `application/json`
- 인증 방식: `Authorization: Bearer <accessToken>`

> 이 문서는 백엔드 구현 기준 문서입니다. API 구현 시 이 문서의 경로, 필드명, 응답 형태, 에러 코드를 우선 기준으로 삼습니다.

### 공통 구현 규칙

- 인증이 필요한 API는 반드시 `authenticate` 미들웨어를 사용하고, 사용자 식별자는 `req.user.userId`를 사용합니다.
- 인증 API를 제외한 사용자 데이터 API는 request body/query/path의 `userId`를 신뢰하지 않습니다.
- 본인 소유 리소스가 아니거나 존재하지 않는 리소스는 보안상 모두 `404 *_NOT_FOUND`로 응답합니다.
- 날짜 문자열은 `YYYY-MM-DD` 형식을 사용합니다.
- 날짜 query가 생략되는 “오늘” 기준 API는 KST(`Asia/Seoul`) 기준 오늘을 사용합니다.
- 시간 값은 ISO 8601 string으로 주고받습니다.
- `createdAt`, `updatedAt`, `startTime`, `endTime`, `timeRangeStart`, `timeRangeEnd` 응답은 ISO 8601 string입니다.
- 리스트 API는 별도 명시가 없으면 pagination 없이 전체 목록을 반환합니다.
- `DELETE` 성공 응답은 `204 No Content`이며 body를 반환하지 않습니다.
- request body는 JSON object여야 하며, 빈 문자열은 유효하지 않은 값으로 처리합니다.
- Prisma unique 제약 위반은 도메인별 `*_ALREADY_EXISTS` 에러로 변환합니다.

## 2. 구현 상태 기준

| 상태 | 의미 |
|---|---|
| 구현완료 | 현재 코드에 라우터, 서비스, 저장소 또는 응답 흐름이 구현되어 있음 |
| 부분구현 | 라우터는 있으나 임시 구현이거나 DB 연동/정책 검증이 부족함 |
| 예정 | ERD/API 설계 기준으로 필요하지만 아직 코드 구현 전 |
| 보류 | 외부 연동 또는 정책 확정 후 구현 필요 |

## 3. 공통 응답 포맷

### 성공

```json
{
  "success": true,
  "data": {}
}
```

### 실패

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

### 인증 에러

| Status | Code | 설명 |
|---|---|---|
| 401 | UNAUTHORIZED | 인증 토큰이 없음 |
| 401 | INVALID_TOKEN | 인증 토큰이 유효하지 않음 |

### 공통 에러

| Status | Code | 설명 |
|---|---|---|
| 400 | INVALID_REQUEST_BODY | request body가 JSON object가 아님 |
| 400 | VALIDATION_ERROR | 필수값 누락, 타입 불일치, 빈 문자열 등 기본 검증 실패 |
| 404 | NOT_FOUND | 등록되지 않은 라우트 |
| 500 | INTERNAL_SERVER_ERROR | 처리되지 않은 서버 오류 |

## 4. 전체 API 목록

| Domain | Method | Path | 설명 | 상태 |
|---|---|---|---|---|
| System | GET | `/health` | 서버 상태 확인 | 구현완료 |
| Timer | POST | `/api/timers/start` | 타이머 시작 | 부분구현 |
| Timer | POST | `/api/timers/stop` | 타이머 종료 | 부분구현 |
| Group | GET | `/api/groups` | 그룹 목록 조회 | 부분구현 |
| Group | POST | `/api/groups` | 그룹 생성 | 부분구현 |
| MonitoredApp | POST | `/api/monitored-apps` | 주의 앱 등록 | 구현완료 |
| MonitoredApp | GET | `/api/monitored-apps` | 주의 앱 목록 조회 | 구현완료 |
| MonitoredApp | GET | `/api/monitored-apps/:id` | 주의 앱 단건 조회 | 구현완료 |
| MonitoredApp | PATCH | `/api/monitored-apps/:id` | 주의 앱 수정 | 구현완료 |
| MonitoredApp | DELETE | `/api/monitored-apps/:id` | 주의 앱 삭제 | 구현완료 |
| Auth | POST | `/api/auth/google` | 구글 로그인/회원가입 | 예정 |
| Auth | POST | `/api/auth/kakao` | 카카오 로그인/회원가입 | 예정 |
| Auth | POST | `/api/auth/logout` | 로그아웃 | 예정 |
| Auth | POST | `/api/auth/link-account` | 동일 이메일 소셜 계정 연동 | 예정 |
| Auth | POST | `/api/auth/recover-withdrawal` | 탈퇴 유예 계정 복구 | 예정 |
| User | GET | `/api/users/me` | 내 프로필 조회 | 예정 |
| User | PATCH | `/api/users/me` | 내 이름/목표 문구 수정 | 예정 |
| User | DELETE | `/api/users/me` | 회원 탈퇴 요청 | 예정 |
| TotalGoal | POST | `/api/total-goals` | 전체 목표 생성/설정 | 예정 |
| TotalGoal | GET | `/api/total-goals` | 전체 목표 조회 | 예정 |
| TotalGoal | PATCH | `/api/total-goals` | 전체 목표 수정 | 예정 |
| AppGoal | POST | `/api/app-goals` | 앱별 목표 생성/설정 | 예정 |
| AppGoal | GET | `/api/app-goals?monitoredAppId=` | 앱별 목표 조회 | 예정 |
| AppGoal | PATCH | `/api/app-goals/:id` | 앱별 목표 수정 | 예정 |
| Reminder | POST | `/api/reminders` | 할 일 생성 | 예정 |
| Reminder | GET | `/api/reminders?date=` | 날짜별 할 일 목록 조회 | 예정 |
| Reminder | GET | `/api/reminders/:id` | 할 일 단건 조회 | 예정 |
| Reminder | PATCH | `/api/reminders/:id` | 할 일 수정 | 예정 |
| Reminder | DELETE | `/api/reminders/:id` | 할 일 삭제 | 예정 |
| UsageLog | GET | `/api/usage-logs?date=` | 일별 주의 앱 사용량 조회 | 예정 |
| UsageReason | POST | `/api/usage-reasons` | 사용 사유 입력 | 예정 |
| UsageReason | GET | `/api/usage-reasons/calendar?month=` | 날짜별 사유 입력 여부 조회 | 예정 |
| AlertSetting | GET | `/api/alert-settings` | 하루 알림 설정 조회 | 예정 |
| AlertSetting | PATCH | `/api/alert-settings` | 하루 알림 시간 수정 | 예정 |
| Report | GET | `/api/reports/summary?range=` | 주간/월간 요약 조회 | 예정 |
| AI | POST | `/api/ai/daily-feedback` | 일간 AI 피드백 생성 | 예정 |
| AI | POST | `/api/ai/suggest-goal` | 목표 시간/횟수 AI 제안 | 예정 |

## 5. System

### GET `/health`

서버 상태를 확인합니다.

- 인증: 불필요
- 상태: 구현완료

#### Response 200

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

## 6. MonitoredApp

기능명세서 `SET103`, `SET104`, 정책 `SET-02`에 해당합니다.

공통 정책:

- 인증 필요
- 사용자별 최대 5개까지 등록 가능
- 같은 사용자 안에서 `packageName` 중복 등록 불가
- 목록 정렬: `sortOrder asc`, `createdAt asc`
- 본인 소유가 아닌 앱은 조회/수정/삭제 불가

### POST `/api/monitored-apps`

주의 앱을 등록합니다.

- 인증: 필요
- 상태: 구현완료

#### Request Headers

| 이름 | 필수 | 설명 |
|---|---|---|
| Authorization | Y | `Bearer <accessToken>` |

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| packageName | string | Y | Android 앱 패키지명 |
| appName | string | Y | 앱 이름 |
| appIcon | string | N | 앱 아이콘 이미지 주소 또는 식별값 |
| sortOrder | number | N | 앱 표시 순서. 없으면 마지막 순서로 저장 |

#### Request Example

```json
{
  "packageName": "com.google.android.youtube",
  "appName": "YouTube",
  "appIcon": null,
  "sortOrder": 0
}
```

#### Response 201

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "packageName": "com.google.android.youtube",
    "appName": "YouTube",
    "appIcon": null,
    "sortOrder": 0,
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T00:00:00.000Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | VALIDATION_ERROR | 필수값 누락, 빈 문자열, 잘못된 `sortOrder` |
| 400 | MONITORED_APP_LIMIT_EXCEEDED | 사용자당 최대 5개 초과 |
| 409 | MONITORED_APP_ALREADY_EXISTS | 같은 `packageName` 앱 중복 |

### GET `/api/monitored-apps`

로그인 사용자의 주의 앱 목록을 조회합니다.

- 인증: 필요
- 상태: 구현완료

#### Response 200

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "packageName": "com.google.android.youtube",
      "appName": "YouTube",
      "appIcon": null,
      "sortOrder": 0,
      "createdAt": "2026-07-07T00:00:00.000Z",
      "updatedAt": "2026-07-07T00:00:00.000Z"
    }
  ]
}
```

### GET `/api/monitored-apps/:id`

주의 앱 단건을 조회합니다.

- 인증: 필요
- 상태: 구현완료

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "packageName": "com.google.android.youtube",
    "appName": "YouTube",
    "appIcon": null,
    "sortOrder": 0,
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T00:00:00.000Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 404 | MONITORED_APP_NOT_FOUND | 존재하지 않거나 본인 소유가 아님 |

### PATCH `/api/monitored-apps/:id`

주의 앱 정보를 수정합니다.

- 인증: 필요
- 상태: 구현완료

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| packageName | string | N | Android 앱 패키지명 |
| appName | string | N | 앱 이름 |
| appIcon | string | N | 앱 아이콘 이미지 주소 또는 식별값 |
| sortOrder | number | N | 0 이상 정수 |

#### Request Example

```json
{
  "appName": "YouTube",
  "sortOrder": 1
}
```

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "packageName": "com.google.android.youtube",
    "appName": "YouTube",
    "appIcon": null,
    "sortOrder": 1,
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T00:00:00.000Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | VALIDATION_ERROR | 빈 문자열 또는 잘못된 `sortOrder` |
| 404 | MONITORED_APP_NOT_FOUND | 존재하지 않거나 본인 소유가 아님 |
| 409 | MONITORED_APP_ALREADY_EXISTS | 변경하려는 `packageName`이 이미 등록됨 |

### DELETE `/api/monitored-apps/:id`

주의 앱을 삭제합니다.

- 인증: 필요
- 상태: 구현완료
- 관련 `app_goals`, `reminder_restricted_apps` 등은 Prisma cascade 정책을 따릅니다.

#### Response 204

응답 body 없음.

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 404 | MONITORED_APP_NOT_FOUND | 존재하지 않거나 본인 소유가 아님 |

## 7. Timer

현재 타이머 API는 임시/부분 구현입니다. 기능명세서의 스마트폰 사용 시간 집계와는 아직 직접 연결되어 있지 않습니다.

### POST `/api/timers/start`

- 인증: 불필요
- 상태: 부분구현

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| userId | string | Y | 사용자 ID |

#### Response 201

```json
{
  "success": true,
  "data": {
    "id": null,
    "userId": "uuid",
    "startedAt": "2026-07-07T00:00:00.000Z",
    "status": "running"
  }
}
```

### POST `/api/timers/stop`

- 인증: 불필요
- 상태: 부분구현

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| timerId | string | Y | 타이머 ID |

#### Response 200

```json
{
  "success": true,
  "data": {
    "timerId": "timer-id",
    "stoppedAt": "2026-07-07T00:00:00.000Z"
  }
}
```

## 8. Group

현재 그룹 API는 샘플/부분 구현입니다. 기능명세서 핵심 화면과 직접 연결된 API는 아닙니다.

### GET `/api/groups`

- 인증: 불필요
- 상태: 부분구현

#### Response 200

```json
{
  "success": true,
  "data": []
}
```

### POST `/api/groups`

- 인증: 불필요
- 상태: 부분구현

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| name | string | Y | 그룹 이름 |

#### Response 201

```json
{
  "success": true,
  "data": {
    "id": null,
    "name": "Morning study group",
    "createdAt": "2026-07-07T00:00:00.000Z"
  }
}
```

## 9. Auth / User

기능명세서 `A101`, `A102`, `MY101`, `MY102`, `MY104`, `MY105`, `MY106`에 해당합니다.

공통 정책:

- 소셜 인증 시 Name, Email은 필수 수집합니다.
- 동일 이메일 중복 가입은 허용하지 않습니다.
- 같은 이메일로 다른 소셜 제공자가 들어오면 계정 연동 플로우를 사용합니다.
- 탈퇴 요청 후 14일 동안은 `WITHDRAWAL_PENDING` 상태로 보존합니다.

### POST `/api/auth/google`

구글 소셜 로그인/회원가입을 처리합니다.

- 인증: 불필요
- 상태: 예정

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| providerUserId | string | Y | 구글 사용자 고유 ID |
| email | string | Y | 구글 계정 이메일 |
| name | string | Y | 사용자 이름 |
| profileImage | string | N | 프로필 이미지 URL |

#### Response 200

기존 사용자 로그인 성공.

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동",
      "profileImage": null,
      "motivation": null,
      "status": "ACTIVE"
    },
    "isNewUser": false
  }
}
```

#### Response 201

신규 사용자 가입 성공.

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동",
      "profileImage": null,
      "motivation": null,
      "status": "ACTIVE"
    },
    "isNewUser": true
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | VALIDATION_ERROR | 필수값 누락 |
| 409 | ACCOUNT_LINK_REQUIRED | 동일 이메일의 다른 소셜 계정이 존재함 |
| 409 | WITHDRAWAL_PENDING | 탈퇴 유예 계정이며 복구 확인이 필요함 |

### POST `/api/auth/recover-withdrawal`

탈퇴 유예 상태(`WITHDRAWAL_PENDING`)의 계정을 복구하고 로그인 토큰을 발급합니다.

- 인증: 불필요
- 상태: 예정
- 탈퇴 요청 후 14일 이내인 계정만 복구할 수 있습니다.
- 14일이 지난 계정은 복구하지 않고 신규 가입 플로우를 사용합니다.

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| provider | string | Y | `GOOGLE` 또는 `KAKAO` |
| providerUserId | string | Y | 소셜 제공자 사용자 고유 ID |
| email | string | Y | 소셜 계정 이메일 |

#### Response 200

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동",
      "profileImage": null,
      "motivation": null,
      "status": "ACTIVE"
    }
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | VALIDATION_ERROR | 필수값 누락 또는 잘못된 provider |
| 404 | USER_NOT_FOUND | 복구 가능한 탈퇴 유예 계정이 없음 |
| 410 | WITHDRAWAL_EXPIRED | 탈퇴 유예 기간이 만료됨 |

### POST `/api/auth/kakao`

카카오 소셜 로그인/회원가입을 처리합니다.

- 인증: 불필요
- 상태: 예정

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| providerUserId | string | Y | 카카오 사용자 고유 ID |
| email | string | Y | 카카오 계정 이메일 |
| name | string | N | 사용자 이름 |
| profileImage | string | N | 프로필 이미지 URL |

#### Response 200/201

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동",
      "profileImage": null,
      "motivation": null,
      "status": "ACTIVE"
    },
    "isNewUser": true
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | VALIDATION_ERROR | 필수값 누락 |
| 409 | ACCOUNT_LINK_REQUIRED | 동일 이메일의 다른 소셜 계정이 존재함 |
| 409 | WITHDRAWAL_PENDING | 탈퇴 유예 계정이며 복구 확인이 필요함 |

### POST `/api/auth/link-account`

동일 이메일의 기존 계정에 신규 소셜 계정을 연결합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| provider | string | Y | `GOOGLE` 또는 `KAKAO` |
| providerUserId | string | Y | 소셜 제공자 사용자 고유 ID |
| email | string | Y | 연결할 소셜 계정 이메일 |

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "provider": "KAKAO",
    "providerUserId": "kakao-user-id",
    "email": "user@example.com"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | VALIDATION_ERROR | 필수값 누락 또는 잘못된 provider |
| 409 | SOCIAL_ACCOUNT_ALREADY_LINKED | 이미 연결된 소셜 계정 |

### POST `/api/auth/logout`

로그아웃을 수행합니다.

- 인증: 필요
- 상태: 예정
- 서버는 별도 토큰 블랙리스트를 사용하지 않는 한 204만 반환합니다.
- 클라이언트는 로컬에 저장된 JWT를 삭제해야 합니다.

#### Response 204

응답 body 없음.

### GET `/api/users/me`

내 프로필 정보를 조회합니다.

- 인증: 필요
- 상태: 예정

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "홍길동",
    "profileImage": null,
    "motivation": "오늘은 2시간만 사용하기",
    "status": "ACTIVE",
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T00:00:00.000Z"
  }
}
```

### PATCH `/api/users/me`

내 이름과 목표/다짐 문구를 수정합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| name | string | N | 사용자 이름 |
| motivation | string | N | 메인 화면 목표/다짐 문구. 공백 포함 최대 100자 |

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "김도이",
    "profileImage": null,
    "motivation": "오늘은 필요한 앱만 보기",
    "status": "ACTIVE",
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T01:00:00.000Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | VALIDATION_ERROR | 빈 이름 또는 100자 초과 motivation |

### DELETE `/api/users/me`

회원 탈퇴를 요청합니다.

- 인증: 필요
- 상태: 예정
- 즉시 영구 삭제하지 않고 14일 유예 상태로 변경합니다.

#### Response 204

응답 body 없음.

## 10. TotalGoal

기능명세서 `SET105`, `MAIN103`, 정책 `SET-03`에 해당합니다.

공통 정책:

- 인증 필요
- 사용자당 전체 목표는 1개입니다.
- `targetMinutes`는 10~1430분만 허용합니다.

### POST `/api/total-goals`

전체 폰 사용 목표를 생성합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| targetMinutes | number | Y | 하루 목표 사용 시간(분) |
| restrictAfter | boolean | N | 목표 초과 후 제한 여부. 기본값 false |

#### Response 201

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "targetMinutes": 120,
    "restrictAfter": false,
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T00:00:00.000Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | INVALID_TARGET_MINUTES | 목표 시간이 10~1430분 범위를 벗어남 |
| 409 | TOTAL_GOAL_ALREADY_EXISTS | 이미 전체 목표가 존재함 |

### GET `/api/total-goals`

로그인 사용자의 전체 목표를 조회합니다.

- 인증: 필요
- 상태: 예정

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "targetMinutes": 120,
    "restrictAfter": false,
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T00:00:00.000Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 404 | TOTAL_GOAL_NOT_FOUND | 전체 목표가 없음 |

### PATCH `/api/total-goals`

전체 목표를 수정합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| targetMinutes | number | N | 하루 목표 사용 시간(분) |
| restrictAfter | boolean | N | 목표 초과 후 제한 여부 |

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "targetMinutes": 90,
    "restrictAfter": true,
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T01:00:00.000Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | INVALID_TARGET_MINUTES | 목표 시간이 10~1430분 범위를 벗어남 |
| 400 | VALIDATION_ERROR | 수정 가능한 필드가 하나도 없음 |
| 404 | TOTAL_GOAL_NOT_FOUND | 전체 목표가 없음 |

## 11. AppGoal

기능명세서 `SET106`, `SET107`, `SET108`, `MAIN104`, 정책 `SET-04`, `SET-05`에 해당합니다.

공통 정책:

- 인증 필요
- `monitoredAppId`는 로그인 사용자의 주의 앱이어야 합니다.
- 주의 앱 1개당 앱 목표는 1개입니다.
- `targetMinutes`는 10~1430분만 허용합니다.
- `targetCount`는 1 이상만 허용합니다.
- `goalReason`은 공백 포함 최대 100자입니다.

### POST `/api/app-goals`

앱별 목표를 생성합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| monitoredAppId | string | Y | 주의 앱 ID |
| targetMinutes | number | Y | 앱별 목표 사용 시간(분) |
| targetCount | number | Y | 앱별 목표 진입 횟수 |
| restrictAfter | boolean | N | 목표 초과 후 제한 여부 |
| goalReason | string | N | 목표 설정 이유. 최대 100자 |

#### Response 201

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "monitoredAppId": "uuid",
    "targetMinutes": 60,
    "targetCount": 5,
    "restrictAfter": true,
    "goalReason": "쇼츠를 줄이기 위해",
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T00:00:00.000Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | INVALID_TARGET_MINUTES | 목표 시간이 10~1430분 범위를 벗어남 |
| 400 | INVALID_TARGET_COUNT | 목표 횟수가 1 미만 |
| 400 | INVALID_GOAL_REASON | 목표 이유가 100자 초과 |
| 404 | MONITORED_APP_NOT_FOUND | 주의 앱이 없거나 본인 소유가 아님 |
| 409 | APP_GOAL_ALREADY_EXISTS | 해당 앱 목표가 이미 존재함 |

### GET `/api/app-goals?monitoredAppId=uuid`

특정 주의 앱의 목표를 조회합니다.

- 인증: 필요
- 상태: 예정

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "monitoredAppId": "uuid",
    "targetMinutes": 60,
    "targetCount": 5,
    "restrictAfter": true,
    "goalReason": "쇼츠를 줄이기 위해",
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T00:00:00.000Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | VALIDATION_ERROR | `monitoredAppId` 누락 |
| 404 | MONITORED_APP_NOT_FOUND | 주의 앱이 없거나 본인 소유가 아님 |
| 404 | APP_GOAL_NOT_FOUND | 해당 앱 목표가 없음 |

### PATCH `/api/app-goals/:id`

앱별 목표를 수정합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| targetMinutes | number | N | 앱별 목표 사용 시간(분) |
| targetCount | number | N | 앱별 목표 진입 횟수 |
| restrictAfter | boolean | N | 목표 초과 후 제한 여부 |
| goalReason | string | N | 목표 설정 이유. 최대 100자 |

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "monitoredAppId": "uuid",
    "targetMinutes": 45,
    "targetCount": 3,
    "restrictAfter": false,
    "goalReason": "필요한 연락만 확인하기",
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T01:00:00.000Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | INVALID_TARGET_MINUTES | 목표 시간이 10~1430분 범위를 벗어남 |
| 400 | INVALID_TARGET_COUNT | 목표 횟수가 1 미만 |
| 400 | INVALID_GOAL_REASON | 목표 이유가 100자 초과 |
| 400 | VALIDATION_ERROR | 수정 가능한 필드가 하나도 없음 |
| 404 | APP_GOAL_NOT_FOUND | 앱 목표가 없거나 본인 소유가 아님 |

## 12. Reminder

기능명세서 `REM101`~`REM109`, 서비스 정책 `REM-01`~`REM-10`에 해당합니다.

### Common Rules

- 인증이 필요합니다. `Authorization: Bearer <accessToken>`
- `date`는 `YYYY-MM-DD` 형식이며, 실제 존재하는 캘린더 날짜만 허용합니다.
- `startTime`, `endTime`은 timezone을 포함한 ISO datetime string만 허용합니다.
  - 허용 예: `2026-07-16T09:00:00.000Z`
  - 허용 예: `2026-07-16T09:00:00+09:00`
  - 거부 예: `2026-07-16T09:00:00`
- `startTime`, `endTime`은 KST 기준으로 `date`와 같은 날짜여야 합니다.
  - 예: `date=2026-07-16`, `startTime=2026-07-15T15:00:00.000Z`는 KST 기준 2026-07-16 00:00이므로 허용합니다.
  - 예: `date=2026-07-16`, `startTime=2026-07-16T15:00:00.000Z`는 KST 기준 2026-07-17 00:00이므로 거부합니다.
- `title`은 공백 포함 최대 20자입니다. 빈 문자열 또는 공백만 있는 값은 거부합니다.
- 하나의 일정은 최소 1분 이상이어야 합니다.
- 같은 사용자, 같은 날짜 안에서는 일정 시간대가 서로 중복될 수 없습니다.
- 경계 시간이 맞닿는 일정은 중복으로 보지 않습니다.
  - 예: `12:00~13:00`, `13:00~14:00`은 허용합니다.
- `restrictMode`는 `NONE`, `FULL_PHONE`, `SPECIFIC_APP`만 허용합니다.
- `SPECIFIC_APP`은 사용자가 사전에 등록한 본인 소유 주의 앱만 제한 대상으로 지정할 수 있습니다.
- `NONE`, `FULL_PHONE` 모드에서는 전달된 `restrictedAppIds`가 저장되지 않고 빈 배열로 정리됩니다.

### POST `/api/reminders`

할 일을 생성합니다.

- 인증: 필요
- 상태: 구현됨

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| date | string | Y | 일정 날짜. `YYYY-MM-DD` 형식의 실제 존재 날짜 |
| title | string | Y | 일정 이름. 공백 포함 최대 20자 |
| startTime | string | Y | 시작 시각. timezone을 포함한 ISO datetime string |
| endTime | string | Y | 종료 시각. timezone을 포함한 ISO datetime string |
| restrictMode | string | N | `NONE`, `FULL_PHONE`, `SPECIFIC_APP`. 기본값 `NONE` |
| restrictedAppIds | string[] | N | `SPECIFIC_APP`일 때 제한할 주의 앱 ID 목록 |

#### Request Example

```json
{
  "date": "2026-07-16",
  "title": "postman test",
  "startTime": "2026-07-16T12:00:00.000Z",
  "endTime": "2026-07-16T13:00:00.000Z",
  "restrictMode": "NONE"
}
```

#### Response 201

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "date": "2026-07-16T00:00:00.000Z",
    "title": "postman test",
    "startTime": "2026-07-16T12:00:00.000Z",
    "endTime": "2026-07-16T13:00:00.000Z",
    "restrictMode": "NONE",
    "restrictedAppIds": [],
    "createdAt": "2026-07-16T08:12:17.761Z",
    "updatedAt": "2026-07-16T08:12:17.761Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | VALIDATION_ERROR | 필수값 누락, 빈 문자열, 제목 20자 초과, 날짜/시간 형식 오류 |
| 400 | INVALID_TIME_RANGE | 종료 시각이 시작 시각보다 빠르거나, 일정이 1분 미만이거나, KST 기준 날짜가 `date`와 다름 |
| 400 | INVALID_RESTRICT_MODE | 제한 모드가 `NONE`, `FULL_PHONE`, `SPECIFIC_APP` 중 하나가 아님 |
| 400 | INVALID_RESTRICTED_APP_IDS | `SPECIFIC_APP`인데 제한 앱 목록이 없거나, 본인 소유 주의 앱이 아님 |
| 409 | REMINDER_TIME_OVERLAP | 같은 날짜에 겹치는 일정이 있음 |

### GET `/api/reminders?date=YYYY-MM-DD`

날짜별 할 일 목록을 조회합니다.

- 인증: 필요
- 상태: 구현됨
- `date`가 없으면 KST 기준 오늘 날짜를 기본값으로 사용합니다.
- 정렬: `startTime asc`, `endTime asc`, `createdAt asc`

#### Query Parameters

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| date | string | N | 조회 날짜. `YYYY-MM-DD` 형식의 실제 존재 날짜 |

#### Response 200

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "date": "2026-07-16T00:00:00.000Z",
      "title": "postman test",
      "startTime": "2026-07-16T12:00:00.000Z",
      "endTime": "2026-07-16T13:00:00.000Z",
      "restrictMode": "NONE",
      "restrictedAppIds": [],
      "createdAt": "2026-07-16T08:12:17.761Z",
      "updatedAt": "2026-07-16T08:12:17.761Z"
    }
  ]
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | VALIDATION_ERROR | `date` 형식이 `YYYY-MM-DD`가 아니거나 실제 존재하지 않는 날짜 |

### GET `/api/reminders/:id`

할 일 단건을 조회합니다.

- 인증: 필요
- 상태: 구현됨
- 본인 소유 할 일만 조회할 수 있습니다.

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "date": "2026-07-16T00:00:00.000Z",
    "title": "postman test",
    "startTime": "2026-07-16T12:00:00.000Z",
    "endTime": "2026-07-16T13:00:00.000Z",
    "restrictMode": "NONE",
    "restrictedAppIds": [],
    "createdAt": "2026-07-16T08:12:17.761Z",
    "updatedAt": "2026-07-16T08:12:17.761Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 404 | REMINDER_NOT_FOUND | 할 일이 없거나 본인 소유가 아님 |

### PATCH `/api/reminders/:id`

할 일을 수정합니다.

- 인증: 필요
- 상태: 구현됨
- 요청 body는 `POST /api/reminders`와 동일한 필드를 부분적으로 허용합니다.
- 최소 1개 이상의 수정 가능한 필드가 필요합니다.
- 요청하지 않은 필드는 기존 값을 유지한 뒤 전체 정책을 다시 검증합니다.
- `restrictedAppIds`가 전달되면 기존 제한 앱 목록을 전체 교체합니다.
- `restrictMode`를 `NONE` 또는 `FULL_PHONE`으로 변경하면 `restrictedAppIds`는 빈 배열로 저장됩니다.
- `restrictMode`가 `SPECIFIC_APP`인 경우, 기존 또는 요청으로 확정된 `restrictedAppIds`가 1개 이상 있어야 합니다.

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| date | string | N | 일정 날짜. `YYYY-MM-DD` 형식의 실제 존재 날짜 |
| title | string | N | 일정 이름. 공백 포함 최대 20자 |
| startTime | string | N | 시작 시각. timezone을 포함한 ISO datetime string |
| endTime | string | N | 종료 시각. timezone을 포함한 ISO datetime string |
| restrictMode | string | N | `NONE`, `FULL_PHONE`, `SPECIFIC_APP` |
| restrictedAppIds | string[] | N | `SPECIFIC_APP`일 때 제한할 주의 앱 ID 목록 |

#### Request Example

```json
{
  "title": "updated postman"
}
```

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "date": "2026-07-16T00:00:00.000Z",
    "title": "updated postman",
    "startTime": "2026-07-16T12:00:00.000Z",
    "endTime": "2026-07-16T13:00:00.000Z",
    "restrictMode": "NONE",
    "restrictedAppIds": [],
    "createdAt": "2026-07-16T08:12:17.761Z",
    "updatedAt": "2026-07-16T08:15:35.208Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | VALIDATION_ERROR | 수정 가능한 필드가 없거나, 빈 문자열, 제목 20자 초과, 날짜/시간 형식 오류 |
| 400 | INVALID_TIME_RANGE | 종료 시각이 시작 시각보다 빠르거나, 일정이 1분 미만이거나, KST 기준 날짜가 `date`와 다름 |
| 400 | INVALID_RESTRICT_MODE | 제한 모드가 `NONE`, `FULL_PHONE`, `SPECIFIC_APP` 중 하나가 아님 |
| 400 | INVALID_RESTRICTED_APP_IDS | `SPECIFIC_APP`인데 제한 앱 목록이 없거나, 본인 소유 주의 앱이 아님 |
| 404 | REMINDER_NOT_FOUND | 할 일이 없거나 본인 소유가 아님 |
| 409 | REMINDER_TIME_OVERLAP | 같은 날짜에 겹치는 일정이 있음 |

### DELETE `/api/reminders/:id`

할 일을 삭제합니다.

- 인증: 필요
- 상태: 구현됨
- 본인 소유 할 일만 삭제할 수 있습니다.

#### Response 204

응답 body 없음.

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 404 | REMINDER_NOT_FOUND | 할 일이 없거나 본인 소유가 아님 |

## 13. UsageLog / UsageReason

기능명세서 `REP101`, `REP102`, `REP106`, 정책 `REP-01`에 해당합니다.

### GET `/api/usage-logs?date=YYYY-MM-DD`

일별 주의 앱 사용량을 조회합니다.

- 인증: 필요
- 상태: 예정

#### Response 200

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "monitoredAppId": "uuid",
      "date": "2026-07-07",
      "usedMinutes": 35,
      "entryCount": 4,
      "createdAt": "2026-07-07T00:00:00.000Z",
      "updatedAt": "2026-07-07T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/usage-reasons`

특정 앱 사용 시간 블록에 대한 사용 사유를 입력합니다.

- 인증: 필요
- 상태: 예정
- 입력/수정 가능 시간: 당일 22:00 ~ 익일 10:00

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| monitoredAppId | string | Y | 주의 앱 ID |
| usageLogId | string | N | 연결된 일별 사용 기록 ID |
| date | string | Y | 사용 날짜. `YYYY-MM-DD` |
| timeRangeStart | string | Y | 사용 시간 구간 시작 ISO string |
| timeRangeEnd | string | Y | 사용 시간 구간 종료 ISO string |
| reason | string | Y | 사용 사유. 최대 100자 |

#### Response 201

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "monitoredAppId": "uuid",
    "usageLogId": "uuid",
    "date": "2026-07-07",
    "timeRangeStart": "2026-07-07T12:00:00.000Z",
    "timeRangeEnd": "2026-07-07T12:30:00.000Z",
    "reason": "휴식 중 시청",
    "createdAt": "2026-07-07T22:10:00.000Z",
    "updatedAt": "2026-07-07T22:10:00.000Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | VALIDATION_ERROR | 필수값 누락 또는 사유 100자 초과 |
| 403 | USAGE_REASON_TIME_FORBIDDEN | 입력 가능 시간대가 아님 |
| 404 | MONITORED_APP_NOT_FOUND | 주의 앱이 없거나 본인 소유가 아님 |

### GET `/api/usage-reasons/calendar?month=YYYY-MM`

월 단위로 사용 사유 입력 여부를 조회합니다.

- 인증: 필요
- 상태: 예정

#### Response 200

```json
{
  "success": true,
  "data": [
    {
      "date": "2026-07-01",
      "hasReason": true
    },
    {
      "date": "2026-07-02",
      "hasReason": false
    }
  ]
}
```

## 14. AlertSetting

기능명세서 `REP107`, 정책 `REP-04`, `REP-05`에 해당합니다.

공통 정책:

- 인증 필요
- 알림 수신은 항상 ON을 기본으로 합니다.
- 알림 시간은 22:00~23:59 사이만 허용합니다.
- DB 저장값은 `alertTimeMinutes`입니다.

### GET `/api/alert-settings`

하루 알림 설정을 조회합니다.

- 인증: 필요
- 상태: 예정

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "enabled": true,
    "alertTimeMinutes": 1320,
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T00:00:00.000Z"
  }
}
```

### PATCH `/api/alert-settings`

하루 알림 시간을 수정합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| alertTimeMinutes | number | Y | 22:00~23:59. 1320~1439 |

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "alertTimeMinutes": 1380,
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T01:00:00.000Z"
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | INVALID_ALERT_TIME | 1320~1439 범위를 벗어남 |

## 15. Report / AI

기능명세서 `REP103`, `REP104`, `REP105`, 정책 `REP-02`, `REP-03`에 해당합니다.

### GET `/api/reports/summary?range=week|month&date=YYYY-MM-DD`

주간/월간 사용 사유 요약을 조회합니다.

- 인증: 필요
- 상태: 예정

#### Query Parameters

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| range | string | Y | `week` 또는 `month` |
| date | string | N | 기준 날짜. 없으면 KST 오늘 |

#### Response 200

```json
{
  "success": true,
  "data": {
    "range": "week",
    "from": "2026-07-01",
    "to": "2026-07-07",
    "keywords": [
      {
        "text": "휴식",
        "count": 3
      }
    ],
    "summary": "휴식 시간에 숏폼 사용이 반복되었습니다."
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 400 | INVALID_REPORT_RANGE | range가 올바르지 않음 |
| 422 | INSUFFICIENT_REPORT_DATA | 최소 집계 기준 미달 |

### POST `/api/ai/daily-feedback`

금일 사용 로그와 사용 사유를 기반으로 AI 피드백을 생성합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| date | string | N | 기준 날짜. 없으면 KST 오늘 |

#### Response 200

```json
{
  "success": true,
  "data": {
    "date": "2026-07-07",
    "feedback": "오늘은 점심 시간대 사용이 많았습니다. 앱을 열기 전 5분 휴식을 먼저 시도해보세요."
  }
}
```

#### Errors

| Status | Code | 설명 |
|---|---|---|
| 422 | INSUFFICIENT_AI_FEEDBACK_DATA | 사용 로그 또는 사용 사유 데이터 부족 |

### POST `/api/ai/suggest-goal`

사용자의 목표 사유를 바탕으로 앱별 목표 시간/횟수를 제안합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| monitoredAppId | string | Y | 주의 앱 ID |
| goalReason | string | Y | 목표 설정 이유 |

#### Response 200

```json
{
  "success": true,
  "data": {
    "monitoredAppId": "uuid",
    "suggestedTargetMinutes": 60,
    "suggestedTargetCount": 5,
    "reason": "현재 목표 사유 기준으로 1시간 제한을 추천합니다."
  }
}
```

## 16. 구현 순서 권장안

1. Auth/User
2. TotalGoal
3. AppGoal
4. AlertSetting
5. Reminder
6. UsageLog/UsageReason
7. Report/AI

## 17. 문서 운영 규칙

- 도메인 구현 PR은 이 문서의 endpoint, request, response, error code를 기준으로 작성합니다.
- 구현 중 정책 변경이 필요하면 코드보다 먼저 이 문서를 수정하고 PR 설명에 변경 이유를 남깁니다.
- Swagger 주석과 `docs/API_SPEC.md`가 다르면 `docs/API_SPEC.md`를 우선 기준으로 삼고 Swagger를 갱신합니다.
- 새 에러 코드를 추가할 때는 해당 API의 `Errors` 표와 공통 에러 처리 코드에 함께 반영합니다.
