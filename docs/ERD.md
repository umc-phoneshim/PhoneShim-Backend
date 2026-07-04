# 폰쉼(PhoneShim) ERD

## 개요

폰쉼 서비스의 데이터베이스 구조를 정의한 문서입니다. 사용자가 지정한 주의 어플(숏폼 등)의 사용 시간을 추적하고, 목표 시간 초과 시 제한/알림을 제공하며, 리마인더와 데일리 리포트를 통해 습관 개선을 돕는 기능을 지원합니다.

- DB: PostgreSQL
- 설계 도구: ERDCloud

## ERD 다이어그램

![ERD](./images/erd.png)

## 테이블 설명

### 1. users (사용자)

사용자의 계정 및 기본 정보를 저장하는 테이블

| 컬럼명 | 설명 |
|---|---|
| id | 사용자를 구분하는 고유 식별자(기본키) |
| email | 로그인에 사용하는 이메일 주소 |
| name | 사용자 닉네임 또는 이름 |
| provider | 소셜 로그인 제공자(GOOGLE, KAKAO) |
| profile_image | 사용자 프로필 이미지 주소 |
| withdrawal_requested_at | 회원 탈퇴를 요청한 시각(14일 유예 기간 관리용) |
| created_at | 회원 정보가 생성된 시각 |
| updated_at | 회원 정보가 마지막으로 수정된 시각 |

### 2. total_goals (전체 사용 목표)

사용자의 하루 전체 스마트폰 사용 목표를 저장하는 테이블

| 컬럼명 | 설명 |
|---|---|
| id | 전체 목표 정보의 고유 식별자 |
| user_id | 목표를 설정한 사용자 ID(users 참조) |
| target_minutes | 하루 목표 스마트폰 사용 시간(분) |
| restrict_after | 목표 시간을 초과했을 때 제한 기능을 사용할지 여부 |
| created_at | 목표 생성 시각 |
| updated_at | 목표 수정 시각 |

### 3. monitored_apps (주의 앱)

사용자가 사용 시간을 관리할 앱 목록을 저장하는 테이블

| 컬럼명 | 설명 |
|---|---|
| id | 주의 앱의 고유 식별자 |
| user_id | 해당 앱을 등록한 사용자 ID |
| app_name | 앱 이름(예: YouTube, Instagram) |
| app_icon | 앱 아이콘 이미지 |
| order | 앱 표시 순서 |
| created_at | 앱 등록 시각 |

### 4. app_goals (앱별 목표)

특정 앱에 대한 사용 목표를 저장하는 테이블

| 컬럼명 | 설명 |
|---|---|
| id | 앱 목표의 고유 식별자 |
| monitored_app_id | 목표를 설정한 주의 앱 ID |
| target_minutes | 해당 앱의 목표 사용 시간(분) |
| target_count | 하루 목표 실행 횟수 |
| restrict_after | 목표 초과 시 앱 제한 여부 |
| goal_reason | 해당 목표를 설정한 이유 |
| created_at | 목표 생성 시각 |
| updated_at | 목표 수정 시각 |

### 5. usage_logs (사용 기록)

사용자의 앱 사용 내역을 기록하는 테이블

| 컬럼명 | 설명 |
|---|---|
| id | 사용 기록의 고유 식별자 |
| user_id | 사용 기록의 사용자 ID |
| monitored_app_id | 사용한 주의 앱 ID |
| date | 사용한 날짜 |
| start_time | 앱 사용 시작 시각 |
| end_time | 앱 사용 종료 시각 |
| used_minutes | 실제 사용 시간(분) |
| entry_count | 앱 실행 횟수 |

### 6. reminders (리마인더)

사용자의 일정 및 할 일을 저장하는 테이블

| 컬럼명 | 설명 |
|---|---|
| id | 리마인더의 고유 식별자 |
| user_id | 리마인더를 등록한 사용자 ID |
| date | 일정 날짜 |
| title | 일정 제목 |
| start_time | 시작 시간 |
| end_time | 종료 시간 |
| restrict_mode | 일정 시간 동안 적용할 제한 방식(없음/휴대폰 전체/특정 앱) |
| created_at | 리마인더 생성 시각 |
| updated_at | 리마인더 수정 시각 |

### 7. reminder_restricted_apps (리마인더 제한 앱)

리마인더에서 제한할 앱을 저장하는 중간 테이블

| 컬럼명 | 설명 |
|---|---|
| reminder_id | 리마인더 ID(기본키, 외래키) |
| monitored_app_id | 제한 대상 앱 ID(기본키, 외래키) |

**설명**: 하나의 리마인더에서 여러 개의 앱을 제한할 수 있고, 하나의 앱도 여러 리마인더에서 제한될 수 있으므로 N:M 관계를 표현하기 위한 중간 테이블이다.

### 8. usage_reasons (사용 사유)

목표를 초과하여 사용한 이유를 기록하는 테이블

| 컬럼명 | 설명 |
|---|---|
| id | 사용 사유의 고유 식별자 |
| user_id | 사용 사유를 작성한 사용자 ID |
| monitored_app_id | 사용 사유가 기록된 앱 ID |
| date | 사용한 날짜 |
| time_range_start | 사용 시간 구간 시작 |
| time_range_end | 사용 시간 구간 종료 |
| reason | 사용 사유 |
| created_at | 작성 시각 |

### 9. alert_settings (알림 설정)

사용자의 알림 관련 설정을 저장하는 테이블

| 컬럼명 | 설명 |
|---|---|
| id | 알림 설정의 고유 식별자 |
| user_id | 알림 설정을 가진 사용자 ID |
| alert_time | 데일리 리포트 알림 시각 |
| updated_at | 마지막 설정 변경 시각 |

## ERD 관계 설명

```
users
 ├── total_goals (1:1)
 ├── monitored_apps (1:N)
 ├── reminders (1:N)
 ├── usage_logs (1:N)
 ├── usage_reasons (1:N)
 └── alert_settings (1:1)

monitored_apps
 ├── app_goals (1:1)
 ├── usage_logs (1:N)
 ├── usage_reasons (1:N)
 └── reminder_restricted_apps (1:N)

reminders
 └── reminder_restricted_apps (1:N)
```

| 관계 | 카디널리티 |
|---|---|
| users - total_goals | 1:1 |
| users - alert_settings | 1:1 |
| users - monitored_apps | 1:N |
| users - reminders | 1:N |
| users - usage_logs | 1:N |
| users - usage_reasons | 1:N |
| monitored_apps - app_goals | 1:1 |
| monitored_apps - usage_logs | 1:N |
| monitored_apps - usage_reasons | 1:N |
| reminders - monitored_apps | N:M (reminder_restricted_apps 경유) |

## 비고 / 다음 작업자 참고사항

- 아래 컬럼은 Prisma migration 작업 시 **UNIQUE 제약**이 필요합니다 (ERDCloud 다이어그램에는 미표시):
  - `users.email`
  - `total_goals.user_id`
  - `alert_settings.user_id`
  - `app_goals.monitored_app_id`
- `monitored_apps`는 사용자당 최대 5개로 제한되나, 이는 DB 제약이 아닌 애플리케이션 레벨에서 검증 필요.
- `total_goals.target_minutes`, `app_goals.target_minutes`는 10분~1430분(23시간 50분) 범위 제약이 필요 (정책서 SET-03, SET-04 참고).
- `usage_reasons` 입력은 당일 22:00 ~ 익일 10:00 시간대에만 가능하도록 API 레벨에서 제어 필요 (정책서 REP-01 참고).
- Enum 값
  - `users.provider`: GOOGLE, KAKAO
  - `reminders.restrict_mode`: NONE, FULL_PHONE, SPECIFIC_APP

## 초기 설계 원칙

가이드라인에 따라 최소한의 엔티티와 관계를 우선 정리했으며, 개발 진행하며 점진적으로 확장/수정할 예정입니다.
