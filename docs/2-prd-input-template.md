# PRD 입력 템플릿

> **yt-todolist** - 사용자 인증 기반 할일 관리 애플리케이션

---

## 문서 정보

| 항목          | 내용       |
| ------------- | ---------- |
| **문서 버전** | 1.0        |
| **작성일**    | 2025-11-25 |
| **작성자**    | 개발팀     |
| **상태**      | Draft      |

---

## 템플릿 사용 가이드

이 템플릿을 사용하여 실제 PRD를 작성하세요.

### 작성 순서

1. 기술 스택 결정
2. 데이터베이스 스키마 설계
3. API 명세 작성
4. UI/UX 요구사항 정의
5. 비기능 요구사항 작성

---

## 1. 제품 개요

### 1.1 제품 비전

TODO: 제품의 장기 목표를 작성하세요

### 1.2 타겟 사용자

- 사용자 유형: 개인 사용자
- 주요 니즈: 할일 관리

### 1.3 핵심 가치

- 사용자별 독립적인 할일 관리
- 일정 기반 할일 추적
- 삭제된 항목의 복구 기능

---

## 2. 기능 요구사항

### 2.1 MVP 범위

#### P0 (필수)

- UC-001: 회원가입
- UC-002: 로그인
- UC-003: 할일 목록 조회
- UC-004: 할일 추가
- UC-005: 할일 수정
- UC-006: 할일 삭제
- UC-007: 휴지통 조회
- UC-008: 할일 복원
- UC-009: 영구 삭제

#### P1 (중요)

- 공휴일 조회
- JWT 토큰 갱신
- 반응형 디자인

---

## 3. API 명세

### 3.1 인증 API

#### POST /api/auth/register

회원가입

요청:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "홍길동"
}
```

응답 (201):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "홍길동"
    }
  }
}
```

#### POST /api/auth/login

로그인

요청:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

응답 (200):

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### 3.2 할일 API

#### GET /api/todos

할일 목록 조회

헤더:

```
Authorization: Bearer {accessToken}
```

응답 (200):

```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": "uuid",
        "title": "할일 제목",
        "content": "할일 내용",
        "startDate": "2025-11-25T00:00:00Z",
        "endDate": "2025-11-30T00:00:00Z",
        "status": "active"
      }
    ]
  }
}
```

#### POST /api/todos

할일 생성

요청:

```json
{
  "title": "새 할일",
  "content": "내용",
  "startDate": "2025-11-25T00:00:00Z",
  "endDate": "2025-11-30T00:00:00Z"
}
```

#### PUT /api/todos/:id

할일 수정

#### DELETE /api/todos/:id

할일 삭제 (휴지통 이동)

---

## 4. 데이터 스키마

### 4.1 PostgreSQL 스키마

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE TABLE public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  holiday_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE
);
```

---

## 5. 기술 스택

### 5.1 선택된 기술

#### 프론트엔드

- React 18

#### 백엔드

- Node.js 20
- express
- rest api

#### 데이터베이스

- PostgreSQL 16

#### 개발 도구

- TypeScript
- ESLint
- Prettier
- Jest

---

## 6. UI/UX 요구사항

### 6.1 화면 구성

#### 회원가입 화면

- 이메일 입력
- 비밀번호 입력
- 사용자명 입력
- 회원가입 버튼

#### 로그인 화면

- 이메일 입력
- 비밀번호 입력
- 로그인 버튼

#### 메인 대시보드

- 할일 목록
- 할일 추가 버튼
- 각 할일 항목:
  - 제목
  - 기간
  - 수정/삭제 버튼

#### 휴지통 화면

- 삭제된 할일 목록
- 복원/영구삭제 버튼

---

## 7. 비기능 요구사항

### 7.1 성능

- API 응답 시간: 200ms 이하
- 동시 사용자: 100명 지원

### 7.2 보안

- HTTPS 필수
- 비밀번호 bcrypt 암호화
- JWT 토큰:
  - Access Token: 15분
  - Refresh Token: 7일
- SQL Injection 방어
- XSS 방어

### 7.3 호환성

- Chrome, Firefox, Safari 최신 2버전
- 모바일: iOS 14+, Android 10+

---

## 8. 데이터 검증

### 8.1 회원가입 검증

- 이메일: RFC 5322 형식
- 비밀번호: 8자 이상, 영문/숫자/특수문자
- 사용자명: 2-50자

### 8.2 할일 검증

- 제목: 1-200자, 필수
- 내용: 0-2000자, 선택
- 종료일: 시작일 이후

---

## 9. 테스트 전략

### 9.1 단위 테스트

- 프레임워크: Jest
- 커버리지: 80% 이상

### 9.2 통합 테스트

- API 테스트: Supertest

### 9.3 E2E 테스트

- 프레임워크: Playwright

---

## 10. 배포 전략

### 10.1 환경

- Development: 로컬
- Production: 클라우드

### 10.2 CI/CD

- GitHub Actions
- main 브랜치 머지 시 자동 배포

---

## 11. 개발 우선순위

### P0 (필수)

- 회원가입/로그인
- 할일 CRUD
- 휴지통 관리

### P1 (중요)

- 공휴일 조회
- 토큰 갱신
- 반응형 디자인

### P2 (선택)

- 프로필 수정
- 비밀번호 변경

---

## 부록

### 관련 문서

- [도메인 정의서](./1-domain-definition.md)

---

**문서 버전:** 1.0
**작성일:** 2025-11-25
