# yt-todolist 프로젝트 구조 및 설계 원칙

## 1. 최상위 원칙

- **단일 책임 원칙 (SRP)**: 각 모듈, 클래스, 함수는 하나의 기능만 책임진다.
- **관심사 분리 (SoC)**: 프론트엔드, 백엔드, 데이터베이스 등 각 계층의 역할을 명확히 분리한다.
- **문서 기반 개발**: `docs` 디렉토리의 `PRD`와 `도메인 정의서`를 모든 설계 및 구현의 기준으로 삼는다.
- **MVP 우선 개발**: `P0` 기능 개발에 집중하고, 안정화 후 `P1`, `P2` 순서로 확장한다.

## 2. 의존성 및 레이어 원칙

- **단방향 의존성**: 의존성은 항상 외부에서 내부로, 상위 레이어에서 하위 레이어로 향한다. (e.g., `Controller` -> `Service` -> `Repository`)
- **계층형 아키텍처**:
    - **Presentation Layer (Frontend)**: React 기반 UI, 사용자 상호작용 처리.
    - **Application Layer (Backend API)**: Express.js 기반, API 엔드포인트, 요청/응답 처리.
    - **Domain Layer (Backend Logic)**: 비즈니스 로직, 서비스, 도메인 모델.
    - **Infrastructure Layer (Backend Infra)**: 데이터베이스, 외부 API 연동, 로깅.

## 3. 코드 및 네이밍 원칙

### 3.1 공통 (TypeScript)

- **언어**: TypeScript 5.x를 표준으로 사용하며, `strict` 모드를 활성화한다.
- **스타일**: Prettier와 ESLint 설정을 준수하며, 일관된 코드 스타일을 유지한다.
- **네이밍**:
    - `camelCase` for variables, functions.
    - `PascalCase` for classes, types, interfaces, components.
    - `UPPER_SNAKE_CASE` for constants.
    - **명확성**: 축약어 사용을 지양하고, 의미가 명확히 드러나는 이름을 사용한다.

### 3.2 프론트엔드

- **컴포넌트**:
    - 기능 단위로 컴포넌트를 분리한다. (e.g., `TodoItem`, `TodoList`)
    - `components/common`에는 여러 곳에서 재사용되는 범용 컴포넌트 (e.g., `Button`, `Modal`)를 둔다.
- **상태 관리**:
    - 지역 상태는 `useState`, 전역 상태는 `React Context API`를 사용한다.
    - 복잡한 상태 로직은 `useReducer`를 활용한다.
- **API 통신**: `axios`를 사용하며, API 클라이언트 인스턴스를 생성하여 관리한다.

### 3.3 백엔드

- **계층 분리**: `routes` -> `controllers` -> `services` -> `repositories` 구조를 따른다.
- **오류 처리**: 중앙 집중식 에러 핸들러를 사용하여 모든 에러를 일관되게 처리한다.
- **데이터베이스 접근**: Raw SQL 또는 경량 쿼리 빌더를 사용하여 `repositories` 계층에서만 데이터베이스와 통신한다.

## 4. 테스트 및 품질 원칙

- **테스트 피라미드**: `단위 테스트` > `통합 테스트` > `E2E 테스트` 순으로 테스트 커버리지를 확보한다.
- **커버리지 목표**:
    - **단위 테스트**: 80% 이상.
    - **통합 테스트**: 주요 API 엔드포인트 및 비즈니스 로직 90% 이상.
- **테스트 주도 개발 (TDD)**: 새로운 기능 추가 및 버그 수정 시 테스트 코드를 먼저 작성하는 것을 권장한다.
- **CI 연동**: 모든 `push` 및 `pull request`에 대해 자동으로 테스트를 실행하여 코드 품질을 유지한다.

## 5. 설정, 보안, 운영 원칙

- **환경 변수**: 모든 설정값(DB 접속 정보, JWT 시크릿 등)은 `.env` 파일을 통해 관리하며, Git에 커밋하지 않는다.
- **보안**:
    - `bcrypt`를 사용한 비밀번호 암호화.
    - `JWT` 기반 인증 및 인가.
    - 모든 API 통신은 `HTTPS`를 강제한다.
    - `SQL Injection`, `XSS`, `CSRF` 등 웹 취약점에 대한 방어 로직을 구현한다.
- **로깅**: `winston` 또는 `pino`를 사용하여 JSON 형식의 구조화된 로그를 기록한다.

## 6. 디렉토리 구조

### 6.1 프론트엔드 (`frontend/`)

```
frontend/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── api/
│   │   ├── index.ts        # Axios 인스턴스 설정
│   │   ├── authApi.ts
│   │   └── todoApi.ts
│   ├── assets/
│   │   ├── images/
│   │   └── styles/
│   │       ├── main.css
│   │       └── theme.ts
│   ├── components/
│   │   ├── common/         # 재사용 가능한 범용 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Input.tsx
│   │   └── todo/
│   │       ├── TodoItem.tsx
│   │       ├── TodoList.tsx
│   │       └── TodoForm.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── TodoContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useTodos.ts
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── TrashPage.tsx
│   ├── routes/
│   │   ├── AppRouter.tsx
│   │   └── PrivateRoute.tsx
│   ├── types/
│   │   ├── user.ts
│   │   └── todo.ts
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   └── validation.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 6.2 백엔드 (`backend/`)

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── todoController.ts
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.ts
│   │   │   └── errorMiddleware.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── authRoutes.ts
│   │   │   └── todoRoutes.ts
│   │   └── validators/
│   │       ├── authValidator.ts
│   │       └── todoValidator.ts
│   ├── config/
│   │   ├── db.ts           # 데이터베이스 연결
│   │   └── env.ts          # 환경 변수
│   ├──- domain/
│   │   ├──- entities
│   │   │   ├── todo.ts
│   │   │   └── user.ts
│   │   ├──- repositories
│   │   │   ├── todoRepository.ts
│   │   │   └── userRepository.ts
│   │   └──- services
│   │       ├── todoService.ts
│   │       └── authService.ts
│   ├── lib/
│   │   ├── jwt.ts
│   │   └── logger.ts
│   ├── types/
│   │   └── express/index.d.ts # Express Request 확장
│   ├── app.ts
│   └── server.ts
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc
├── package.json
└── tsconfig.json
```
