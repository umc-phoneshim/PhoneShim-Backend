# PhoneShim API 명세서

## 1. 공통 정보

- Base URL: `http://localhost:3000`
- API 문서 기준: ERD v1 보완안
- Content-Type: `application/json`
- 인증 방식: `Authorization: Bearer <accessToken>`

> 이 문서는 백엔드 구현 기준 문서입니다. API 구현 시 이 문서의 경로, 필드명, 응답 형태, 에러 코드를 우선 기준으로 삼습니다.
> 기획 기준은 Figma `폰쉼 PM 기획`의 `기능명세서 및 정책서` 페이지입니다. 기능 ID/정책 ID가 변경되면 이 문서의 매핑과 구현 상태를 함께 갱신합니다.

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

| 상태     | 의미                                                              |
| -------- | ----------------------------------------------------------------- |
| 구현완료 | 현재 코드에 라우터, 서비스, 저장소 또는 응답 흐름이 구현되어 있음 |
| 부분구현 | 라우터는 있으나 임시 구현이거나 DB 연동/정책 검증이 부족함        |
| 예정     | ERD/API 설계 기준으로 필요하지만 아직 코드 구현 전                |
| 보류     | 외부 연동 또는 정책 확정 후 구현 필요                             |

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

| Status | Code          | 설명                      |
| ------ | ------------- | ------------------------- |
| 401    | UNAUTHORIZED  | 인증 토큰이 없음          |
| 401    | INVALID_TOKEN | 인증 토큰이 유효하지 않음 |

### 공통 에러

| Status | Code                  | 설명                                                  |
| ------ | --------------------- | ----------------------------------------------------- |
| 400    | INVALID_REQUEST_BODY  | request body가 JSON object가 아님                     |
| 400    | VALIDATION_ERROR      | 필수값 누락, 타입 불일치, 빈 문자열 등 기본 검증 실패 |
| 404    | NOT_FOUND             | 등록되지 않은 라우트                                  |
| 500    | INTERNAL_SERVER_ERROR | 처리되지 않은 서버 오류                               |

## 4. 전체 API 목록

| Domain       | Method | Path                                 | 설명                          | 상태     |
| ------------ | ------ | ------------------------------------ | ----------------------------- | -------- |
| System       | GET    | `/health`                            | 서버 상태 확인                | 구현완료 |
| Timer        | POST   | `/api/timers/start`                  | 타이머 시작                   | 부분구현 |
| Timer        | POST   | `/api/timers/stop`                   | 타이머 종료                   | 부분구현 |
| Group        | GET    | `/api/groups`                        | 그룹 목록 조회                | 부분구현 |
| Group        | POST   | `/api/groups`                        | 그룹 생성                     | 부분구현 |
| MonitoredApp | POST   | `/api/monitored-apps`                | 주의 앱 등록                  | 구현완료 |
| MonitoredApp | GET    | `/api/monitored-apps`                | 주의 앱 목록 조회             | 구현완료 |
| MonitoredApp | GET    | `/api/monitored-apps/:id`            | 주의 앱 단건 조회             | 구현완료 |
| MonitoredApp | PATCH  | `/api/monitored-apps/:id`            | 주의 앱 수정                  | 구현완료 |
| MonitoredApp | DELETE | `/api/monitored-apps/:id`            | 주의 앱 삭제                  | 구현완료 |
| Auth         | POST   | `/api/auth/google`                   | 구글 로그인/회원가입          | 구현완료 |
| Auth         | POST   | `/api/auth/kakao`                    | 카카오 로그인/회원가입        | 구현완료 |
| Auth         | POST   | `/api/auth/logout`                   | 로그아웃                      | 예정     |
| Auth         | POST   | `/api/auth/link-account`             | 동일 이메일 소셜 계정 연동    | 예정     |
| Auth         | DELETE | `/api/auth/withdraw`                 | 회원 탈퇴 요청                | 구현완료 |
| User         | GET    | `/api/users/me`                      | 내 프로필 조회                | 구현완료 |
| User         | PATCH  | `/api/users/me`                      | 내 이름/목표 문구 수정        | 예정     |
| TotalGoal    | POST   | `/api/total-goals`                   | 전체 목표 생성/설정           | 구현완료 |
| TotalGoal    | GET    | `/api/total-goals`                   | 전체 목표 조회                | 구현완료 |
| TotalGoal    | PATCH  | `/api/total-goals`                   | 전체 목표 수정                | 구현완료 |
| AppGoal      | POST   | `/api/app-goals`                     | 앱별 목표 생성/설정           | 구현완료 |
| AppGoal      | GET    | `/api/app-goals?monitoredAppId=`     | 앱별 목표 조회                | 구현완료 |
| AppGoal      | PATCH  | `/api/app-goals/:id`                 | 앱별 목표 수정                | 구현완료 |
| AppGoal      | DELETE | `/api/app-goals/:id`                 | 앱별 목표 삭제                | 구현완료 |
| Reminder     | POST   | `/api/reminders`                     | 할 일 생성                    | 구현완료 |
| Reminder     | GET    | `/api/reminders?date=`               | 날짜별 할 일 목록 조회        | 구현완료 |
| Reminder     | GET    | `/api/reminders/:id`                 | 할 일 단건 조회               | 구현완료 |
| Reminder     | PATCH  | `/api/reminders/:id`                 | 할 일 수정                    | 구현완료 |
| Reminder     | DELETE | `/api/reminders/:id`                 | 할 일 삭제                    | 구현완료 |
| UsageLog     | GET    | `/api/usage-logs?date=`              | 일별 주의 앱 사용량 조회      | 구현완료 |
| UsageLog     | GET    | `/api/usage-logs/status`             | 오늘 주의 앱 사용 현황 조회   | 구현완료 |
| UsageLog     | PUT    | `/api/usage-logs`                    | 일별 주의 앱 사용량 기록/갱신 | 구현완료 |
| DeviceUsage  | PUT    | `/api/device-usage`                  | 기기 전체 사용량 기록/갱신    | 구현완료 |
| UsageReason  | POST   | `/api/usage-reasons`                 | 사용 사유 입력                | 구현완료 |
| UsageReason  | GET    | `/api/usage-reasons/calendar?month=` | 날짜별 사유 입력 여부 조회    | 예정     |
| Dashboard    | GET    | `/api/dashboard/daily-summary`       | 오늘 전체 사용 요약 조회      | 구현완료 |
| AlertSetting | GET    | `/api/alert-settings`                | 하루 알림 설정 조회           | 예정     |
| AlertSetting | PATCH  | `/api/alert-settings`                | 하루 알림 시간 수정           | 예정     |
| Report       | GET    | `/api/reports/summary?range=`        | 주간/월간 요약 조회           | 예정     |
| AI           | POST   | `/api/ai/daily-feedback`             | 일간 AI 피드백 생성           | 예정     |
| AI           | POST   | `/api/ai/suggest-goal`               | 목표 시간/횟수 AI 제안        | 예정     |

### Figma 명세 반영 현황

| Figma 영역      | 주요 기능 ID        | 현재 API 반영 상태                                                                                                                                                                         |
| --------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 회원가입/로그인 | `A101`, `A102`      | Auth API에 반영                                                                                                                                                                            |
| 온보딩/설정     | `SET101`~`SET110`   | 주의 앱/전체 목표/앱별 목표 API로 분산 반영. 사용자 성별/나이, 온보딩 완료/스킵 상태는 API/DB 계약 추가 필요                                                                               |
| 메인            | `MAIN101`~`MAIN105` | Dashboard, UsageLog, Reminder 조회 API로 반영                                                                                                                                              |
| 리마인더        | `REM101`~`REM109`   | Reminder API와 Socket.IO 동기화 계약에 반영                                                                                                                                                |
| 리포트          | `REP101`~`REP107`   | UsageLog/UsageReason, Report/AI, AlertSetting으로 분산 반영. 객관식 사용 사유 선택지와 일별 제안 저장 여부는 정책 확정 필요. 개정 이력상 `REP-08` 추가가 확인되었으나 세부 API 계약은 미정 |
| 마이            | `MY101`~`MY106`     | User/Auth API에 반영                                                                                                                                                                       |
| 설정 수정       | `PREF101`~`PREF106` | 기존 개별 조회/수정 API로 일부 반영. 통합 설정 조회/저장 API는 미정                                                                                                                        |

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
- 기기 설치 앱 목록 조회와 사용정보 접근권한 요청/거부 안내는 클라이언트 책임입니다.

### POST `/api/monitored-apps`

주의 앱을 등록합니다.

- 인증: 필요
- 상태: 구현완료

#### Request Headers

| 이름          | 필수 | 설명                   |
| ------------- | ---- | ---------------------- |
| Authorization | Y    | `Bearer <accessToken>` |

#### Request Body

| 필드        | 타입   | 필수 | 설명                                    |
| ----------- | ------ | ---- | --------------------------------------- |
| packageName | string | Y    | Android 앱 패키지명                     |
| appName     | string | Y    | 앱 이름                                 |
| appIcon     | string | N    | 앱 아이콘 이미지 주소 또는 식별값       |
| sortOrder   | number | N    | 앱 표시 순서. 없으면 마지막 순서로 저장 |

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

| Status | Code                         | 설명                                       |
| ------ | ---------------------------- | ------------------------------------------ |
| 400    | VALIDATION_ERROR             | 필수값 누락, 빈 문자열, 잘못된 `sortOrder` |
| 400    | MONITORED_APP_LIMIT_EXCEEDED | 사용자당 최대 5개 초과                     |
| 409    | MONITORED_APP_ALREADY_EXISTS | 같은 `packageName` 앱 중복                 |

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

| Status | Code                    | 설명                             |
| ------ | ----------------------- | -------------------------------- |
| 404    | MONITORED_APP_NOT_FOUND | 존재하지 않거나 본인 소유가 아님 |

### PATCH `/api/monitored-apps/:id`

주의 앱 정보를 수정합니다.

- 인증: 필요
- 상태: 구현완료

#### Request Body

| 필드        | 타입   | 필수 | 설명                              |
| ----------- | ------ | ---- | --------------------------------- |
| packageName | string | N    | Android 앱 패키지명               |
| appName     | string | N    | 앱 이름                           |
| appIcon     | string | N    | 앱 아이콘 이미지 주소 또는 식별값 |
| sortOrder   | number | N    | 0 이상 정수                       |

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

| Status | Code                         | 설명                                   |
| ------ | ---------------------------- | -------------------------------------- |
| 400    | VALIDATION_ERROR             | 빈 문자열 또는 잘못된 `sortOrder`      |
| 404    | MONITORED_APP_NOT_FOUND      | 존재하지 않거나 본인 소유가 아님       |
| 409    | MONITORED_APP_ALREADY_EXISTS | 변경하려는 `packageName`이 이미 등록됨 |

### DELETE `/api/monitored-apps/:id`

주의 앱을 삭제합니다.

- 인증: 필요
- 상태: 구현완료
- 관련 `app_goals`, `reminder_restricted_apps` 등은 Prisma cascade 정책을 따릅니다.

#### Response 204

응답 body 없음.

#### Errors

| Status | Code                    | 설명                             |
| ------ | ----------------------- | -------------------------------- |
| 404    | MONITORED_APP_NOT_FOUND | 존재하지 않거나 본인 소유가 아님 |

## 7. Timer

현재 타이머 API는 임시/부분 구현입니다. 기능명세서의 스마트폰 사용 시간 집계와는 아직 직접 연결되어 있지 않습니다.

### POST `/api/timers/start`

- 인증: 불필요
- 상태: 부분구현

#### Request Body

| 필드   | 타입   | 필수 | 설명      |
| ------ | ------ | ---- | --------- |
| userId | string | Y    | 사용자 ID |

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

| 필드    | 타입   | 필수 | 설명      |
| ------- | ------ | ---- | --------- |
| timerId | string | Y    | 타이머 ID |

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

| 필드 | 타입   | 필수 | 설명      |
| ---- | ------ | ---- | --------- |
| name | string | Y    | 그룹 이름 |

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
- 상태: 구현완료
- 클라이언트가 Google SDK로 발급받은 access token을 서버로 전달합니다.

#### Request Body

| 필드        | 타입   | 필수 | 설명                |
| ----------- | ------ | ---- | ------------------- |
| accessToken | string | Y    | Google access token |

#### Response 200

로그인 또는 회원가입 성공.

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "isNewUser": false
  }
}
```

#### Errors

| Status | Code                      | 설명                                        |
| ------ | ------------------------- | ------------------------------------------- |
| 400    | ACCESS_TOKEN_REQUIRED     | accessToken 누락                            |
| 403    | ACCOUNT_DELETED           | 탈퇴 완료된 계정                            |
| 403    | WITHDRAWAL_PERIOD_EXPIRED | 탈퇴 유예 기간이 만료된 계정                |
| 500    | INTERNAL_SERVER_ERROR     | 소셜 사용자 정보 조회 또는 로그인 처리 실패 |

### POST `/api/auth/kakao`

카카오 소셜 로그인/회원가입을 처리합니다.

- 인증: 불필요
- 상태: 구현완료
- 클라이언트가 Kakao SDK로 발급받은 access token을 서버로 전달합니다.

#### Request Body

| 필드        | 타입   | 필수 | 설명               |
| ----------- | ------ | ---- | ------------------ |
| accessToken | string | Y    | Kakao access token |

#### Response 200/201

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token",
    "isNewUser": true
  }
}
```

#### Errors

| Status | Code                      | 설명                                        |
| ------ | ------------------------- | ------------------------------------------- |
| 400    | ACCESS_TOKEN_REQUIRED     | accessToken 누락                            |
| 403    | ACCOUNT_DELETED           | 탈퇴 완료된 계정                            |
| 403    | WITHDRAWAL_PERIOD_EXPIRED | 탈퇴 유예 기간이 만료된 계정                |
| 500    | INTERNAL_SERVER_ERROR     | 소셜 사용자 정보 조회 또는 로그인 처리 실패 |

### DELETE `/api/auth/withdraw`

회원 탈퇴를 요청합니다.

- 인증: 필요
- 상태: 구현완료
- 즉시 영구 삭제하지 않고 14일 유예 상태(`WITHDRAWAL_PENDING`)로 변경합니다.
- 탈퇴 유예 기간 내 동일 소셜 계정으로 다시 로그인하면 `ACTIVE` 상태로 자동 복구되고 `withdrawalRequestedAt`은 `null`로 초기화됩니다.
- 탈퇴 유예 기간이 만료된 계정 또는 `DELETED` 계정은 로그인할 수 없습니다.

#### Response 200

```json
{
  "success": true,
  "data": {
    "status": "WITHDRAWAL_PENDING",
    "withdrawalRequestedAt": "2026-07-21T00:00:00.000Z"
  }
}
```

#### Errors

| Status | Code                       | 설명                     |
| ------ | -------------------------- | ------------------------ |
| 400    | ALREADY_WITHDRAWAL_PENDING | 이미 탈퇴 처리 중인 계정 |
| 400    | USER_ALREADY_DELETED       | 이미 삭제된 계정         |
| 401    | UNAUTHORIZED               | 인증 토큰 누락           |
| 401    | INVALID_TOKEN              | 유효하지 않은 인증 토큰  |
| 404    | USER_NOT_FOUND             | 사용자를 찾을 수 없음    |

### POST `/api/auth/link-account`

동일 이메일의 기존 계정에 신규 소셜 계정을 연결합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드           | 타입   | 필수 | 설명                       |
| -------------- | ------ | ---- | -------------------------- |
| provider       | string | Y    | `GOOGLE` 또는 `KAKAO`      |
| providerUserId | string | Y    | 소셜 제공자 사용자 고유 ID |
| email          | string | Y    | 연결할 소셜 계정 이메일    |

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

| Status | Code                          | 설명                             |
| ------ | ----------------------------- | -------------------------------- |
| 400    | VALIDATION_ERROR              | 필수값 누락 또는 잘못된 provider |
| 409    | SOCIAL_ACCOUNT_ALREADY_LINKED | 이미 연결된 소셜 계정            |

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
- 상태: 구현완료

#### Response 200

```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "name": "홍길동",
    "profileImage": null,
    "motivation": "오늘은 2시간만 사용하기"
  }
}
```

#### Errors

| Status | Code           | 설명                  |
| ------ | -------------- | --------------------- |
| 404    | USER_NOT_FOUND | 사용자를 찾을 수 없음 |

### PATCH `/api/users/me`

내 이름과 목표/다짐 문구를 수정합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드       | 타입   | 필수 | 설명                                           |
| ---------- | ------ | ---- | ---------------------------------------------- |
| name       | string | N    | 사용자 이름                                    |
| motivation | string | N    | 메인 화면 목표/다짐 문구. 공백 포함 최대 100자 |

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

| Status | Code             | 설명                               |
| ------ | ---------------- | ---------------------------------- |
| 400    | VALIDATION_ERROR | 빈 이름 또는 100자 초과 motivation |

## 10. TotalGoal

기능명세서 `SET105`, `MAIN103`, `PREF101`, `PREF103`, 정책 `SET-03`, `PR-01`, `PR-03`에 해당합니다.

공통 정책:

- 인증 필요
- 사용자당 전체 목표는 1개입니다.
- `targetMinutes`는 10~1430분만 허용합니다.
- 설정/PREF 화면 진입 시 클라이언트는 서버 DB의 최신 목표 값을 조회해 화면에 바인딩합니다.
- 전체 목표가 변경되면 클라이언트 스크린타임 엔진은 최신 제한 정책을 다시 적용해야 합니다.

### POST `/api/total-goals`

전체 폰 사용 목표를 생성합니다.

- 인증: 필요
- 상태: 구현완료

#### Request Body

| 필드          | 타입    | 필수 | 설명                                 |
| ------------- | ------- | ---- | ------------------------------------ |
| targetMinutes | number  | Y    | 하루 목표 사용 시간(분)              |
| restrictAfter | boolean | N    | 목표 초과 후 제한 여부. 기본값 false |

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

| Status | Code                      | 설명                                |
| ------ | ------------------------- | ----------------------------------- |
| 400    | INVALID_TARGET_MINUTES    | 목표 시간이 10~1430분 범위를 벗어남 |
| 409    | TOTAL_GOAL_ALREADY_EXISTS | 이미 전체 목표가 존재함             |

### GET `/api/total-goals`

로그인 사용자의 전체 목표를 조회합니다.

- 인증: 필요
- 상태: 구현완료

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

| Status | Code                 | 설명             |
| ------ | -------------------- | ---------------- |
| 404    | TOTAL_GOAL_NOT_FOUND | 전체 목표가 없음 |

### PATCH `/api/total-goals`

전체 목표를 수정합니다.

- 인증: 필요
- 상태: 구현완료

#### Request Body

| 필드          | 타입    | 필수 | 설명                    |
| ------------- | ------- | ---- | ----------------------- |
| targetMinutes | number  | N    | 하루 목표 사용 시간(분) |
| restrictAfter | boolean | N    | 목표 초과 후 제한 여부  |

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

| Status | Code                   | 설명                                |
| ------ | ---------------------- | ----------------------------------- |
| 400    | INVALID_TARGET_MINUTES | 목표 시간이 10~1430분 범위를 벗어남 |
| 400    | VALIDATION_ERROR       | 수정 가능한 필드가 하나도 없음      |
| 404    | TOTAL_GOAL_NOT_FOUND   | 전체 목표가 없음                    |

## 11. AppGoal

기능명세서 `SET106`, `SET107`, `SET108`, `MAIN104`, `PREF101`, `PREF104`, 정책 `SET-04`, `SET-05`, `PR-01`, `PR-02`, `PR-03`에 해당합니다.

공통 정책:

- 인증 필요
- `monitoredAppId`는 로그인 사용자의 주의 앱이어야 합니다.
- 주의 앱 1개당 앱 목표는 1개입니다.
- `targetMinutes`는 10~1430분만 허용합니다.
- `targetCount`는 1 이상만 허용합니다.
- `goalReason`은 공백 포함 최대 100자입니다.
- 앱별 목표 수정/삭제 후 클라이언트는 최신 제한 정책으로 스크린타임 엔진을 다시 적용해야 합니다.

### POST `/api/app-goals`

앱별 목표를 생성합니다.

- 인증: 필요
- 상태: 구현완료

#### Request Body

| 필드           | 타입    | 필수 | 설명                       |
| -------------- | ------- | ---- | -------------------------- |
| monitoredAppId | string  | Y    | 주의 앱 ID                 |
| targetMinutes  | number  | Y    | 앱별 목표 사용 시간(분)    |
| targetCount    | number  | Y    | 앱별 목표 진입 횟수        |
| restrictAfter  | boolean | N    | 목표 초과 후 제한 여부     |
| goalReason     | string  | N    | 목표 설정 이유. 최대 100자 |

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

| Status | Code                    | 설명                                |
| ------ | ----------------------- | ----------------------------------- |
| 400    | INVALID_TARGET_MINUTES  | 목표 시간이 10~1430분 범위를 벗어남 |
| 400    | INVALID_TARGET_COUNT    | 목표 횟수가 1 미만                  |
| 400    | INVALID_GOAL_REASON     | 목표 이유가 100자 초과              |
| 404    | MONITORED_APP_NOT_FOUND | 주의 앱이 없거나 본인 소유가 아님   |
| 409    | APP_GOAL_ALREADY_EXISTS | 해당 앱 목표가 이미 존재함          |

### GET `/api/app-goals?monitoredAppId=uuid`

특정 주의 앱의 목표를 조회합니다.

- 인증: 필요
- 상태: 구현완료

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

| Status | Code                    | 설명                              |
| ------ | ----------------------- | --------------------------------- |
| 400    | VALIDATION_ERROR        | `monitoredAppId` 누락             |
| 404    | MONITORED_APP_NOT_FOUND | 주의 앱이 없거나 본인 소유가 아님 |
| 404    | APP_GOAL_NOT_FOUND      | 해당 앱 목표가 없음               |

### PATCH `/api/app-goals/:id`

앱별 목표를 수정합니다.

- 인증: 필요
- 상태: 구현완료

#### Request Body

| 필드          | 타입    | 필수 | 설명                       |
| ------------- | ------- | ---- | -------------------------- |
| targetMinutes | number  | N    | 앱별 목표 사용 시간(분)    |
| targetCount   | number  | N    | 앱별 목표 진입 횟수        |
| restrictAfter | boolean | N    | 목표 초과 후 제한 여부     |
| goalReason    | string  | N    | 목표 설정 이유. 최대 100자 |

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

| Status | Code                   | 설명                                |
| ------ | ---------------------- | ----------------------------------- |
| 400    | INVALID_TARGET_MINUTES | 목표 시간이 10~1430분 범위를 벗어남 |
| 400    | INVALID_TARGET_COUNT   | 목표 횟수가 1 미만                  |
| 400    | INVALID_GOAL_REASON    | 목표 이유가 100자 초과              |
| 400    | VALIDATION_ERROR       | 수정 가능한 필드가 하나도 없음      |
| 404    | APP_GOAL_NOT_FOUND     | 앱 목표가 없거나 본인 소유가 아님   |

### DELETE `/api/app-goals/:id`

앱별 목표를 삭제합니다.

- 인증: 필요
- 상태: 구현완료
- 본인 소유 주의 앱에 연결된 목표만 삭제할 수 있습니다.

#### Response 204

응답 body 없음.

#### Errors

| Status | Code               | 설명                              |
| ------ | ------------------ | --------------------------------- |
| 404    | APP_GOAL_NOT_FOUND | 앱 목표가 없거나 본인 소유가 아님 |

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

### Restriction Execution Contract

리마인더의 제한 실행은 백엔드와 클라이언트 스크린타임 엔진이 역할을 나누어 처리합니다.

#### 책임 범위

| 구분       | 책임                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 백엔드     | 리마인더 CRUD, 시간/중복/제한 앱 소유권 검증, 제한 정책 데이터 제공          |
| 클라이언트 | 일정 시작/종료 시각 감지, 스크린타임 엔진 실행, 앱 차단 화면 노출, 제한 해제 |

백엔드는 실제 스마트폰 잠금 또는 앱 차단을 직접 수행하지 않습니다.

#### 제한 정책 데이터

클라이언트는 Reminder API 응답의 다음 필드를 제한 실행 계약으로 사용합니다.

| 필드             | 설명                                            |
| ---------------- | ----------------------------------------------- |
| id               | 제한 예약 작업을 식별하기 위한 리마인더 ID      |
| userId           | 사용자 식별자                                   |
| date             | 일정 날짜                                       |
| startTime        | 제한 시작 시각                                  |
| endTime          | 제한 종료 시각                                  |
| restrictMode     | 제한 모드. `NONE`, `FULL_PHONE`, `SPECIFIC_APP` |
| restrictedAppIds | `SPECIFIC_APP`에서 제한할 주의 앱 ID 목록       |

모드별 실행 기준은 다음과 같습니다.

| restrictMode   | 실행 기준                                                          |
| -------------- | ------------------------------------------------------------------ |
| `NONE`         | 제한 실행 없음                                                     |
| `FULL_PHONE`   | `startTime`부터 `endTime`까지 필수 앱을 제외한 앱 실행을 전면 제한 |
| `SPECIFIC_APP` | `restrictedAppIds`에 포함된 주의 앱 진입 시 차단 화면 노출         |

`SPECIFIC_APP`에서 실제 앱 차단에 패키지명이 필요한 경우, 클라이언트는 `restrictedAppIds`를 기준으로 주의 앱 API를 조회해 패키지명을 해석합니다.

#### 시작/종료 및 과거 일정 기준

- 제한 실행 대상은 현재 시각 이후에 도래하는 일정입니다.
- 과거 일정은 조회와 수정은 가능하지만 제한 실행 대상에서 제외합니다.
- 일정 시작 시점에 클라이언트는 `restrictMode`에 따라 제한을 적용합니다.
- 일정 종료 시점에 클라이언트는 해당 리마인더로 인해 적용한 제한을 해제합니다.
- 같은 사용자, 같은 날짜의 리마인더 시간대는 중복 저장될 수 없으므로, 동시에 활성화되는 리마인더는 없다는 전제를 둡니다.

#### 수정/삭제 시 갱신 기준

- 리마인더가 생성되면 클라이언트는 해당 날짜의 리마인더 목록을 재조회하거나 신규 제한 예약을 등록합니다.
- 리마인더가 수정되면 클라이언트는 기존 예약을 취소하고 최신 응답 데이터 기준으로 다시 예약합니다.
- 리마인더가 삭제되면 클라이언트는 해당 리마인더의 예약 작업을 취소합니다.
- 삭제된 리마인더가 현재 제한 실행 중이었다면 클라이언트는 해당 리마인더로 적용한 제한을 해제합니다.
- 오늘 날짜에 영향을 주는 리마인더 변경은 Socket.IO 동기화 이벤트를 발행하므로, 클라이언트는 이벤트 수신 후 관련 예약 작업과 오늘 목록을 갱신합니다.

### MAIN105 Sync Contract

리마인더 변경 사항은 메인 화면의 `오늘 할 일` 영역과 동기화되어야 합니다.

#### 동기화 책임 범위

| 구분       | 책임                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 백엔드     | 리마인더 생성/수정/삭제 후 동기화 이벤트 또는 재조회 가능한 최신 데이터 제공 |
| 클라이언트 | 이벤트 수신 또는 API 응답 이후 오늘 할 일 목록 갱신, 재접속 시 목록 재조회   |

현재 Socket.IO 서버는 연결 기반을 제공하며, KST 기준 오늘 날짜에 영향을 주는 리마인더 생성/수정/삭제 성공 후 `reminder.created`, `reminder.updated`, `reminder.deleted` 이벤트를 발행합니다. 이벤트 payload의 `requiresRefetch`는 `true`이므로 클라이언트는 이벤트 수신 후 오늘 목록을 재조회합니다.

#### 동기화 대상 기준

- KST 기준 오늘 날짜의 리마인더 생성/수정/삭제는 MAIN105 동기화 대상입니다.
- 과거 또는 미래 날짜의 리마인더 변경은 MAIN105 즉시 동기화 대상이 아닙니다.
- 수정 전 날짜와 수정 후 날짜 중 하나라도 KST 기준 오늘이면 MAIN105 동기화 대상입니다.
  - 오늘 일정이 다른 날짜로 이동한 경우 오늘 목록에서 제거되어야 합니다.
  - 다른 날짜 일정이 오늘로 이동한 경우 오늘 목록에 추가되어야 합니다.
- 클라이언트는 동기화 이벤트를 놓쳤거나 재접속한 경우 `GET /api/reminders?date=<KST 오늘>`로 오늘 목록을 재조회합니다.

#### 이벤트명

Socket.IO 구현 시 다음 이벤트명을 사용합니다.

| 이벤트명           | 발생 시점             |
| ------------------ | --------------------- |
| `reminder.created` | 리마인더 생성 성공 후 |
| `reminder.updated` | 리마인더 수정 성공 후 |
| `reminder.deleted` | 리마인더 삭제 성공 후 |

#### 이벤트 Payload

생성/수정/삭제 이벤트 payload는 다음 형식을 사용합니다.

```json
{
  "event": "reminder.created",
  "reason": "today-reminder-changed",
  "requiresRefetch": true
}
```

| 필드            | 설명                                                                              |
| --------------- | --------------------------------------------------------------------------------- |
| event           | 이벤트명                                                                          |
| reason          | 클라이언트가 갱신 목적을 구분하기 위한 문자열. 기본값 `today-reminder-changed`    |
| requiresRefetch | `true`이면 클라이언트는 오늘 할 일 목록을 재조회합니다. 기본 계약은 `true`입니다. |

#### 재접속 및 누락 이벤트 대응

- 클라이언트가 Socket.IO에 연결되면 서버는 기존 `connected` 이벤트로 연결 여부를 알립니다.
- 재접속 직후 클라이언트는 `GET /api/reminders?date=<KST 오늘>`을 호출해 MAIN105 목록을 최신화합니다.
- 이벤트 payload의 `requiresRefetch`가 `true`이면 클라이언트는 이벤트에 포함된 단일 데이터만 신뢰하지 않고 오늘 목록을 재조회합니다.
- 이벤트가 중복 수신되어도 클라이언트는 `reminder.id` 기준으로 목록을 갱신하거나 재조회 결과로 덮어써야 합니다.

### Reminder Display Contract

리마인더 목록과 메인 화면의 오늘 할 일 영역은 같은 Reminder API 응답 데이터를 사용하되, 화면별 표시 책임은 클라이언트가 가집니다.

#### 제목 표시 기준

- 백엔드는 `title` 원본 문자열을 저장하고 응답합니다.
- 백엔드는 화면 표시를 위한 말줄임표(`...`)를 저장하거나 응답값에 삽입하지 않습니다.
- 클라이언트는 화면 폭, 폰트, 버튼 영역에 따라 필요한 경우 `title`을 한 줄로 표시하고 초과 텍스트를 말줄임표로 처리합니다.
- 말줄임표는 표시 레이어에서만 적용하며, 수정 화면이나 재저장 요청에는 백엔드가 응답한 원본 `title`을 사용합니다.

#### 리마인더 목록 표시 기준

- 리마인더 목록의 각 항목 제목은 한 줄 고정을 기본 표시 정책으로 사용합니다.
- 제목 영역은 수정 버튼 또는 드래그 핸들 영역과 분리되어야 합니다.
- 제목이 길어져도 수정 버튼, 드래그 핸들, 시간/제한 상태 표시 영역을 침범하지 않아야 합니다.
- 항목의 드래그 가능 영역이 있는 경우, 텍스트 선택 또는 수정 버튼 터치 영역과 충돌하지 않도록 별도 터치 영역을 둡니다.

#### MAIN105 오늘 할 일 표시 기준

- MAIN105 오늘 할 일 영역도 Reminder API의 원본 `title`을 기준으로 목록을 구성합니다.
- 제한 버튼 또는 상태 버튼이 있는 화면에서는 버튼 영역을 고정하고, 제목 텍스트 영역은 남은 폭 안에서만 렌더링합니다.
- 제목이 길어도 제한 버튼, 완료/수정 버튼, 시간 표시와 겹치지 않아야 합니다.
- 화면 표시상 잘린 제목이 필요하면 클라이언트가 한 줄 말줄임표를 적용하고, 상세/수정 화면에서는 원본 제목을 표시합니다.

### POST `/api/reminders`

할 일을 생성합니다.

- 인증: 필요
- 상태: 구현완료

#### Request Body

| 필드             | 타입     | 필수 | 설명                                                |
| ---------------- | -------- | ---- | --------------------------------------------------- |
| date             | string   | Y    | 일정 날짜. `YYYY-MM-DD` 형식의 실제 존재 날짜       |
| title            | string   | Y    | 일정 이름. 공백 포함 최대 20자                      |
| startTime        | string   | Y    | 시작 시각. timezone을 포함한 ISO datetime string    |
| endTime          | string   | Y    | 종료 시각. timezone을 포함한 ISO datetime string    |
| restrictMode     | string   | N    | `NONE`, `FULL_PHONE`, `SPECIFIC_APP`. 기본값 `NONE` |
| restrictedAppIds | string[] | N    | `SPECIFIC_APP`일 때 제한할 주의 앱 ID 목록          |

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

| Status | Code                       | 설명                                                                                     |
| ------ | -------------------------- | ---------------------------------------------------------------------------------------- |
| 400    | VALIDATION_ERROR           | 필수값 누락, 빈 문자열, 제목 20자 초과, 날짜/시간 형식 오류                              |
| 400    | INVALID_TIME_RANGE         | 종료 시각이 시작 시각보다 빠르거나, 일정이 1분 미만이거나, KST 기준 날짜가 `date`와 다름 |
| 400    | INVALID_RESTRICT_MODE      | 제한 모드가 `NONE`, `FULL_PHONE`, `SPECIFIC_APP` 중 하나가 아님                          |
| 400    | INVALID_RESTRICTED_APP_IDS | `SPECIFIC_APP`인데 제한 앱 목록이 없거나, 본인 소유 주의 앱이 아님                       |
| 409    | REMINDER_TIME_OVERLAP      | 같은 날짜에 겹치는 일정이 있음                                                           |

### GET `/api/reminders?date=YYYY-MM-DD`

날짜별 할 일 목록을 조회합니다.

- 인증: 필요
- 상태: 구현완료
- `date`가 없으면 KST 기준 오늘 날짜를 기본값으로 사용합니다.
- 정렬: `startTime asc`, `endTime asc`, `createdAt asc`

#### Query Parameters

| 필드 | 타입   | 필수 | 설명                                          |
| ---- | ------ | ---- | --------------------------------------------- |
| date | string | N    | 조회 날짜. `YYYY-MM-DD` 형식의 실제 존재 날짜 |

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

| Status | Code             | 설명                                                          |
| ------ | ---------------- | ------------------------------------------------------------- |
| 400    | VALIDATION_ERROR | `date` 형식이 `YYYY-MM-DD`가 아니거나 실제 존재하지 않는 날짜 |

### GET `/api/reminders/:id`

할 일 단건을 조회합니다.

- 인증: 필요
- 상태: 구현완료
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

| Status | Code               | 설명                            |
| ------ | ------------------ | ------------------------------- |
| 404    | REMINDER_NOT_FOUND | 할 일이 없거나 본인 소유가 아님 |

### PATCH `/api/reminders/:id`

할 일을 수정합니다.

- 인증: 필요
- 상태: 구현완료
- 요청 body는 `POST /api/reminders`와 동일한 필드를 부분적으로 허용합니다.
- 최소 1개 이상의 수정 가능한 필드가 필요합니다.
- 요청하지 않은 필드는 기존 값을 유지한 뒤 전체 정책을 다시 검증합니다.
- `restrictedAppIds`가 전달되면 기존 제한 앱 목록을 전체 교체합니다.
- `restrictMode`를 `NONE` 또는 `FULL_PHONE`으로 변경하면 `restrictedAppIds`는 빈 배열로 저장됩니다.
- `restrictMode`가 `SPECIFIC_APP`인 경우, 기존 또는 요청으로 확정된 `restrictedAppIds`가 1개 이상 있어야 합니다.

#### Request Body

| 필드             | 타입     | 필수 | 설명                                             |
| ---------------- | -------- | ---- | ------------------------------------------------ |
| date             | string   | N    | 일정 날짜. `YYYY-MM-DD` 형식의 실제 존재 날짜    |
| title            | string   | N    | 일정 이름. 공백 포함 최대 20자                   |
| startTime        | string   | N    | 시작 시각. timezone을 포함한 ISO datetime string |
| endTime          | string   | N    | 종료 시각. timezone을 포함한 ISO datetime string |
| restrictMode     | string   | N    | `NONE`, `FULL_PHONE`, `SPECIFIC_APP`             |
| restrictedAppIds | string[] | N    | `SPECIFIC_APP`일 때 제한할 주의 앱 ID 목록       |

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

| Status | Code                       | 설명                                                                                     |
| ------ | -------------------------- | ---------------------------------------------------------------------------------------- |
| 400    | VALIDATION_ERROR           | 수정 가능한 필드가 없거나, 빈 문자열, 제목 20자 초과, 날짜/시간 형식 오류                |
| 400    | INVALID_TIME_RANGE         | 종료 시각이 시작 시각보다 빠르거나, 일정이 1분 미만이거나, KST 기준 날짜가 `date`와 다름 |
| 400    | INVALID_RESTRICT_MODE      | 제한 모드가 `NONE`, `FULL_PHONE`, `SPECIFIC_APP` 중 하나가 아님                          |
| 400    | INVALID_RESTRICTED_APP_IDS | `SPECIFIC_APP`인데 제한 앱 목록이 없거나, 본인 소유 주의 앱이 아님                       |
| 404    | REMINDER_NOT_FOUND         | 할 일이 없거나 본인 소유가 아님                                                          |
| 409    | REMINDER_TIME_OVERLAP      | 같은 날짜에 겹치는 일정이 있음                                                           |

### DELETE `/api/reminders/:id`

할 일을 삭제합니다.

- 인증: 필요
- 상태: 구현완료
- 본인 소유 할 일만 삭제할 수 있습니다.

#### Response 204

응답 body 없음.

#### Errors

| Status | Code               | 설명                            |
| ------ | ------------------ | ------------------------------- |
| 404    | REMINDER_NOT_FOUND | 할 일이 없거나 본인 소유가 아님 |

## 13. UsageLog / UsageReason

기능명세서 `REP101`, `REP102`, `REP106`, 정책 `REP-01`에 해당합니다.

공통 정책:

- 주의 앱 사용 시간/진입 횟수는 클라이언트 스크린타임 엔진이 수집하고 백엔드는 일별 집계 저장/조회 계약을 제공합니다.
- 주의 앱 진입 시 사용 이유 입력 팝업 호출은 클라이언트 책임입니다.
- 같은 주의 앱을 종료 후 1분 이내 재진입하면 사용 이유를 다시 입력하지 않아도 됩니다.
- 사용 이유를 선택하지 않고 팝업을 닫으면 클라이언트는 `기타` 사유로 저장합니다.
- 현재 API의 `reason`은 문자열 자유 입력 계약입니다. Figma 정책의 객관식 선택지 코드가 확정되면 enum/code 필드 추가를 검토합니다.

### GET `/api/usage-logs?date=YYYY-MM-DD`

일별 주의 앱 사용량을 조회합니다.

- 인증: 필요
- 상태: 구현완료
- `date`가 없으면 KST 기준 오늘 날짜를 사용합니다.

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

### GET `/api/usage-logs/status`

MAIN104에서 사용할 오늘 주의 앱 사용 현황을 조회합니다.

- 인증: 필요
- 상태: 구현완료
- KST 기준 오늘 날짜의 사용량과 앱별 목표를 함께 반환합니다.

#### Response 200

```json
{
  "success": true,
  "data": [
    {
      "monitoredAppId": "uuid",
      "appName": "YouTube",
      "packageName": "com.google.android.youtube",
      "appIcon": null,
      "sortOrder": 0,
      "targetMinutes": 60,
      "targetCount": 5,
      "usedMinutes": 35,
      "entryCount": 4
    }
  ]
}
```

### PUT `/api/usage-logs`

안드로이드 클라이언트가 일별 주의 앱 사용량을 기록하거나 갱신합니다.

- 인증: 필요
- 상태: 구현완료
- 같은 사용자, 같은 주의 앱, 같은 날짜의 기록은 upsert로 갱신됩니다.
- `date`가 없으면 KST 기준 오늘 날짜를 사용합니다.

#### Request Body

| 필드           | 타입   | 필수 | 설명                                     |
| -------------- | ------ | ---- | ---------------------------------------- |
| monitoredAppId | string | Y    | 주의 앱 ID                               |
| date           | string | N    | 사용 날짜. `YYYY-MM-DD`. 없으면 KST 오늘 |
| usedMinutes    | number | Y    | 누적 사용 시간(분)                       |
| entryCount     | number | Y    | 누적 앱 진입 횟수                        |

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "monitoredAppId": "uuid",
    "date": "2026-07-07T00:00:00.000Z",
    "usedMinutes": 35,
    "entryCount": 4,
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T01:00:00.000Z"
  }
}
```

#### Errors

| Status | Code                    | 설명                                                   |
| ------ | ----------------------- | ------------------------------------------------------ |
| 400    | VALIDATION_ERROR        | 필수값 누락, 타입 불일치, 잘못된 날짜 또는 음수 사용량 |
| 404    | MONITORED_APP_NOT_FOUND | 주의 앱이 없거나 본인 소유가 아님                      |

### POST `/api/usage-reasons`

특정 앱 사용 시간 블록에 대한 사용 사유를 입력합니다.

- 인증: 필요
- 상태: 구현완료
- 입력/수정 가능 시간: 당일 22:00 ~ 익일 10:00

#### Request Body

| 필드           | 타입   | 필수 | 설명                           |
| -------------- | ------ | ---- | ------------------------------ |
| monitoredAppId | string | Y    | 주의 앱 ID                     |
| usageLogId     | string | N    | 연결된 일별 사용 기록 ID       |
| date           | string | Y    | 사용 날짜. `YYYY-MM-DD`        |
| timeRangeStart | string | Y    | 사용 시간 구간 시작 ISO string |
| timeRangeEnd   | string | Y    | 사용 시간 구간 종료 ISO string |
| reason         | string | Y    | 사용 사유. 최대 100자          |

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

| Status | Code                        | 설명                              |
| ------ | --------------------------- | --------------------------------- |
| 400    | VALIDATION_ERROR            | 필수값 누락 또는 사유 100자 초과  |
| 403    | USAGE_REASON_TIME_FORBIDDEN | 입력 가능 시간대가 아님           |
| 404    | MONITORED_APP_NOT_FOUND     | 주의 앱이 없거나 본인 소유가 아님 |

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

## 14. Dashboard

메인 화면에서 사용할 오늘 전체 사용 요약을 조회합니다.

### GET `/api/dashboard/daily-summary`

KST 기준 오늘의 전체 사용 시간과 전체 목표 대비 상태를 조회합니다.

- 인증: 필요
- 상태: 구현완료
- 전체 목표가 없으면 `targetMinutes`, `remainingMinutes`는 `null`이고 `isExceeded`는 `false`입니다.

#### Response 200

```json
{
  "success": true,
  "data": {
    "date": "2026-07-07",
    "targetMinutes": 120,
    "usedMinutes": 35,
    "remainingMinutes": 85,
    "isExceeded": false
  }
}
```

## 15. AlertSetting

기능명세서 `REP107`, 정책 `REP-04`, `REP-05`에 해당합니다.

공통 정책:

- 인증 필요
- 알림 수신은 항상 ON을 기본으로 합니다.
- 알림 시간은 22:00~23:59 사이만 허용합니다.
- DB 저장값은 `alertTimeMinutes`입니다.
- 데일리 리포트 알림 발송과 푸시 토큰 관리는 별도 알림 인프라 계약이 필요합니다.

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

| 필드             | 타입   | 필수 | 설명                   |
| ---------------- | ------ | ---- | ---------------------- |
| alertTimeMinutes | number | Y    | 22:00~23:59. 1320~1439 |

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

| Status | Code               | 설명                    |
| ------ | ------------------ | ----------------------- |
| 400    | INVALID_ALERT_TIME | 1320~1439 범위를 벗어남 |

## 16. Report / AI

기능명세서 `REP103`, `REP104`, `REP105`, 정책 `REP-02`, `REP-03`에 해당합니다.

공통 정책:

- 제안 팝업은 금일 스마트폰 사용 시간, 앱 진입 횟수, 사용 이유를 종합 분석한 문구를 노출합니다.
- 요약 분석은 주간/월간 범위에서 사용 이유 데이터를 집계하고, 앱별 색상 표현은 클라이언트 표시 책임으로 둡니다.
- 목표 달성 캘린더 표시는 전체 폰 목표와 주의 앱 목표를 모두 만족한 날짜에만 달성으로 간주합니다.
- 현재 `GET /api/reports/summary`는 요약 집계 계약이며, 일별 제안 결과를 장기 저장하는 API/DB 계약은 아직 없습니다.

### GET `/api/reports/summary?range=week|month&date=YYYY-MM-DD`

주간/월간 사용 사유 요약을 조회합니다.

- 인증: 필요
- 상태: 예정

#### Query Parameters

| 필드  | 타입   | 필수 | 설명                       |
| ----- | ------ | ---- | -------------------------- |
| range | string | Y    | `week` 또는 `month`        |
| date  | string | N    | 기준 날짜. 없으면 KST 오늘 |

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

| Status | Code                     | 설명                  |
| ------ | ------------------------ | --------------------- |
| 400    | INVALID_REPORT_RANGE     | range가 올바르지 않음 |
| 422    | INSUFFICIENT_REPORT_DATA | 최소 집계 기준 미달   |

### POST `/api/ai/daily-feedback`

금일 사용 로그와 사용 사유를 기반으로 AI 피드백을 생성합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드 | 타입   | 필수 | 설명                       |
| ---- | ------ | ---- | -------------------------- |
| date | string | N    | 기준 날짜. 없으면 KST 오늘 |

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

| Status | Code                          | 설명                                 |
| ------ | ----------------------------- | ------------------------------------ |
| 422    | INSUFFICIENT_AI_FEEDBACK_DATA | 사용 로그 또는 사용 사유 데이터 부족 |

### POST `/api/ai/suggest-goal`

사용자의 목표 사유를 바탕으로 앱별 목표 시간/횟수를 제안합니다.

- 인증: 필요
- 상태: 예정

#### Request Body

| 필드           | 타입   | 필수 | 설명           |
| -------------- | ------ | ---- | -------------- |
| monitoredAppId | string | Y    | 주의 앱 ID     |
| goalReason     | string | Y    | 목표 설정 이유 |

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

## 17. DeviceUsage

기기 전체(모든 앱) 사용량을 일별로 기록합니다. 주의 앱만 담는 UsageLog와 달리, 데일리 리포트의 목표 달성 판정과 대시보드의 "폰 전체 사용" 기준값으로 사용합니다.

### PUT `/api/device-usage`

안드로이드 클라이언트가 그 날 기기 전체 사용 시간을 기록하거나 갱신합니다.

- 인증: 필요
- 상태: 구현완료
- 같은 사용자, 같은 날짜의 기록은 upsert로 갱신됩니다.
- `date`가 없으면 KST 기준 오늘 날짜를 사용합니다.

#### Request Body

| 필드             | 타입   | 필수 | 설명                                     |
| ---------------- | ------ | ---- | ---------------------------------------- |
| date             | string | N    | 사용 날짜. `YYYY-MM-DD`. 없으면 KST 오늘 |
| totalUsedMinutes | number | Y    | 기기 전체 사용 시간(분). 0 이상 정수     |

#### Response 200

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "date": "2026-07-07T00:00:00.000Z",
    "totalUsedMinutes": 210,
    "createdAt": "2026-07-07T00:00:00.000Z",
    "updatedAt": "2026-07-07T00:00:00.000Z"
  }
}
```

#### Errors

| Status | Code             | 설명                                        |
| ------ | ---------------- | ------------------------------------------- |
| 400    | VALIDATION_ERROR | totalUsedMinutes 누락 또는 0 미만/정수 아님 |

## 18. 구현 순서 권장안

1. Auth/User
2. TotalGoal
3. AppGoal
4. AlertSetting
5. UsageLog/UsageReason
6. Reminder
7. Report/AI

## 19. 문서 운영 규칙

- 도메인 구현 PR은 이 문서의 endpoint, request, response, error code를 기준으로 작성합니다.
- 구현 중 정책 변경이 필요하면 코드보다 먼저 이 문서를 수정하고 PR 설명에 변경 이유를 남깁니다.
- Swagger 주석과 `docs/API_SPEC.md`가 다르면 `docs/API_SPEC.md`를 우선 기준으로 삼고 Swagger를 갱신합니다.
- 새 에러 코드를 추가할 때는 해당 API의 `Errors` 표와 공통 에러 처리 코드에 함께 반영합니다.
