# 폰쉼 - Backend

> 공부 집중 및 스마트폰 절제를 돕는 서비스 **폰쉼**의 백엔드 API 시스템 저장소입니다.

---

## 1. GitHub Repository 및 팀원 초대

- Repository 생성 담당자: `[이름/담당자]`
- 팀원 초대 및 권한 설정:
  1. GitHub Repository의 `Settings` > `Collaborators`로 이동합니다.
  2. `Add people` 버튼을 통해 안드로이드 및 백엔드 개발자의 GitHub ID 또는 이메일을 추가합니다.
  3. 팀원은 이메일 또는 GitHub 알림에서 초대를 수락해야 저장소에 기여할 수 있습니다.

---

## 2. 기술 스택

본 프로젝트에서 사용하는 주요 기술 및 개발 환경입니다.

| 분류               | 기술 스택        | 상세 환경 / 라이브러리                                |
| :----------------- | :--------------- | :---------------------------------------------------- |
| Runtime            | Node.js          | v20.x 이상 (LTS)                                      |
| Language           | TypeScript       | strict mode 기반                                      |
| Framework          | Express          | v4.x                                                  |
| Database           | PostgreSQL       | 관계형 데이터 저장소                                  |
| ORM                | Prisma           | DB schema, migration, Prisma Client 관리              |
| Realtime           | Socket.io        | 실시간 스터디룸, 타이머 상태 공유 및 소켓 이벤트 처리 |
| Linter / Formatter | ESLint, Prettier | 코드 스타일 및 컨벤션 강제                            |
| Package Manager    | npm              | `package-lock.json` 기준 의존성 관리                  |

---

## 3. 안드로이드 협업을 위한 API 규칙

안드로이드 클라이언트와의 원활한 통신, 실시간 타이머 및 집중 데이터 동기화를 위해 아래 규칙을 준수합니다.

- 모든 API는 Swagger 또는 Postman 등을 통해 최신 상태로 문서화하고 공유합니다.
- 성공, 에러, 예외 처리를 일관된 JSON 응답 형식으로 반환합니다.

### 성공 응답 예시

```json
{
  "success": true,
  "data": {
    "studyLogId": 123,
    "startedAt": "2026-06-26T15:00:00Z"
  }
}
```

### 실패 응답 예시

```json
{
  "success": false,
  "error": {
    "code": "TIMER_ALREADY_RUNNING",
    "message": "현재 측정 중인 타이머가 존재합니다."
  }
}
```

---

## 4. Git 브랜치 전략

본 프로젝트는 Git Flow 전략을 기반으로 브랜치를 운영합니다.

| 브랜치             | 설명                                                                                                       |
| :----------------- | :--------------------------------------------------------------------------------------------------------- |
| `main`             | 제품으로 출시 가능한 가장 안정적인 브랜치입니다. 안드로이드 마켓 심사 및 배포 기준으로 사용합니다.         |
| `develop`          | 다음 출시 버전을 개발하는 브랜치입니다. 안드로이드 개발팀과 연동하는 테스트 서버 배포 기준으로 사용합니다. |
| `feature/[기능명]` | 단위 기능을 개발하는 브랜치입니다. 예: `feature/timer`, `feature/group`                                    |
| `release-[버전]`   | 배포를 준비하는 브랜치입니다.                                                                              |
| `hotfix-[버전]`    | 출시 버전에서 발생한 긴급 버그를 수정하는 브랜치입니다.                                                    |

### 브랜치 네이밍 규칙

- `feature/` 뒤에는 kebab-case를 사용합니다. 예: `feature/user-profile`
- 이슈 트래커를 사용하는 경우 이슈 번호를 포함할 수 있습니다. 예: `feature/#12-timer-start`

---

## 5. 프로젝트 구조

본 프로젝트는 확장성과 집중/타이머 도메인 로직의 응집도를 높이기 위해 DDD(Domain Driven Design) 기반 아키텍처를 채택합니다. 폰쉼의 핵심 기능별로 도메인 컨텍스트를 분리합니다.

폴더 이름은 소문자 영어 단어 하나로 작성하는 것을 권장합니다.

```plaintext
.
├── prisma/
│   └── schema.prisma              # PostgreSQL datasource 및 Prisma schema
├── src/
│   ├── app.ts                     # Express 애플리케이션 설정
│   ├── server.ts                  # HTTP 서버 실행 및 Socket.io 초기화
│   ├── shared/                    # 여러 도메인에서 공통으로 사용하는 모듈
│   │   ├── config/
│   │   │   └── env.ts             # 환경 변수 설정
│   │   ├── database/
│   │   │   └── prismaClient.ts    # Prisma Client 싱글턴
│   │   ├── middlewares/
│   │   │   ├── errorHandler.ts
│   │   │   └── notFoundHandler.ts
│   │   ├── socket/
│   │   │   └── socketServer.ts    # Socket.io 서버 생성 및 공통 이벤트 등록
│   │   └── utils/
│   │       └── asyncHandler.ts
│   └── domains/                   # 폰쉼 서비스의 핵심 도메인
│       ├── timer/                 # 타이머 및 공부 기록 도메인
│       │   ├── interfaces/        # HTTP/Socket 요청 처리 및 응답 반환
│       │   ├── application/       # 유스케이스 구현
│       │   ├── domain/            # 핵심 비즈니스 규칙
│       │   └── infrastructure/    # Prisma 등 외부 기술 구현
│       └── group/                 # 실시간 스터디 그룹/소켓 도메인
│           ├── interfaces/
│           ├── application/
│           ├── domain/
│           └── infrastructure/
├── .env.example
├── package.json
└── tsconfig.json
```

### 계층별 역할

- **Interfaces**: 안드로이드 앱의 HTTP 요청 및 소켓 이벤트를 받고 응답을 반환합니다.
- **Application**: 사용자의 유스케이스를 수행합니다. 예: 공부 시작 요청 처리, 타이머 생성, 트랜잭션 관리
- **Domain**: 핵심 비즈니스 로직과 데이터 엔티티가 존재하는 영역입니다. 외부 기술에 의존하지 않는 순수한 코드로 작성합니다.
- **Infrastructure**: DB, Socket.io, FCM 등 구체적인 외부 기술 의존 사항을 구현합니다.

---

## 6. 코드 컨벤션

일관된 코드 스타일과 가독성을 위해 아래 규칙을 준수합니다.

### 네이밍 규칙

| 대상           | 규칙             | 예시                         |
| :------------- | :--------------- | :--------------------------- |
| public 변수명  | camelCase        | `totalStudyTime`             |
| private 변수명 | `_camelCase`     | `_isResting`                 |
| 함수명         | camelCase        | `startTimer`                 |
| 컴포넌트명     | PascalCase       | `TimerDisplay`               |
| 클래스명       | PascalCase       | `TimerRepository`            |
| 인터페이스명   | PascalCase       | `StudyService`               |
| 파일명         | camelCase        | `timerController.ts`         |
| 폴더명         | 소문자 영어 단어 | `domains`, `timer`, `shared` |
| CSS 클래스명   | kebab-case       | `dark-mode`, `timer-text`    |

### 경로 alias

소스 코드는 루트 `src/` 폴더를 `@/`로 접근합니다.

```typescript
// Good
import { TimerService } from '@/domains/timer/application/timerService';
```

---

## 7. PR 및 코드 리뷰 규칙

### Pull Request 규칙

- PR을 올리기 전 로컬에서 `npm run lint`와 테스트를 통과해야 합니다.
- 하나의 PR에는 하나의 기능 또는 하나의 이슈만 담습니다.
- PR 생성 시 최소 1명 이상의 팀원을 리뷰어로 지정합니다.

### 코드 리뷰 규칙

- 모든 팀원은 코드를 작성할 권리와 리뷰할 의무가 있습니다.
- 리뷰 코멘트에는 중요도를 나타내는 Pn 규칙을 적용합니다.
  - `P1`: 반드시 반영해야 합니다. 릴리스 블로커에 해당합니다.
  - `P2`: 적극적으로 고려해야 합니다.
  - `P3`: 의견 제시 또는 사소한 개선 제안입니다.
- 피드백은 코드 중심으로 작성하며, 인신공격성 표현은 금지합니다.

---

## 8. 이슈 및 PR 템플릿

GitHub 작업을 효율적으로 진행하기 위해 `.github/` 폴더 안에 템플릿을 설정합니다.

### Issue Template

- 신규 기능 개발: `.github/ISSUE_TEMPLATE/feature_request.md`
- 버그 발견 및 수정: `.github/ISSUE_TEMPLATE/bug_report.md`

### PR Template

- `.github/pull_request_template.md`를 사용합니다.
- PR 제출 시 변경 사항, 체크리스트, 관련 이슈를 작성합니다.

---

## 9. 커밋 컨벤션

### Commit Type

| 타입    | 설명                                           |
| :------ | :--------------------------------------------- |
| `feat`  | 새로운 기능 추가 또는 기존 기능 수정           |
| `fix`   | 버그 수정 및 오류 해결                         |
| `typo`  | 단순 오탈자 수정                               |
| `chore` | 빌드 업무, 패키지 설정 변경, 코드 외 기타 작업 |
| `deps`  | 의존성 라이브러리 추가 및 수정                 |
| `res`   | 이미지, 폰트 등 리소스 자원 추가 및 수정       |

### Commit Message Format

```plaintext
[Type]: [Title]

[Body - Optional]
```

Examples:

```plaintext
feat: implement timer start API

fix: correct accumulated study time after app force quit
```
