# 기술 아키텍처 다이어그램

> **yt-todolist** - 시스템 아키텍처 개요

---

## 문서 정보

| 항목 | 내용 |
|------|------|
| **문서 버전** | 1.0 |
| **작성일** | 2025-11-26 |
| **작성자** | 개발팀 |
| **상태** | 최종 |

---

## 1. 아키텍처 개요

이 문서는 yt-todolist 애플리케이션 아키텍처에 대한 포괄적인 뷰를 제공합니다. 시스템은 프레젠테이션 레이어(React 프론트엔드), 애플리케이션 레이어(Node.js/Express 백엔드), 데이터 레이어(PostgreSQL 데이터베이스) 간의 명확한 관심사 분리를 갖춘 전통적인 3계층 아키텍처 패턴을 따릅니다.

### 주요 아키텍처 원칙

- **계층화된 아키텍처**: 클라이언트, API, 비즈니스 로직, 데이터 레이어 간의 명확한 분리
- **무상태 API**: 수평 확장을 가능하게 하는 JWT 기반 인증
- **RESTful 설계**: 표준 HTTP 메서드 및 리소스 기반 엔드포인트
- **보안 우선**: HTTPS, JWT 토큰, bcrypt 비밀번호 해싱, 입력 유효성 검사
- **데이터 격리**: 데이터베이스 및 API 레벨에서 사용자별 데이터 접근 제어 강제

---

## 2. 시스템 아키텍처 다이어그램

```mermaid
graph TB
    subgraph "클라이언트 레이어"
        A[React 애플리케이션]
        A1[컴포넌트]
        A2[Context API + Hooks]
        A3[React Router]
        A4[Axios HTTP 클라이언트]

        A --> A1
        A --> A2
        A --> A3
        A --> A4
    end

    subgraph "API 게이트웨이 레이어"
        B[Express.js 서버]
        B1[CORS 미들웨어]
        B2[Rate Limiting]
        B3[요청 검증]

        B --> B1
        B --> B2
        B --> B3
    end

    subgraph "비즈니스 로직 레이어"
        C[컨트롤러]
        C1[인증 컨트롤러]
        C2[Todo 컨트롤러]
        C3[휴지통 컨트롤러]
        C4[공휴일 컨트롤러]

        D[미들웨어]
        D1[JWT 검증]
        D2[에러 핸들러]
        D3[로거]

        E[서비스]
        E1[인증 서비스]
        E2[Todo 서비스]
        E3[토큰 서비스]

        C --> C1
        C --> C2
        C --> C3
        C --> C4

        D --> D1
        D --> D2
        D --> D3

        E --> E1
        E --> E2
        E --> E3
    end

    subgraph "데이터 레이어"
        F[(PostgreSQL 데이터베이스)]
        F1[(users)]
        F2[(todos)]
        F3[(public_holidays)]
        F4[(refresh_tokens)]

        F --> F1
        F --> F2
        F --> F3
        F --> F4
    end

    A4 -->|HTTPS| B
    B --> D
    D --> C
    C --> E
    E -->|SQL 쿼리| F

    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#ffe1f5
    style D fill:#ffe1f5
    style E fill:#ffe1f5
    style F fill:#e1ffe1
```

---

## 3. 상세 컴포넌트 아키텍처

```mermaid
graph LR
    subgraph "프론트엔드 - React + TypeScript"
        UI[UI 컴포넌트]
        State[상태 관리]
        Router[React Router v6]
        HTTP[Axios]

        UI --> State
        UI --> Router
        State --> HTTP
    end

    subgraph "백엔드 - Node.js + Express + TypeScript"
        Routes[API 라우트]
        Auth[인증 미들웨어]
        Controllers[컨트롤러]
        Services[비즈니스 로직]
        Validators[입력 검증기]

        Routes --> Auth
        Auth --> Controllers
        Controllers --> Validators
        Controllers --> Services
    end

    subgraph "데이터베이스 - PostgreSQL 16"
        Users[(users 테이블)]
        Todos[(todos 테이블)]
        Holidays[(public_holidays)]
        Tokens[(refresh_tokens)]

        Users -.참조.- Todos
        Users -.참조.- Tokens
    end

    HTTP -->|REST API| Routes
    Services -->|SQL| Users
    Services -->|SQL| Todos
    Services -->|SQL| Holidays
    Services -->|SQL| Tokens

    style UI fill:#61dafb
    style State fill:#61dafb
    style Router fill:#61dafb
    style HTTP fill:#61dafb
    style Routes fill:#68a063
    style Auth fill:#68a063
    style Controllers fill:#68a063
    style Services fill:#68a063
    style Validators fill:#68a063
    style Users fill:#336791
    style Todos fill:#336791
    style Holidays fill:#336791
    style Tokens fill:#336791
```

---

## 4. 인증 플로우 다이어그램

```mermaid
sequenceDiagram
    participant C as 클라이언트 (React)
    participant API as Express API
    participant DB as PostgreSQL

    Note over C,DB: 회원가입 플로우
    C->>+API: POST /api/auth/register<br/>{email, password, username}
    API->>API: 입력 검증
    API->>API: 비밀번호 해싱 (bcrypt)
    API->>+DB: INSERT INTO users
    DB-->>-API: 사용자 생성 완료
    API-->>-C: 201 Created<br/>{user}

    Note over C,DB: 로그인 플로우
    C->>+API: POST /api/auth/login<br/>{email, password}
    API->>+DB: SELECT user by email
    DB-->>-API: 사용자 데이터
    API->>API: 비밀번호 검증 (bcrypt)
    API->>API: JWT 토큰 생성<br/>(Access + Refresh)
    API->>+DB: INSERT refresh_token
    DB-->>-API: 토큰 저장 완료
    API-->>-C: 200 OK<br/>{accessToken, refreshToken, user}

    Note over C,DB: 인증된 요청
    C->>+API: GET /api/todos<br/>Header: Bearer {accessToken}
    API->>API: JWT 토큰 검증
    API->>API: 토큰에서 user_id 추출
    API->>+DB: SELECT todos WHERE user_id
    DB-->>-API: 사용자의 Todos
    API-->>-C: 200 OK<br/>{todos}

    Note over C,DB: 토큰 갱신 플로우
    C->>+API: POST /api/auth/refresh<br/>{refreshToken}
    API->>+DB: SELECT refresh_token
    DB-->>-API: 토큰 유효
    API->>API: Refresh 토큰 검증
    API->>API: 새 Access 토큰 생성
    API-->>-C: 200 OK<br/>{accessToken}
```

---

## 5. API 엔드포인트 구조

```mermaid
graph TD
    API["/api"]

    Auth["/auth"]
    Auth1["/register - POST"]
    Auth2["/login - POST"]
    Auth3["/refresh - POST"]
    Auth4["/logout - POST"]

    Todos["/todos"]
    Todos1["/GET - 모든 todo 목록"]
    Todos2["/:id - GET - todo 조회"]
    Todos3["/POST - todo 생성"]
    Todos4["/:id - PUT - todo 수정"]
    Todos5["/:id - DELETE - 휴지통으로 이동"]

    Trash["/trash"]
    Trash1["/GET - 휴지통 항목 목록"]
    Trash2["/:id/restore - POST"]
    Trash3["/:id - DELETE - 영구 삭제"]

    Holidays["/holidays"]
    Holidays1["/GET - 공휴일 목록"]

    Calendar["/calendar"]
    Calendar1["/GET - 통합 뷰"]

    API --> Auth
    API --> Todos
    API --> Trash
    API --> Holidays
    API --> Calendar

    Auth --> Auth1
    Auth --> Auth2
    Auth --> Auth3
    Auth --> Auth4

    Todos --> Todos1
    Todos --> Todos2
    Todos --> Todos3
    Todos --> Todos4
    Todos --> Todos5

    Trash --> Trash1
    Trash --> Trash2
    Trash --> Trash3

    Holidays --> Holidays1
    Calendar --> Calendar1

    style API fill:#ff6b6b
    style Auth fill:#4ecdc4
    style Todos fill:#95e1d3
    style Trash fill:#f7dc6f
    style Holidays fill:#bb8fce
    style Calendar fill:#85c1e9
```

---

## 6. 데이터베이스 스키마 관계

```mermaid
erDiagram
    users ||--o{ todos : "소유"
    users ||--o{ refresh_tokens : "보유"

    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar username
        timestamp created_at
        timestamp last_login_at
    }

    todos {
        uuid id PK
        uuid user_id FK
        varchar title
        text content
        timestamp start_date
        timestamp end_date
        varchar status
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    public_holidays {
        uuid id PK
        varchar title
        date holiday_date
        varchar type
        boolean is_recurring
        timestamp created_at
    }

    refresh_tokens {
        uuid id PK
        uuid user_id FK
        varchar token UK
        timestamp expires_at
        timestamp created_at
    }
```

---

## 7. 요청/응답 플로우

```mermaid
flowchart TD
    Start([사용자 액션]) --> Client[React 컴포넌트]
    Client --> Validation{클라이언트 측<br/>검증}

    Validation -->|유효하지 않음| ErrorUI[에러 메시지 표시]
    Validation -->|유효함| HTTP[Axios HTTP 요청]

    HTTP --> CORS{CORS 체크}
    CORS -->|실패| CORSError[403 Forbidden]
    CORS -->|통과| RateLimit{Rate Limit<br/>체크}

    RateLimit -->|초과| RateLimitError[429 Too Many Requests]
    RateLimit -->|통과| AuthCheck{인증<br/>필요?}

    AuthCheck -->|예| JWTVerify{JWT 토큰<br/>검증}
    AuthCheck -->|아니오| InputValidation

    JWTVerify -->|유효하지 않음| AuthError[401 Unauthorized]
    JWTVerify -->|유효함| ExtractUser[토큰에서<br/>user_id 추출]

    ExtractUser --> InputValidation{서버 측<br/>검증}

    InputValidation -->|유효하지 않음| ValidationError[400 Bad Request]
    InputValidation -->|유효함| Controller[컨트롤러 실행]

    Controller --> Service[비즈니스 로직 서비스]
    Service --> DBQuery[데이터베이스 쿼리]

    DBQuery --> DBCheck{쿼리<br/>성공?}
    DBCheck -->|실패| DBError[500 Internal Server Error]
    DBCheck -->|성공| Response[응답 포맷팅]

    Response --> Success[200/201 Success Response]
    Success --> ClientUpdate[React 상태 업데이트]
    ClientUpdate --> UIUpdate[UI 재렌더링]

    ErrorUI --> End([종료])
    CORSError --> End
    RateLimitError --> End
    AuthError --> End
    ValidationError --> End
    DBError --> End
    UIUpdate --> End

    style Start fill:#90EE90
    style Client fill:#87CEEB
    style Controller fill:#FFD700
    style Service fill:#FFA500
    style DBQuery fill:#9370DB
    style Success fill:#90EE90
    style End fill:#FF6B6B
```

---

## 8. 보안 아키텍처

```mermaid
graph TB
    subgraph "보안 레이어"
        L1[전송 보안]
        L1A[HTTPS/TLS]
        L1B[HSTS 헤더]

        L2[인증 보안]
        L2A[JWT Access 토큰 - 15분]
        L2B[JWT Refresh 토큰 - 7일]
        L2C[bcrypt 비밀번호 해시]

        L3[인가 보안]
        L3A[사용자 ID 검증]
        L3B[리소스 소유권 체크]

        L4[입력 보안]
        L4A[클라이언트 검증]
        L4B[서버 검증]
        L4C[SQL 인젝션 방지]
        L4D[XSS 방지]

        L5[API 보안]
        L5A[CORS 구성]
        L5B[Rate Limiting]
        L5C[CSRF 보호]

        L1 --> L1A
        L1 --> L1B
        L2 --> L2A
        L2 --> L2B
        L2 --> L2C
        L3 --> L3A
        L3 --> L3B
        L4 --> L4A
        L4 --> L4B
        L4 --> L4C
        L4 --> L4D
        L5 --> L5A
        L5 --> L5B
        L5 --> L5C
    end

    style L1 fill:#ff6b6b
    style L2 fill:#4ecdc4
    style L3 fill:#95e1d3
    style L4 fill:#f7dc6f
    style L5 fill:#bb8fce
```

---

## 9. 기술 스택 요약

### 프론트엔드 스택
- **프레임워크**: React 18
- **언어**: TypeScript 5.x
- **상태 관리**: React Context API + Hooks
- **라우팅**: React Router v6
- **HTTP 클라이언트**: Axios
- **UI 라이브러리**: Material-UI v5 또는 Tailwind CSS
- **폼 처리**: React Hook Form
- **날짜 처리**: date-fns
- **빌드 도구**: Vite

### 백엔드 스택
- **런타임**: Node.js 20 LTS
- **프레임워크**: Express.js 4.x
- **언어**: TypeScript 5.x
- **인증**: jsonwebtoken, bcrypt
- **검증**: express-validator 또는 Zod
- **데이터베이스 클라이언트**: node-postgres (pg)
- **로깅**: Winston 또는 Pino
- **환경변수**: dotenv

### 데이터베이스 스택
- **데이터베이스**: PostgreSQL 16
- **커넥션 풀링**: pg-pool
- **ORM**: Prisma (선택사항) 또는 raw SQL

### DevOps 스택
- **컨테이너화**: Docker
- **CI/CD**: GitHub Actions
- **버전 관리**: Git
- **패키지 매니저**: npm 또는 yarn

---

## 10. 배포 아키텍처

```mermaid
graph TB
    subgraph "프로덕션 환경"
        LB[로드 밸런서<br/>HTTPS]

        subgraph "프론트엔드"
            FE1[React 앱<br/>정적 파일]
            FE2[CDN<br/>콘텐츠 전송]
        end

        subgraph "백엔드 클러스터"
            BE1[Express API<br/>인스턴스 1]
            BE2[Express API<br/>인스턴스 2]
        end

        subgraph "데이터베이스"
            DB1[(PostgreSQL<br/>Primary)]
            DB2[(PostgreSQL<br/>Replica)]
        end

        subgraph "모니터링"
            MON1[로깅 서비스]
            MON2[헬스 체크]
            MON3[메트릭 수집]
        end
    end

    Client([클라이언트 브라우저]) --> LB
    LB --> FE2
    FE2 --> FE1
    FE1 --> LB
    LB --> BE1
    LB --> BE2
    BE1 --> DB1
    BE2 --> DB1
    DB1 -.복제.-> DB2

    BE1 --> MON1
    BE2 --> MON1
    BE1 --> MON2
    BE2 --> MON2
    DB1 --> MON3

    style Client fill:#90EE90
    style LB fill:#FFD700
    style FE1 fill:#87CEEB
    style FE2 fill:#87CEEB
    style BE1 fill:#FFA500
    style BE2 fill:#FFA500
    style DB1 fill:#9370DB
    style DB2 fill:#9370DB
    style MON1 fill:#FF6B6B
    style MON2 fill:#FF6B6B
    style MON3 fill:#FF6B6B
```

---

## 11. 데이터 플로우 예시

### 예시 1: Todo 생성 플로우

```
사용자 → React 폼 → 검증 → Axios POST /api/todos
    → Express 라우터 → JWT 미들웨어 (토큰 검증)
    → 검증 미들웨어 (입력 체크)
    → Todo 컨트롤러 → Todo 서비스
    → PostgreSQL INSERT → 새 todo 반환
    → 서비스 → 컨트롤러 → API 응답
    → Axios → React 상태 업데이트 → UI 재렌더링
```

### 예시 2: 삭제 및 복원 플로우

```
사용자가 삭제 클릭 → Axios DELETE /api/todos/:id
    → JWT 검증 → 소유권 체크
    → UPDATE todos SET status='trash', deleted_at=NOW()
    → 성공 반환 → UI 업데이트 (목록에서 제거)

사용자가 복원 클릭 → Axios POST /api/trash/:id/restore
    → JWT 검증 → 소유권 체크
    → UPDATE todos SET status='active', deleted_at=NULL
    → 성공 반환 → UI 업데이트 (목록에 다시 추가)
```

---

## 12. 참고사항 및 규칙

### API 규칙
- 모든 API 엔드포인트는 `/api` 접두사 사용
- RESTful 리소스 명명 (복수형 명사)
- JWT 토큰은 `Authorization: Bearer {token}` 헤더에 포함
- 일관된 응답 형식: `{success: boolean, data: object, error: object}`
- HTTP 상태 코드: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)

### 보안 규칙
- Access 토큰은 15분 후 만료
- Refresh 토큰은 7일 후 만료
- 비밀번호는 bcrypt로 해시화 (10 salt rounds)
- 모든 프로덕션 트래픽에 HTTPS 필수
- Rate limiting: 사용자당 분당 100 요청

### 데이터베이스 규칙
- 모든 테이블에 UUID 기본 키 사용
- 타임스탬프: created_at, updated_at, deleted_at
- 소프트 삭제 패턴 (status='trash', deleted_at 타임스탬프)
- CASCADE 삭제가 포함된 외래 키 제약조건
- 자주 조회되는 컬럼에 인덱스 설정

### 코드 규칙
- TypeScript strict 모드 활성화
- 코드 품질을 위한 ESLint + Prettier
- 함수형 컴포넌트와 Hooks 사용 (React)
- 비동기 작업에 Async/await 사용
- Error-first callbacks 패턴

---

## 관련 문서

- [도메인 정의서](./1-domain-definition.md)
- [PRD 입력 템플릿](./2-prd-input-template.md)
- [제품 요구사항 명세서](./3-prd.md)
- [사용자 시나리오](./4-user-scenarios.md)

---

**문서 버전:** 1.0
**작성일:** 2025-11-26
**작성자:** 개발팀
**상태:** 최종
