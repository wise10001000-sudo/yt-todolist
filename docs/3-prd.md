# PRD (Product Requirements Document)

> **yt-todolist** - 사용자 인증 기반 할일 관리 애플리케이션

---

## 문서 정보

| 항목          | 내용       |
| ------------- | ---------- |
| **문서 버전** | 1.0        |
| **작성일**    | 2025-11-25 |
| **작성자**    | 개발팀     |
| **상태**      | Final      |

---

## 1. 제품 개요

### 1.1 제품 비전

개인별 할일을 효율적으로 관리하고, 국경일 등 공통 일정과 함께 통합 관리할 수 있는 직관적이고 신뢰할 수 있는 웹 기반 할일 관리 플랫폼을 제공한다. 사용자는 자신만의 할일 공간에서 일정 기반 작업을 추적하고, 실수로 삭제한 항목을 복구할 수 있는 안전한 환경을 경험한다.

### 1.2 타겟 사용자

- **사용자 유형**: 개인 사용자 (학생, 직장인, 프리랜서 등)
- **주요 니즈**:
  - 개인 할일의 체계적 관리
  - 시작일/종료일 기반 일정 추적
  - 삭제된 항목의 안전한 복구
  - 공휴일 정보와 할일의 통합 조회

### 1.3 핵심 가치

- 사용자별 독립적인 할일 관리 (완전한 데이터 격리)
- 일정 기반 할일 추적 (시작일/종료일)
- 삭제된 항목의 복구 기능 (휴지통 시스템)
- 공통 일정(국경일)과 개인 일정의 통합 관리

---

## 2. 기능 요구사항

### 2.1 MVP 범위

#### P0 (필수 - 1차 배포)

- **UC-001**: 회원가입
- **UC-002**: 로그인
- **UC-003**: 할일 목록 조회
- **UC-004**: 할일 추가
- **UC-005**: 할일 수정
- **UC-006**: 할일 삭제 (휴지통 이동)
- **UC-007**: 휴지통 조회
- **UC-008**: 할일 복원
- **UC-009**: 할일 영구 삭제

#### P1 (중요 - 2차 배포)

- 공휴일 조회 및 통합 표시
- JWT 토큰 갱신 (Refresh Token)
- 반응형 디자인 (모바일 최적화)
- 로그아웃 기능
- 토큰 만료 시 자동 갱신

#### P2 (선택 - 추후 개발)

- 사용자 프로필 수정
- 비밀번호 변경
- 이메일 인증
- 다크 모드

---

## 3. API 명세

### 3.1 공통 규격

#### 기본 URL

```
Development: http://localhost:3000/api
Production: https://api.yt-todolist.com/api
```

#### 응답 형식

모든 API는 다음 형식을 따릅니다:

성공 응답:

```json
{
  "success": true,
  "data": {
    // 응답 데이터
  }
}
```

오류 응답:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

#### 인증 헤더

인증이 필요한 API는 다음 헤더를 포함해야 합니다:

```
Authorization: Bearer {accessToken}
```

### 3.2 인증 API

#### POST /api/auth/register

회원가입

**요청:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "username": "홍길동"
}
```

**응답 (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "홍길동",
      "createdAt": "2025-11-25T10:00:00.000Z"
    }
  }
}
```

**에러 응답:**

- 400: 유효하지 않은 입력 데이터
- 409: 이미 존재하는 이메일

#### POST /api/auth/login

로그인

**요청:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "홍길동"
    }
  }
}
```

**에러 응답:**

- 400: 유효하지 않은 입력 데이터
- 401: 인증 실패 (이메일 또는 비밀번호 오류)

#### POST /api/auth/refresh

액세스 토큰 갱신

**요청:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**에러 응답:**

- 401: 유효하지 않거나 만료된 리프레시 토큰

#### POST /api/auth/logout

로그아웃

**헤더:**

```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "로그아웃되었습니다."
  }
}
```

### 3.3 할일 API

#### GET /api/todos

할일 목록 조회 (활성 상태만)

**헤더:**

```
Authorization: Bearer {accessToken}
```

**쿼리 파라미터:**

- `startDate` (optional): 조회 시작일 (ISO 8601 형식)
- `endDate` (optional): 조회 종료일 (ISO 8601 형식)
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 50)

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "프로젝트 기획서 작성",
        "content": "내부 검토를 위한 초안 작성",
        "startDate": "2025-11-25T00:00:00.000Z",
        "endDate": "2025-11-30T23:59:59.999Z",
        "status": "active",
        "createdAt": "2025-11-25T10:00:00.000Z",
        "updatedAt": "2025-11-25T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

#### POST /api/todos

할일 생성

**헤더:**

```
Authorization: Bearer {accessToken}
```

**요청:**

```json
{
  "title": "프로젝트 기획서 작성",
  "content": "내부 검토를 위한 초안 작성",
  "startDate": "2025-11-25T00:00:00.000Z",
  "endDate": "2025-11-30T23:59:59.999Z"
}
```

**응답 (201 Created):**

```json
{
  "success": true,
  "data": {
    "todo": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "프로젝트 기획서 작성",
      "content": "내부 검토를 위한 초안 작성",
      "startDate": "2025-11-25T00:00:00.000Z",
      "endDate": "2025-11-30T23:59:59.999Z",
      "status": "active",
      "createdAt": "2025-11-25T10:00:00.000Z",
      "updatedAt": "2025-11-25T10:00:00.000Z"
    }
  }
}
```

**에러 응답:**

- 400: 유효하지 않은 입력 데이터 (BR-004, BR-005 위반)
- 401: 인증 실패

#### GET /api/todos/:id

할일 상세 조회

**헤더:**

```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "todo": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "프로젝트 기획서 작성",
      "content": "내부 검토를 위한 초안 작성",
      "startDate": "2025-11-25T00:00:00.000Z",
      "endDate": "2025-11-30T23:59:59.999Z",
      "status": "active",
      "createdAt": "2025-11-25T10:00:00.000Z",
      "updatedAt": "2025-11-25T10:00:00.000Z"
    }
  }
}
```

**에러 응답:**

- 401: 인증 실패
- 403: 권한 없음 (다른 사용자의 할일)
- 404: 할일을 찾을 수 없음

#### PUT /api/todos/:id

할일 수정

**헤더:**

```
Authorization: Bearer {accessToken}
```

**요청:**

```json
{
  "title": "프로젝트 기획서 작성 (수정)",
  "content": "내부 검토 및 외부 검토를 위한 초안 작성",
  "startDate": "2025-11-25T00:00:00.000Z",
  "endDate": "2025-12-01T23:59:59.999Z"
}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "todo": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "프로젝트 기획서 작성 (수정)",
      "content": "내부 검토 및 외부 검토를 위한 초안 작성",
      "startDate": "2025-11-25T00:00:00.000Z",
      "endDate": "2025-12-01T23:59:59.999Z",
      "status": "active",
      "createdAt": "2025-11-25T10:00:00.000Z",
      "updatedAt": "2025-11-25T11:00:00.000Z"
    }
  }
}
```

**에러 응답:**

- 400: 유효하지 않은 입력 데이터 (BR-005 위반)
- 401: 인증 실패
- 403: 권한 없음 (BR-002, BR-007 위반)
- 404: 할일을 찾을 수 없음

#### DELETE /api/todos/:id

할일 삭제 (휴지통 이동)

**헤더:**

```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "할일이 휴지통으로 이동되었습니다.",
    "todo": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "trash",
      "deletedAt": "2025-11-25T12:00:00.000Z"
    }
  }
}
```

**에러 응답:**

- 401: 인증 실패
- 403: 권한 없음 (BR-002, BR-007 위반)
- 404: 할일을 찾을 수 없음

### 3.4 휴지통 API

#### GET /api/trash

휴지통 조회

**헤더:**

```
Authorization: Bearer {accessToken}
```

**쿼리 파라미터:**

- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 50)

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "프로젝트 기획서 작성",
        "content": "내부 검토를 위한 초안 작성",
        "startDate": "2025-11-25T00:00:00.000Z",
        "endDate": "2025-11-30T23:59:59.999Z",
        "status": "trash",
        "deletedAt": "2025-11-25T12:00:00.000Z",
        "createdAt": "2025-11-25T10:00:00.000Z",
        "updatedAt": "2025-11-25T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

#### POST /api/trash/:id/restore

할일 복원

**헤더:**

```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "할일이 복원되었습니다.",
    "todo": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "active",
      "deletedAt": null
    }
  }
}
```

**에러 응답:**

- 401: 인증 실패
- 403: 권한 없음 (BR-002 위반)
- 404: 할일을 찾을 수 없음

#### DELETE /api/trash/:id

할일 영구 삭제

**헤더:**

```
Authorization: Bearer {accessToken}
```

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "할일이 영구 삭제되었습니다."
  }
}
```

**에러 응답:**

- 401: 인증 실패
- 403: 권한 없음 (BR-002 위반)
- 404: 할일을 찾을 수 없음

### 3.5 공휴일 API

#### GET /api/holidays

공휴일 조회

**헤더:**

```
Authorization: Bearer {accessToken}
```

**쿼리 파라미터:**

- `year` (optional): 조회할 연도 (기본값: 현재 연도)
- `month` (optional): 조회할 월 (1-12)

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "holidays": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "설날",
        "holidayDate": "2025-01-29",
        "type": "national",
        "isRecurring": true
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "삼일절",
        "holidayDate": "2025-03-01",
        "type": "national",
        "isRecurring": true
      }
    ]
  }
}
```

#### GET /api/calendar

통합 캘린더 조회 (할일 + 공휴일)

**헤더:**

```
Authorization: Bearer {accessToken}
```

**쿼리 파라미터:**

- `startDate` (required): 조회 시작일 (ISO 8601 형식)
- `endDate` (required): 조회 종료일 (ISO 8601 형식)

**응답 (200 OK):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "type": "todo",
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "프로젝트 기획서 작성",
        "startDate": "2025-11-25T00:00:00.000Z",
        "endDate": "2025-11-30T23:59:59.999Z",
        "editable": true
      },
      {
        "type": "holiday",
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "title": "크리스마스",
        "date": "2025-12-25",
        "editable": false
      }
    ]
  }
}
```

---

## 4. 데이터 스키마

### 4.1 PostgreSQL 스키마

```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 이메일 인덱스
CREATE INDEX idx_users_email ON users(email);

-- 할일 테이블
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'trash')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  CONSTRAINT chk_date_order CHECK (start_date IS NULL OR start_date <= end_date)
);

-- 할일 인덱스
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_end_date ON todos(end_date);
CREATE INDEX idx_todos_deleted_at ON todos(deleted_at) WHERE status = 'trash';

-- 업데이트 타임스탬프 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 공휴일 테이블
CREATE TABLE public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  holiday_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('national', 'memorial')),
  is_recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 공휴일 인덱스
CREATE INDEX idx_holidays_date ON public_holidays(holiday_date);
CREATE INDEX idx_holidays_type ON public_holidays(type);

-- 리프레시 토큰 테이블
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT chk_expires_future CHECK (expires_at > created_at)
);

-- 리프레시 토큰 인덱스
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

### 4.2 데이터 타입 정의

#### User

| 필드           | 타입      | 제약조건        | 설명                 |
| -------------- | --------- | --------------- | -------------------- |
| id             | UUID      | PRIMARY KEY     | 사용자 고유 식별자   |
| email          | VARCHAR   | UNIQUE, NOT NULL | 이메일 (로그인 ID)   |
| password_hash  | VARCHAR   | NOT NULL        | bcrypt 해시된 비밀번호 |
| username       | VARCHAR   | NOT NULL        | 사용자명             |
| created_at     | TIMESTAMP | DEFAULT NOW()   | 가입일시             |
| last_login_at  | TIMESTAMP | NULL            | 최종 로그인 일시     |

#### Todo

| 필드        | 타입      | 제약조건        | 설명                           |
| ----------- | --------- | --------------- | ------------------------------ |
| id          | UUID      | PRIMARY KEY     | 할일 고유 식별자               |
| user_id     | UUID      | FOREIGN KEY, NOT NULL | 소유자 (User 참조)         |
| title       | VARCHAR   | NOT NULL        | 할일 제목 (최대 200자)         |
| content     | TEXT      | NULL            | 할일 내용                      |
| start_date  | TIMESTAMP | NULL            | 시작일시                       |
| end_date    | TIMESTAMP | NOT NULL        | 종료일시 (만료일)              |
| status      | VARCHAR   | DEFAULT 'active' | 상태 (active/trash)           |
| created_at  | TIMESTAMP | DEFAULT NOW()   | 생성일시                       |
| updated_at  | TIMESTAMP | DEFAULT NOW()   | 수정일시                       |
| deleted_at  | TIMESTAMP | NULL            | 삭제일시 (휴지통 이동 시 기록) |

#### PublicHoliday

| 필드         | 타입      | 제약조건      | 설명                           |
| ------------ | --------- | ------------- | ------------------------------ |
| id           | UUID      | PRIMARY KEY   | 공휴일 고유 식별자             |
| title        | VARCHAR   | NOT NULL      | 공휴일 명칭                    |
| holiday_date | DATE      | NOT NULL      | 공휴일 날짜                    |
| type         | VARCHAR   | NOT NULL      | 유형 (national/memorial)       |
| is_recurring | BOOLEAN   | DEFAULT FALSE | 매년 반복 여부                 |
| created_at   | TIMESTAMP | DEFAULT NOW() | 생성일시                       |

#### RefreshToken

| 필드       | 타입      | 제약조건            | 설명                     |
| ---------- | --------- | ------------------- | ------------------------ |
| id         | UUID      | PRIMARY KEY         | 토큰 고유 식별자         |
| user_id    | UUID      | FOREIGN KEY, NOT NULL | 사용자 참조            |
| token      | VARCHAR   | UNIQUE, NOT NULL    | 리프레시 토큰 값         |
| expires_at | TIMESTAMP | NOT NULL            | 만료일시                 |
| created_at | TIMESTAMP | DEFAULT NOW()       | 생성일시                 |

---

## 5. 기술 스택

### 5.1 선택된 기술

#### 프론트엔드

- **프레임워크**: React 18
- **언어**: TypeScript 5.x
- **상태 관리**: React Context API + Hooks
- **라우팅**: React Router v6
- **HTTP 클라이언트**: Axios
- **UI 라이브러리**: Material-UI (MUI) v5 또는 Tailwind CSS
- **폼 관리**: React Hook Form
- **날짜 처리**: date-fns
- **빌드 도구**: Vite

#### 백엔드

- **런타임**: Node.js 20 LTS
- **프레임워크**: Express.js 4.x
- **언어**: TypeScript 5.x
- **인증**: jsonwebtoken, bcrypt
- **검증**: express-validator 또는 Zod
- **데이터베이스 클라이언트**: node-postgres (pg)
- **ORM**: Prisma (선택) 또는 raw SQL
- **로깅**: Winston 또는 Pino
- **환경 변수**: dotenv

#### 데이터베이스

- **주 데이터베이스**: PostgreSQL 16
- **연결 풀링**: pg-pool

#### 개발 도구

- **언어**: TypeScript 5.x
- **코드 품질**: ESLint, Prettier
- **테스트**:
  - 단위/통합 테스트: Jest
  - E2E 테스트: Playwright
  - API 테스트: Supertest
- **버전 관리**: Git
- **패키지 매니저**: npm 또는 yarn
- **API 문서**: Swagger/OpenAPI (선택)

#### 배포 및 인프라

- **컨테이너**: Docker
- **CI/CD**: GitHub Actions
- **호스팅**: AWS/Azure/GCP (선택) 또는 Vercel/Railway

---

## 6. UI/UX 요구사항

### 6.1 화면 구성

#### 6.1.1 회원가입 화면 (`/register`)

**레이아웃:**
- 중앙 정렬 폼 (최대 너비 400px)
- 로고 또는 서비스명

**입력 필드:**
1. 이메일 입력
   - 플레이스홀더: "이메일을 입력하세요"
   - 실시간 형식 검증
   - 에러 메시지 표시
2. 비밀번호 입력
   - 플레이스홀더: "비밀번호 (8자 이상)"
   - 비밀번호 표시/숨김 토글
   - 강도 표시기
   - 에러 메시지 표시
3. 사용자명 입력
   - 플레이스홀더: "이름 (2-50자)"
   - 에러 메시지 표시

**버튼:**
- 회원가입 버튼 (Primary)
- 로그인 페이지로 이동 링크

**검증 피드백:**
- 실시간 입력 검증
- 필드별 에러 메시지
- 서버 에러 메시지 표시

#### 6.1.2 로그인 화면 (`/login`)

**레이아웃:**
- 중앙 정렬 폼 (최대 너비 400px)
- 로고 또는 서비스명

**입력 필드:**
1. 이메일 입력
   - 플레이스홀더: "이메일"
2. 비밀번호 입력
   - 플레이스홀더: "비밀번호"
   - 비밀번호 표시/숨김 토글

**버튼:**
- 로그인 버튼 (Primary)
- 회원가입 페이지로 이동 링크

**추가 기능:**
- "로그인 상태 유지" 체크박스 (선택)
- 에러 메시지 표시 영역

#### 6.1.3 메인 대시보드 (`/dashboard` 또는 `/`)

**헤더:**
- 서비스 로고/명
- 사용자명 표시
- 로그아웃 버튼

**네비게이션:**
- 할일 목록 (기본)
- 휴지통
- 캘린더 뷰 (선택)

**메인 콘텐츠:**

1. **할일 목록 섹션**
   - 날짜 필터 (오늘, 이번 주, 이번 달, 전체)
   - 정렬 옵션 (종료일순, 생성일순)
   - 할일 추가 버튼 (Floating Action Button 또는 상단 고정)

2. **할일 항목 카드**
   - 제목 (볼드)
   - 내용 (미리보기, 최대 2줄)
   - 시작일 ~ 종료일 표시
   - 상태 뱃지 (만료 임박, 만료됨 등)
   - 액션 버튼:
     - 수정 (연필 아이콘)
     - 삭제 (휴지통 아이콘)

3. **공휴일 항목**
   - 제목
   - 날짜
   - 공휴일 아이콘/뱃지
   - 수정/삭제 버튼 없음

**빈 상태:**
- 할일이 없을 때: "할일을 추가해보세요" 메시지 + 일러스트레이션

#### 6.1.4 할일 추가/수정 모달 (또는 페이지)

**폼 필드:**
1. 제목 입력 (필수)
   - 플레이스홀더: "할일 제목"
   - 최대 200자
2. 내용 입력 (선택)
   - 플레이스홀더: "내용을 입력하세요"
   - 멀티라인 텍스트 영역
   - 최대 2000자
3. 시작일 선택 (선택)
   - 날짜/시간 선택기
4. 종료일 선택 (필수)
   - 날짜/시간 선택기
   - 시작일 이후 날짜만 선택 가능

**버튼:**
- 저장 (Primary)
- 취소 (Secondary)

**검증:**
- 실시간 입력 검증
- 날짜 유효성 검사 (BR-005)

#### 6.1.5 휴지통 화면 (`/trash`)

**헤더:**
- "휴지통" 제목
- 뒤로 가기 버튼

**메인 콘텐츠:**

1. **휴지통 목록**
   - 삭제일시 순 정렬 (최신순)
   - 각 항목:
     - 제목
     - 삭제일시 표시
     - 액션 버튼:
       - 복원 (복구 아이콘)
       - 영구 삭제 (X 아이콘)

2. **영구 삭제 확인 다이얼로그**
   - 경고 메시지: "영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
   - 확인 버튼 (Danger)
   - 취소 버튼

**빈 상태:**
- 휴지통이 비어있을 때: "휴지통이 비어 있습니다" 메시지

### 6.2 반응형 디자인

#### 브레이크포인트

- **Mobile**: < 768px
- **Tablet**: 768px ~ 1024px
- **Desktop**: > 1024px

#### Mobile (P1)

- 단일 컬럼 레이아웃
- Floating Action Button으로 할일 추가
- 하단 네비게이션 바
- 풀 스크린 모달

#### Tablet

- 2컬럼 레이아웃 (선택)
- 사이드바 네비게이션

#### Desktop

- 최대 너비 제한 (1200px)
- 멀티 컬럼 레이아웃
- 사이드바 네비게이션

### 6.3 접근성 (Accessibility)

- **키보드 네비게이션**: 모든 인터랙티브 요소 키보드 접근 가능
- **ARIA 레이블**: 스크린 리더 지원
- **색상 대비**: WCAG AA 기준 준수
- **포커스 표시**: 명확한 포커스 인디케이터

### 6.4 사용자 경험

#### 로딩 상태

- API 호출 중 로딩 스피너 표시
- Skeleton UI (선택)

#### 피드백

- 성공 토스트: "할일이 추가되었습니다"
- 오류 토스트: "오류가 발생했습니다. 다시 시도해주세요"
- 확인 다이얼로그: 영구 삭제 등 중요한 작업

#### 애니메이션

- 부드러운 페이지 전환
- 모달/드로워 슬라이드 인
- 리스트 항목 페이드 인

---

## 7. 비기능 요구사항

### 7.1 성능

- **API 응답 시간**:
  - 95 percentile: 200ms 이하
  - 99 percentile: 500ms 이하
- **페이지 로드 시간**:
  - First Contentful Paint: 1.5초 이하
  - Time to Interactive: 3초 이하
- **동시 사용자 지원**: 100명 (MVP 기준)
- **데이터베이스 쿼리 최적화**:
  - 인덱스 활용
  - N+1 쿼리 방지

### 7.2 보안

#### 전송 보안

- **HTTPS 필수**: 모든 API 통신 암호화
- **HSTS 헤더**: Strict-Transport-Security 적용

#### 인증 및 권한

- **비밀번호 암호화**: bcrypt (salt rounds: 10)
- **JWT 토큰 관리**:
  - **Access Token**:
    - 만료 시간: 15분
    - 저장 위치: 메모리 (React state)
  - **Refresh Token**:
    - 만료 시간: 7일
    - 저장 위치: httpOnly 쿠키 또는 보안 스토리지
    - 데이터베이스에 저장 및 관리
- **토큰 갱신**: Access Token 만료 시 Refresh Token으로 자동 갱신
- **세션 관리**: 로그아웃 시 Refresh Token 무효화

#### 입력 검증

- **클라이언트 측 검증**: 즉각적인 사용자 피드백
- **서버 측 검증**: 모든 입력 재검증 (신뢰할 수 없는 클라이언트)
- **SQL Injection 방어**: Parameterized Query 사용
- **XSS 방어**:
  - 입력 sanitization
  - Content-Security-Policy 헤더
- **CSRF 방어**: CSRF 토큰 또는 SameSite 쿠키

#### API 보안

- **Rate Limiting**:
  - 인증 API: 5회/분 (IP 기준)
  - 일반 API: 100회/분 (사용자 기준)
- **CORS 설정**: 허용된 도메인만 접근
- **에러 메시지**: 민감한 정보 노출 방지

### 7.3 가용성 및 안정성

- **서버 가동률**: 99.5% (MVP 목표)
- **데이터 백업**:
  - 일일 자동 백업
  - 백업 보관 기간: 30일
- **에러 모니터링**:
  - 서버 에러 로깅
  - 실시간 알림 (선택)

### 7.4 확장성

- **수평 확장**: Stateless API 설계
- **데이터베이스 커넥션 풀링**: 최대 20 connections (초기 설정)
- **캐싱 전략** (P2):
  - 공휴일 데이터 캐싱
  - Redis 도입 검토

### 7.5 호환성

#### 브라우저

- Chrome (최신 2버전)
- Firefox (최신 2버전)
- Safari (최신 2버전)
- Edge (최신 2버전)

#### 모바일

- iOS: 14 이상
- Android: 10 이상

#### 해상도

- 최소 지원: 320px (모바일)
- 권장: 1280px 이상 (데스크톱)

---

## 8. 데이터 검증

### 8.1 회원가입 검증

#### 이메일

- **형식**: RFC 5322 준수
- **정규식**: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`
- **최대 길이**: 255자
- **중복 검사**: 데이터베이스 조회
- **에러 메시지**:
  - "유효한 이메일을 입력해주세요"
  - "이미 사용 중인 이메일입니다"

#### 비밀번호

- **최소 길이**: 8자
- **최대 길이**: 100자
- **복잡도**: 영문, 숫자, 특수문자 중 2가지 이상 포함
- **금지 패턴**:
  - 연속된 문자 (예: "12345678", "abcdefgh")
  - 이메일과 동일
- **에러 메시지**:
  - "비밀번호는 8자 이상이어야 합니다"
  - "영문, 숫자, 특수문자 중 2가지 이상을 포함해야 합니다"

#### 사용자명

- **최소 길이**: 2자
- **최대 길이**: 50자
- **허용 문자**: 한글, 영문, 숫자
- **에러 메시지**:
  - "사용자명은 2자 이상 50자 이하여야 합니다"

### 8.2 할일 검증

#### 제목

- **최소 길이**: 1자
- **최대 길이**: 200자
- **필수 여부**: 필수
- **에러 메시지**:
  - "제목을 입력해주세요"
  - "제목은 200자를 초과할 수 없습니다"

#### 내용

- **최소 길이**: 0자
- **최대 길이**: 2000자
- **필수 여부**: 선택
- **에러 메시지**:
  - "내용은 2000자를 초과할 수 없습니다"

#### 시작일

- **형식**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **필수 여부**: 선택
- **제약**: 종료일 이전이어야 함 (BR-005)
- **에러 메시지**:
  - "시작일은 종료일보다 이전이어야 합니다"

#### 종료일

- **형식**: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
- **필수 여부**: 필수 (BR-004)
- **제약**: 시작일 이후여야 함 (BR-005)
- **에러 메시지**:
  - "종료일을 입력해주세요"
  - "종료일은 시작일 이후여야 합니다"

### 8.3 클라이언트 측 검증

- React Hook Form 또는 Formik 사용
- 실시간 검증 (onChange, onBlur)
- 필드별 에러 메시지 표시

### 8.4 서버 측 검증

- express-validator 또는 Zod 사용
- 모든 입력 재검증
- 구조화된 에러 응답

---

## 9. 테스트 전략

### 9.1 단위 테스트

#### 프론트엔드

- **프레임워크**: Jest + React Testing Library
- **대상**:
  - React 컴포넌트 (UI 로직)
  - Custom Hooks
  - Utility 함수
- **커버리지 목표**: 70% 이상

#### 백엔드

- **프레임워크**: Jest
- **대상**:
  - 비즈니스 로직
  - Validation 함수
  - Utility 함수
- **커버리지 목표**: 80% 이상

### 9.2 통합 테스트

#### API 테스트

- **프레임워크**: Supertest + Jest
- **대상**:
  - 모든 API 엔드포인트
  - 인증/권한 검증
  - 에러 처리
- **테스트 케이스**:
  - 정상 시나리오
  - 에러 시나리오
  - 경계값 테스트

#### 데이터베이스 테스트

- **전략**:
  - 테스트용 PostgreSQL 인스턴스
  - 각 테스트 전 데이터 초기화
- **대상**:
  - CRUD 작업
  - 제약 조건 검증
  - 트랜잭션 처리

### 9.3 E2E 테스트

- **프레임워크**: Playwright
- **대상**:
  - 주요 사용자 플로우
  - 크로스 브라우저 테스트
- **시나리오**:
  1. 회원가입 → 로그인 → 할일 추가 → 로그아웃
  2. 할일 조회 → 수정 → 삭제 → 휴지통 확인 → 복원
  3. 할일 조회 → 삭제 → 휴지통 → 영구 삭제
- **실행 빈도**: PR 생성 시, 배포 전

### 9.4 성능 테스트 (선택)

- **도구**: k6 또는 Artillery
- **시나리오**:
  - 동시 사용자 100명
  - 일반적인 사용 패턴 시뮬레이션
- **측정 지표**:
  - 응답 시간
  - 처리량 (RPS)
  - 에러율

---

## 10. 배포 전략

### 10.1 환경 구성

#### Development (로컬)

- **프론트엔드**: http://localhost:5173
- **백엔드**: http://localhost:3000
- **데이터베이스**: PostgreSQL (Docker)
- **환경 변수**: `.env.development`

#### Staging (선택)

- **목적**: 프로덕션 배포 전 최종 검증
- **데이터**: 테스트 데이터
- **환경 변수**: `.env.staging`

#### Production

- **도메인**:
  - 프론트엔드: https://yt-todolist.com
  - 백엔드: https://api.yt-todolist.com
- **데이터베이스**: PostgreSQL (관리형 서비스)
- **환경 변수**: 환경 변수 관리 서비스 사용

### 10.2 CI/CD 파이프라인

#### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    - Lint 체크
    - 타입 체크
    - 단위 테스트 실행
    - 통합 테스트 실행
    - 커버리지 리포트

  build:
    - 프론트엔드 빌드
    - 백엔드 빌드
    - Docker 이미지 생성

  deploy:
    - main 브랜치 머지 시 자동 배포
    - 배포 후 health check
```

### 10.3 배포 절차

1. **코드 리뷰**: PR 생성 → 리뷰 → 승인
2. **테스트 실행**: CI 파이프라인 자동 실행
3. **빌드**: 성공 시 Docker 이미지 생성
4. **배포**: main 브랜치 머지 시 자동 배포
5. **검증**: Health check, Smoke test

### 10.4 롤백 전략

- **배포 버전 태그**: Git tag 사용
- **롤백 트리거**:
  - Health check 실패
  - 에러율 급증
  - 수동 트리거
- **롤백 절차**: 이전 버전 Docker 이미지로 재배포

---

## 11. 개발 우선순위 및 마일스톤

### 11.1 Phase 1 - MVP (P0)

**기간**: 4-6주 (예상)

**백엔드:**
- 데이터베이스 스키마 구축
- 사용자 인증 API (회원가입, 로그인)
- JWT 토큰 발급 및 검증
- 할일 CRUD API
- 휴지통 API (조회, 복원, 영구 삭제)
- API 검증 및 에러 처리

**프론트엔드:**
- 프로젝트 셋업 (React, TypeScript)
- 회원가입/로그인 페이지
- 메인 대시보드 (할일 목록)
- 할일 추가/수정 모달
- 휴지통 페이지
- 인증 관리 (토큰 저장, 자동 로그인)

**테스트:**
- 핵심 기능 단위 테스트
- API 통합 테스트

**배포:**
- 개발 환경 구축
- 기본 CI/CD 파이프라인

### 11.2 Phase 2 - Enhancement (P1)

**기간**: 2-3주 (예상)

**백엔드:**
- 공휴일 API 구현
- Refresh Token 갱신 로직
- 통합 캘린더 API

**프론트엔드:**
- 공휴일 표시 기능
- 토큰 자동 갱신
- 반응형 디자인 (모바일)
- 로딩 상태 및 에러 처리 개선
- 사용자 피드백 (Toast, Dialog)

**테스트:**
- E2E 테스트 (주요 플로우)
- 크로스 브라우저 테스트

**배포:**
- 프로덕션 환경 구축
- 모니터링 설정

### 11.3 Phase 3 - Polish (P2)

**기간**: 1-2주 (예상)

**기능:**
- 사용자 프로필 수정
- 비밀번호 변경
- 이메일 인증 (선택)
- 다크 모드 (선택)

**개선:**
- 성능 최적화
- 접근성 개선
- 애니메이션 추가
- 에러 메시지 개선

**테스트:**
- 성능 테스트
- 부하 테스트

---

## 12. 모니터링 및 로깅

### 12.1 로깅

#### 백엔드

- **로깅 레벨**:
  - ERROR: 시스템 오류
  - WARN: 경고 (재시도 가능)
  - INFO: 주요 이벤트 (로그인, CRUD)
  - DEBUG: 디버깅 정보 (개발 환경만)

- **로그 포맷**:
  ```json
  {
    "timestamp": "2025-11-25T10:00:00.000Z",
    "level": "INFO",
    "message": "User logged in",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "ip": "192.168.1.1"
  }
  ```

#### 프론트엔드

- **에러 로깅**:
  - API 호출 실패
  - 예상치 못한 에러
- **사용자 액션 추적** (선택):
  - 페이지 뷰
  - 버튼 클릭

### 12.2 모니터링

#### 서버 모니터링

- **Health Check 엔드포인트**: `/health`
- **메트릭**:
  - CPU 사용률
  - 메모리 사용률
  - 디스크 I/O
  - 네트워크 트래픽

#### 애플리케이션 모니터링

- **메트릭**:
  - API 응답 시간
  - 에러율
  - 활성 사용자 수
  - 요청 수 (RPS)

#### 데이터베이스 모니터링

- **메트릭**:
  - 쿼리 실행 시간
  - 커넥션 수
  - 슬로우 쿼리

---

## 13. 보안 체크리스트

### 13.1 개발 단계

- [ ] 비밀번호 bcrypt 암호화 (salt rounds: 10)
- [ ] JWT 토큰 서명 및 검증
- [ ] 환경 변수로 시크릿 관리 (.env 파일 gitignore)
- [ ] SQL Injection 방어 (Parameterized Query)
- [ ] XSS 방어 (입력 sanitization)
- [ ] CSRF 방어 (토큰 또는 SameSite 쿠키)
- [ ] Rate Limiting 구현
- [ ] CORS 설정
- [ ] 에러 메시지 민감 정보 제거

### 13.2 배포 단계

- [ ] HTTPS 적용 및 HSTS 헤더
- [ ] 환경 변수 보안 저장소 사용
- [ ] 데이터베이스 접근 제한 (IP 화이트리스트)
- [ ] 정기 보안 업데이트
- [ ] 의존성 취약점 스캔 (npm audit)

---

## 14. 위험 관리

### 14.1 기술적 위험

| 위험 | 가능성 | 영향도 | 완화 전략 |
|------|--------|--------|-----------|
| JWT 토큰 탈취 | 중 | 높음 | HTTPS 강제, 짧은 만료 시간, Refresh Token 관리 |
| 데이터베이스 장애 | 낮음 | 높음 | 정기 백업, 복구 절차 준비 |
| API 성능 저하 | 중 | 중 | 쿼리 최적화, 인덱스 활용, 캐싱 |
| 의존성 취약점 | 중 | 중 | 정기 업데이트, 자동 스캔 |

### 14.2 일정 위험

| 위험 | 가능성 | 영향도 | 완화 전략 |
|------|--------|--------|-----------|
| 요구사항 변경 | 중 | 중 | MVP 범위 명확화, 변경 관리 프로세스 |
| 기술 학습 곡선 | 낮음 | 중 | 사전 학습, 문서화 |
| 통합 이슈 | 중 | 중 | 조기 통합 테스트, API 명세 준수 |

---

## 부록

### A. 관련 문서

- [도메인 정의서](./1-domain-definition.md)
- [PRD 입력 템플릿](./2-prd-input-template.md)

### B. 공휴일 데이터 예시

```json
[
  {
    "title": "신정",
    "holidayDate": "2025-01-01",
    "type": "national",
    "isRecurring": true
  },
  {
    "title": "설날",
    "holidayDate": "2025-01-29",
    "type": "national",
    "isRecurring": true
  },
  {
    "title": "삼일절",
    "holidayDate": "2025-03-01",
    "type": "national",
    "isRecurring": true
  },
  {
    "title": "어린이날",
    "holidayDate": "2025-05-05",
    "type": "national",
    "isRecurring": true
  },
  {
    "title": "현충일",
    "holidayDate": "2025-06-06",
    "type": "memorial",
    "isRecurring": true
  },
  {
    "title": "광복절",
    "holidayDate": "2025-08-15",
    "type": "national",
    "isRecurring": true
  },
  {
    "title": "추석",
    "holidayDate": "2025-10-06",
    "type": "national",
    "isRecurring": false
  },
  {
    "title": "개천절",
    "holidayDate": "2025-10-03",
    "type": "national",
    "isRecurring": true
  },
  {
    "title": "한글날",
    "holidayDate": "2025-10-09",
    "type": "national",
    "isRecurring": true
  },
  {
    "title": "크리스마스",
    "holidayDate": "2025-12-25",
    "type": "national",
    "isRecurring": true
  }
]
```

### C. 환경 변수 예시

```env
# 서버 설정
NODE_ENV=production
PORT=3000

# 데이터베이스
DB_HOST=localhost
DB_PORT=5432
DB_NAME=yt_todolist
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT 설정
JWT_ACCESS_SECRET=your_access_token_secret_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yt-todolist.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

**문서 버전:** 1.0
**최초 작성일:** 2025-11-25
**최종 수정일:** 2025-11-25
**작성자:** 개발팀
**승인자:** -
