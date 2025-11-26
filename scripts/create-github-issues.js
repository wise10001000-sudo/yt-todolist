#!/usr/bin/env node

/**
 * GitHub Issues Creation Script
 *
 * This script creates GitHub issues for all tasks defined in the execution plan.
 * It reads from the execution plan markdown file and generates structured issues.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const EXECUTION_PLAN_PATH = path.join(__dirname, '..', 'docs', '7-execution-plan.md');
const PRD_PATH = path.join(__dirname, '..', 'docs', '3-prd.md');
const DRY_RUN = process.env.DRY_RUN === 'true';

// Task metadata with labels and dependencies
const TASKS = [
  // Phase 1: MVP (P0) - Database
  {
    id: 'DB-01',
    title: 'PostgreSQL 환경 구축',
    phase: 'Phase 1 - MVP',
    description: '로컬 및 프로덕션 PostgreSQL 데이터베이스 환경 구축',
    completionCriteria: [
      'PostgreSQL 16 설치 완료',
      '개발용 DB 인스턴스 생성',
      '데이터베이스 사용자 및 권한 설정',
      'DB 연결 테스트 성공',
      '.env 파일에 연결 정보 설정'
    ],
    technicalConsiderations: [
      'PostgreSQL 16 사용',
      '연결 풀링 설정 필요',
      '환경 변수로 연결 정보 관리'
    ],
    dependencies: {
      before: [],
      after: ['DB-02']
    },
    estimatedTime: '0.5일',
    labels: ['database', 'infra', 'complexity: low', 'P0'],
    status: 'completed'
  },
  {
    id: 'DB-02',
    title: '데이터베이스 스키마 생성',
    phase: 'Phase 1 - MVP',
    description: 'database/schema.sql 실행하여 모든 테이블, 인덱스, 제약조건 생성',
    completionCriteria: [
      'users 테이블 생성 완료',
      'todos 테이블 생성 완료',
      'public_holidays 테이블 생성 완료',
      'refresh_tokens 테이블 생성 완료',
      '모든 인덱스 생성 확인',
      '외래 키 제약조건 확인',
      '트리거 생성 확인 (update_todos_updated_at)'
    ],
    technicalConsiderations: [
      'UUID 기본 키 사용',
      '인덱스 전략: user_id, status, end_date, deleted_at',
      'CHECK 제약조건으로 데이터 무결성 보장',
      'CASCADE 삭제 정책'
    ],
    dependencies: {
      before: ['DB-01'],
      after: ['DB-03', 'Backend-02']
    },
    estimatedTime: '0.5일',
    labels: ['database', 'schema', 'complexity: medium', 'P0'],
    status: 'completed'
  },
  {
    id: 'DB-03',
    title: '시드 데이터 삽입',
    phase: 'Phase 1 - MVP',
    description: '공휴일 데이터 및 테스트 데이터 삽입',
    completionCriteria: [
      '2025년 공휴일 데이터 삽입',
      '테스트용 사용자 생성 (개발 환경)',
      '테스트용 할일 데이터 생성 (개발 환경)',
      '데이터 무결성 검증'
    ],
    technicalConsiderations: [
      '공휴일 데이터는 PRD 부록 B 참조',
      '개발 환경에만 테스트 데이터 삽입',
      '프로덕션 환경에는 공휴일만 삽입'
    ],
    dependencies: {
      before: ['DB-02'],
      after: ['Backend-18']
    },
    estimatedTime: '0.5일',
    labels: ['database', 'seed-data', 'complexity: low', 'P0'],
    status: 'completed'
  },
  {
    id: 'DB-04',
    title: '데이터베이스 백업 및 복구 절차 수립',
    phase: 'Phase 1 - MVP',
    description: '자동 백업 설정 및 복구 절차 문서화',
    completionCriteria: [
      '자동 백업 스크립트 작성',
      '백업 보관 정책 수립 (30일)',
      '복구 절차 문서화',
      '복구 테스트 성공'
    ],
    technicalConsiderations: [
      'pg_dump를 사용한 백업',
      '일일 자동 백업 cron 설정',
      '백업 파일 암호화 고려',
      '복구 시나리오별 절차 문서화'
    ],
    dependencies: {
      before: ['DB-02'],
      after: ['Infra-06']
    },
    estimatedTime: '1일',
    labels: ['database', 'backup', 'infra', 'complexity: medium', 'P0'],
    status: 'completed'
  },

  // Phase 1: MVP (P0) - Backend
  {
    id: 'Backend-01',
    title: '백엔드 프로젝트 초기 설정',
    phase: 'Phase 1 - MVP',
    description: 'Node.js/Express/TypeScript 백엔드 프로젝트 기본 구조 및 개발 환경 설정',
    completionCriteria: [
      'TypeScript 컴파일 성공',
      'Express 서버 기동 확인 (Hello World)',
      '환경 변수 로딩 확인',
      '코드 품질 도구 작동 확인 (ESLint, Prettier)',
      '폴더 구조 설정 완료'
    ],
    technicalConsiderations: [
      'Node.js 20 LTS, Express 4.x, TypeScript 5.x',
      '폴더 구조: src/{routes, controllers, services, middlewares, utils, types}',
      'ESLint + Prettier 설정',
      'nodemon으로 개발 서버 자동 재시작'
    ],
    dependencies: {
      before: [],
      after: ['Backend-02', 'Backend-03', 'Backend-04']
    },
    estimatedTime: '1일',
    labels: ['backend', 'setup', 'complexity: low', 'P0']
  },
  {
    id: 'Backend-02',
    title: '데이터베이스 연결 및 설정',
    phase: 'Phase 1 - MVP',
    description: 'PostgreSQL 데이터베이스 연결 풀 설정 및 스키마 초기화',
    completionCriteria: [
      '데이터베이스 연결 성공 확인',
      '모든 테이블 생성 확인',
      '인덱스 및 제약조건 확인',
      '연결 풀 정상 작동 확인',
      '에러 로깅 확인'
    ],
    technicalConsiderations: [
      'node-postgres (pg) 사용',
      '연결 풀 설정: max 20 connections',
      '환경 변수로 DB 설정 관리',
      '연결 실패 시 재시도 로직'
    ],
    dependencies: {
      before: ['Backend-01', 'DB-02'],
      after: ['Backend-05']
    },
    estimatedTime: '1일',
    labels: ['backend', 'database', 'complexity: medium', 'P0']
  },
  {
    id: 'Backend-03',
    title: '공통 미들웨어 및 유틸리티 구현',
    phase: 'Phase 1 - MVP',
    description: '에러 처리, 로깅, CORS, Rate Limiting 등 공통 미들웨어 구현',
    completionCriteria: [
      '에러 발생 시 표준 형식으로 응답',
      '로그 파일 정상 생성',
      'CORS 설정 작동 확인',
      'Rate Limiting 동작 확인',
      '단위 테스트 작성 및 통과'
    ],
    technicalConsiderations: [
      'Winston 또는 Pino 로깅',
      'express-rate-limit: 인증 API 5회/분, 일반 API 100회/분',
      'CORS: 허용된 도메인만 접근',
      '에러 응답 형식 통일 (PRD Section 3.1)',
      'helmet으로 보안 헤더 설정'
    ],
    dependencies: {
      before: ['Backend-01'],
      after: ['Backend-21', 'Backend-23']
    },
    estimatedTime: '2일',
    labels: ['backend', 'middleware', 'complexity: medium', 'P0']
  },
  {
    id: 'Backend-04',
    title: '비밀번호 해싱 및 JWT 유틸리티',
    phase: 'Phase 1 - MVP',
    description: 'bcrypt 비밀번호 해싱, JWT 토큰 생성/검증 유틸리티 구현',
    completionCriteria: [
      '비밀번호 해싱/검증 정상 작동',
      'JWT 토큰 생성/검증 정상 작동',
      '토큰 만료 시간 정확성 확인',
      '단위 테스트 작성 및 통과 (커버리지 80% 이상)'
    ],
    technicalConsiderations: [
      'bcrypt salt rounds: 10',
      'Access Token: 15분, Refresh Token: 7일',
      'JWT 시크릿은 환경 변수 관리',
      'jsonwebtoken 라이브러리 사용'
    ],
    dependencies: {
      before: ['Backend-01'],
      after: ['Backend-05', 'Backend-06', 'Backend-07']
    },
    estimatedTime: '1일',
    labels: ['backend', 'authentication', 'security', 'complexity: medium', 'P0']
  },
  {
    id: 'Backend-05',
    title: '회원가입 API 구현',
    phase: 'Phase 1 - MVP',
    description: 'POST /api/auth/register 엔드포인트 구현',
    completionCriteria: [
      'API 응답 형식이 PRD 명세와 일치',
      '이메일 중복 시 409 Conflict 반환',
      '유효하지 않은 입력 시 400 Bad Request 반환',
      '성공 시 201 Created 및 사용자 정보 반환',
      '통합 테스트 작성 및 통과',
      'Swagger/OpenAPI 문서 작성'
    ],
    technicalConsiderations: [
      '이메일 형식 검증: RFC 5322',
      '비밀번호 복잡도 검증 (PRD Section 8.1)',
      '사용자명 길이 검증: 2-50자',
      'express-validator 또는 Zod 사용',
      '비밀번호 해싱 후 저장'
    ],
    dependencies: {
      before: ['Backend-02', 'Backend-04'],
      after: ['Backend-06']
    },
    estimatedTime: '2일',
    labels: ['backend', 'authentication', 'api', 'complexity: medium', 'P0']
  },
  {
    id: 'Backend-06',
    title: '로그인 API 구현',
    phase: 'Phase 1 - MVP',
    description: 'POST /api/auth/login 엔드포인트 구현',
    completionCriteria: [
      'API 응답 형식이 PRD 명세와 일치',
      '성공 시 accessToken, refreshToken, user 반환',
      '잘못된 이메일/비밀번호 시 401 Unauthorized',
      'Refresh Token이 DB에 저장됨',
      '통합 테스트 작성 및 통과',
      'API 문서 업데이트'
    ],
    technicalConsiderations: [
      'bcrypt로 비밀번호 검증',
      'Access Token과 Refresh Token 모두 발급',
      'Refresh Token을 refresh_tokens 테이블에 저장',
      'last_login_at 필드 업데이트'
    ],
    dependencies: {
      before: ['Backend-05'],
      after: ['Backend-08', 'Backend-09']
    },
    estimatedTime: '2일',
    labels: ['backend', 'authentication', 'api', 'complexity: medium', 'P0']
  },
  {
    id: 'Backend-07',
    title: 'JWT 인증 미들웨어 구현',
    phase: 'Phase 1 - MVP',
    description: 'Authorization 헤더의 JWT 토큰 검증 미들웨어',
    completionCriteria: [
      '유효한 토큰 시 req.user에 사용자 정보 저장',
      '토큰 없음 시 401 반환',
      '유효하지 않은 토큰 시 401 반환',
      '만료된 토큰 시 401 반환',
      '단위 테스트 작성 및 통과'
    ],
    technicalConsiderations: [
      'Authorization: Bearer {token} 형식 파싱',
      'JWT 검증 및 디코딩',
      'req.user = { id, email, username } 설정',
      '모든 보호된 엔드포인트에 적용'
    ],
    dependencies: {
      before: ['Backend-04'],
      after: ['Backend-09', 'Backend-10']
    },
    estimatedTime: '1일',
    labels: ['backend', 'authentication', 'middleware', 'complexity: medium', 'P0']
  },
  {
    id: 'Backend-08',
    title: '토큰 갱신 API 구현 (P1)',
    phase: 'Phase 2 - Enhancement',
    description: 'POST /api/auth/refresh 엔드포인트 구현',
    completionCriteria: [
      '유효한 Refresh Token으로 새 Access Token 발급',
      '유효하지 않은 토큰 시 401 반환',
      '만료된 토큰 시 401 반환',
      '통합 테스트 작성 및 통과',
      'API 문서 업데이트'
    ],
    technicalConsiderations: [
      'Refresh Token을 DB에서 조회 및 검증',
      '만료되지 않은 토큰인지 확인',
      '새로운 Access Token 발급',
      'Refresh Token 재발급 여부 고려'
    ],
    dependencies: {
      before: ['Backend-06'],
      after: ['Frontend-19']
    },
    estimatedTime: '2일',
    labels: ['backend', 'authentication', 'api', 'complexity: medium', 'P1']
  },
  {
    id: 'Backend-09',
    title: '로그아웃 API 구현 (P1)',
    phase: 'Phase 2 - Enhancement',
    description: 'POST /api/auth/logout 엔드포인트 구현',
    completionCriteria: [
      '로그아웃 시 Refresh Token DB에서 삭제',
      '성공 메시지 반환',
      '인증 필요 (JWT 미들웨어)',
      '통합 테스트 작성 및 통과',
      'API 문서 업데이트'
    ],
    technicalConsiderations: [
      '사용자의 모든 Refresh Token 삭제 또는 특정 토큰만 삭제',
      'req.user에서 사용자 ID 가져오기',
      'DELETE FROM refresh_tokens WHERE user_id = ?'
    ],
    dependencies: {
      before: ['Backend-07'],
      after: ['Frontend-22']
    },
    estimatedTime: '1일',
    labels: ['backend', 'authentication', 'api', 'complexity: low', 'P1']
  },
  {
    id: 'Backend-10',
    title: '할일 생성 API 구현',
    phase: 'Phase 1 - MVP',
    description: 'POST /api/todos 엔드포인트 구현',
    completionCriteria: [
      'API 응답 형식이 PRD 명세와 일치',
      '성공 시 201 Created 및 생성된 todo 반환',
      '유효하지 않은 입력 시 400 Bad Request',
      '날짜 순서 위반 시 400 반환',
      '통합 테스트 작성 및 통과',
      'API 문서 작성'
    ],
    technicalConsiderations: [
      '제목: 1-200자 (필수)',
      '내용: 0-2000자 (선택)',
      '종료일: 필수 (BR-004)',
      '시작일 <= 종료일 검증 (BR-005)',
      'user_id는 JWT 토큰에서 추출',
      'status는 자동으로 "active" 설정'
    ],
    dependencies: {
      before: ['Backend-07'],
      after: ['Backend-11', 'Backend-12']
    },
    estimatedTime: '2일',
    labels: ['backend', 'todo-crud', 'api', 'complexity: medium', 'P0']
  },
  {
    id: 'Backend-11',
    title: '할일 목록 조회 API 구현',
    phase: 'Phase 1 - MVP',
    description: 'GET /api/todos 엔드포인트 구현 (페이지네이션, 필터링)',
    completionCriteria: [
      'API 응답 형식이 PRD 명세와 일치',
      'status="active"인 항목만 반환',
      '날짜 필터링 정상 작동',
      '페이지네이션 정상 작동',
      '다른 사용자의 todo는 조회되지 않음',
      '통합 테스트 작성 및 통과',
      'API 문서 업데이트'
    ],
    technicalConsiderations: [
      'WHERE user_id = ? AND status = "active"',
      'startDate/endDate 쿼리 파라미터로 날짜 필터링',
      'page, limit 파라미터로 페이지네이션 (기본값: 1, 50)',
      'ORDER BY end_date ASC',
      '인덱스 활용: idx_todos_user_id, idx_todos_status, idx_todos_end_date'
    ],
    dependencies: {
      before: ['Backend-10'],
      after: ['Backend-19', 'Frontend-12']
    },
    estimatedTime: '2일',
    labels: ['backend', 'todo-crud', 'api', 'complexity: medium', 'P0']
  },
  {
    id: 'Backend-12',
    title: '할일 상세 조회 API 구현',
    phase: 'Phase 1 - MVP',
    description: 'GET /api/todos/:id 엔드포인트 구현',
    completionCriteria: [
      '유효한 ID로 todo 조회 성공',
      '다른 사용자의 todo 조회 시 403 Forbidden',
      '존재하지 않는 ID 시 404 Not Found',
      'API 응답 형식이 PRD 명세와 일치',
      '통합 테스트 작성 및 통과',
      'API 문서 업데이트'
    ],
    technicalConsiderations: [
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
      '소유권 검증: todo.user_id === req.user.id',
      'UUID 형식 검증'
    ],
    dependencies: {
      before: ['Backend-10'],
      after: ['Backend-13', 'Backend-14']
    },
    estimatedTime: '1일',
    labels: ['backend', 'todo-crud', 'api', 'complexity: low', 'P0']
  },
  {
    id: 'Backend-13',
    title: '할일 수정 API 구현',
    phase: 'Phase 1 - MVP',
    description: 'PUT /api/todos/:id 엔드포인트 구현',
    completionCriteria: [
      '성공 시 200 OK 및 수정된 todo 반환',
      '소유권 검증 (403)',
      '존재하지 않는 todo 시 404',
      '유효하지 않은 입력 시 400',
      'updated_at 자동 갱신 확인',
      '통합 테스트 작성 및 통과',
      'API 문서 업데이트'
    ],
    technicalConsiderations: [
      '소유권 검증: todo.user_id === req.user.id',
      '날짜 검증: start_date <= end_date',
      'UPDATE 트리거로 updated_at 자동 갱신',
      '부분 업데이트 지원'
    ],
    dependencies: {
      before: ['Backend-12'],
      after: ['Frontend-15']
    },
    estimatedTime: '2일',
    labels: ['backend', 'todo-crud', 'api', 'complexity: medium', 'P0']
  },
  {
    id: 'Backend-14',
    title: '할일 삭제 API 구현 (휴지통 이동)',
    phase: 'Phase 1 - MVP',
    description: 'DELETE /api/todos/:id 엔드포인트 구현 (소프트 삭제)',
    completionCriteria: [
      '성공 시 200 OK 및 메시지 반환',
      'status="trash", deleted_at 설정됨',
      '소유권 검증 (403)',
      '존재하지 않는 todo 시 404',
      '통합 테스트 작성 및 통과',
      'API 문서 업데이트'
    ],
    technicalConsiderations: [
      'UPDATE todos SET status="trash", deleted_at=NOW() WHERE id=? AND user_id=?',
      '소프트 삭제: 데이터는 삭제하지 않음',
      'deleted_at 타임스탬프 기록'
    ],
    dependencies: {
      before: ['Backend-12'],
      after: ['Backend-15', 'Frontend-13']
    },
    estimatedTime: '1일',
    labels: ['backend', 'todo-crud', 'trash', 'api', 'complexity: low', 'P0']
  },
  {
    id: 'Backend-15',
    title: '휴지통 목록 조회 API 구현',
    phase: 'Phase 1 - MVP',
    description: 'GET /api/trash 엔드포인트 구현',
    completionCriteria: [
      'API 응답 형식이 PRD 명세와 일치',
      'status="trash"인 항목만 반환',
      'deleted_at 필드 포함',
      '페이지네이션 정상 작동',
      '통합 테스트 작성 및 통과',
      'API 문서 작성'
    ],
    technicalConsiderations: [
      'WHERE user_id = ? AND status = "trash"',
      'ORDER BY deleted_at DESC (최신순)',
      'page, limit 파라미터',
      '인덱스 활용: idx_todos_deleted_at'
    ],
    dependencies: {
      before: ['Backend-14'],
      after: ['Backend-16', 'Backend-17', 'Frontend-16']
    },
    estimatedTime: '2일',
    labels: ['backend', 'trash', 'api', 'complexity: medium', 'P0']
  },
  {
    id: 'Backend-16',
    title: '할일 복원 API 구현',
    phase: 'Phase 1 - MVP',
    description: 'POST /api/trash/:id/restore 엔드포인트 구현',
    completionCriteria: [
      '성공 시 200 OK 및 메시지 반환',
      'status="active", deleted_at=NULL 설정됨',
      '소유권 검증 (403)',
      '존재하지 않는 항목 시 404',
      '통합 테스트 작성 및 통과',
      'API 문서 업데이트'
    ],
    technicalConsiderations: [
      'UPDATE todos SET status="active", deleted_at=NULL WHERE id=? AND user_id=?',
      '소유권 검증 필요',
      'status="trash"인 항목만 복원 가능'
    ],
    dependencies: {
      before: ['Backend-15'],
      after: ['Frontend-17']
    },
    estimatedTime: '1일',
    labels: ['backend', 'trash', 'api', 'complexity: low', 'P0']
  },
  {
    id: 'Backend-17',
    title: '할일 영구 삭제 API 구현',
    phase: 'Phase 1 - MVP',
    description: 'DELETE /api/trash/:id 엔드포인트 구현 (하드 삭제)',
    completionCriteria: [
      '성공 시 200 OK 및 메시지 반환',
      'DB에서 완전히 삭제됨',
      '소유권 검증 (403)',
      '존재하지 않는 항목 시 404',
      '통합 테스트 작성 및 통과',
      'API 문서 업데이트'
    ],
    technicalConsiderations: [
      'DELETE FROM todos WHERE id=? AND user_id=?',
      '하드 삭제: 복구 불가',
      'status="trash"인 항목만 삭제 가능',
      '소유권 검증 필수'
    ],
    dependencies: {
      before: ['Backend-15'],
      after: ['Frontend-17']
    },
    estimatedTime: '1일',
    labels: ['backend', 'trash', 'api', 'complexity: low', 'P0']
  },
  {
    id: 'Backend-18',
    title: '공휴일 조회 API 구현',
    phase: 'Phase 2 - Enhancement',
    description: 'GET /api/holidays 엔드포인트 구현',
    completionCriteria: [
      'API 응답 형식이 PRD 명세와 일치',
      '연도/월 필터링 정상 작동',
      '공휴일 데이터가 DB에 존재',
      '통합 테스트 작성 및 통과',
      'API 문서 작성'
    ],
    technicalConsiderations: [
      'SELECT * FROM public_holidays',
      'year, month 쿼리 파라미터로 필터링',
      'ORDER BY holiday_date ASC',
      '인덱스: idx_holidays_date'
    ],
    dependencies: {
      before: ['Backend-07', 'DB-03'],
      after: ['Backend-19', 'Frontend-18']
    },
    estimatedTime: '2일',
    labels: ['backend', 'holiday', 'api', 'complexity: low', 'P1']
  },
  {
    id: 'Backend-19',
    title: '통합 캘린더 API 구현',
    phase: 'Phase 2 - Enhancement',
    description: 'GET /api/calendar 엔드포인트 구현 (할일 + 공휴일)',
    completionCriteria: [
      'API 응답 형식이 PRD 명세와 일치',
      '할일과 공휴일이 통합되어 반환됨',
      'type 필드로 구분 가능',
      'editable 필드 정확성',
      '통합 테스트 작성 및 통과',
      'API 문서 작성'
    ],
    technicalConsiderations: [
      '할일(type="todo")과 공휴일(type="holiday") 통합',
      'startDate, endDate 필터링',
      '날짜순 정렬',
      '할일은 editable=true, 공휴일은 editable=false'
    ],
    dependencies: {
      before: ['Backend-11', 'Backend-18'],
      after: []
    },
    estimatedTime: '2일',
    labels: ['backend', 'holiday', 'calendar', 'api', 'complexity: medium', 'P1']
  },
  {
    id: 'Backend-20',
    title: '성능 최적화',
    phase: 'Phase 2 - Enhancement',
    description: '데이터베이스 쿼리 최적화 및 응답 시간 개선',
    completionCriteria: [
      'API 응답 시간 p95 200ms 이하',
      '동시 사용자 100명 처리 가능',
      'DB 쿼리 최적화 완료',
      '성능 테스트 리포트 작성'
    ],
    technicalConsiderations: [
      '인덱스 활용 확인',
      'N+1 쿼리 방지',
      '연결 풀 최적화',
      'k6 또는 Artillery로 부하 테스트'
    ],
    dependencies: {
      before: ['Test-01'],
      after: ['Test-06']
    },
    estimatedTime: '2일',
    labels: ['backend', 'performance', 'optimization', 'complexity: high', 'P1']
  },
  {
    id: 'Backend-21',
    title: '헬스 체크 및 모니터링 설정',
    phase: 'Phase 2 - Enhancement',
    description: '서버 상태 모니터링 및 헬스 체크 엔드포인트',
    completionCriteria: [
      '/health 엔드포인트 정상 작동',
      'DB 연결 실패 시 unhealthy 상태 반환',
      '메트릭 로그 정상 수집',
      '에러 발생 시 로그 기록'
    ],
    technicalConsiderations: [
      'GET /health 엔드포인트',
      'DB ping 테스트',
      '응답: { status: "ok|error", database: "connected|disconnected" }',
      'Winston 로거로 메트릭 기록'
    ],
    dependencies: {
      before: ['Backend-03'],
      after: ['Infra-05']
    },
    estimatedTime: '1일',
    labels: ['backend', 'monitoring', 'health-check', 'complexity: low', 'P1']
  },
  {
    id: 'Backend-22',
    title: 'API 문서화 (Swagger/OpenAPI)',
    phase: 'Phase 3 - Polish',
    description: 'Swagger UI를 통한 API 문서 자동 생성',
    completionCriteria: [
      '/api-docs에서 Swagger UI 접근 가능',
      '모든 API 엔드포인트 문서화',
      'Try it out 기능으로 API 테스트 가능',
      '요청/응답 예시 포함'
    ],
    technicalConsiderations: [
      'swagger-jsdoc, swagger-ui-express 사용',
      'JSDoc 주석으로 API 문서 작성',
      'OpenAPI 3.0 스펙 준수'
    ],
    dependencies: {
      before: ['모든 API 구현 완료'],
      after: []
    },
    estimatedTime: '2일',
    labels: ['backend', 'docs', 'api', 'complexity: medium', 'P2']
  },
  {
    id: 'Backend-23',
    title: '보안 강화',
    phase: 'Phase 3 - Polish',
    description: '프로덕션 환경을 위한 보안 강화',
    completionCriteria: [
      '보안 헤더 적용 확인',
      'Rate Limiting 동작 확인',
      'XSS 공격 방어 테스트',
      '보안 체크리스트 완료'
    ],
    technicalConsiderations: [
      'helmet 미들웨어로 보안 헤더 설정',
      'express-validator로 입력 sanitization',
      'HTTPS 강제 (프로덕션)',
      'Content-Security-Policy 헤더',
      'npm audit으로 의존성 취약점 점검'
    ],
    dependencies: {
      before: ['Backend-03'],
      after: []
    },
    estimatedTime: '2일',
    labels: ['backend', 'security', 'complexity: medium', 'P2']
  },

  // Frontend Tasks
  {
    id: 'Frontend-01',
    title: '프로젝트 초기 설정 및 환경 구성',
    phase: 'Phase 1 - MVP',
    description: 'React + TypeScript + Vite 기반 프로젝트 초기화',
    completionCriteria: [
      'npm run dev로 개발 서버 정상 실행',
      'ESLint, Prettier 검증 통과',
      'TypeScript 컴파일 에러 없음',
      '환경 변수 로드 확인',
      '폴더 구조 설정 완료'
    ],
    technicalConsiderations: [
      'React 18, TypeScript 5.x, Vite',
      '폴더 구조: src/{components, pages, hooks, services, types, utils, contexts}',
      'ESLint + Prettier 설정',
      '.env.development, .env.production'
    ],
    dependencies: {
      before: [],
      after: ['Frontend-02', 'Frontend-03']
    },
    estimatedTime: '0.5일',
    labels: ['frontend', 'setup', 'complexity: low', 'P0']
  },
  {
    id: 'Frontend-02',
    title: 'UI 라이브러리 및 핵심 의존성 설치',
    phase: 'Phase 1 - MVP',
    description: '프로젝트에 필요한 핵심 라이브러리 설치 및 설정',
    completionCriteria: [
      '선택한 UI 라이브러리 theme 적용 확인',
      '기본 컴포넌트 렌더링 테스트',
      '의존성 충돌 없음',
      '빌드 성공'
    ],
    technicalConsiderations: [
      'Material-UI (MUI) v5 또는 Tailwind CSS',
      'React Router v6',
      'Axios',
      'React Hook Form',
      'date-fns'
    ],
    dependencies: {
      before: ['Frontend-01'],
      after: ['Frontend-04', 'Frontend-06', 'Frontend-09', 'Frontend-10', 'Frontend-11']
    },
    estimatedTime: '0.5일',
    labels: ['frontend', 'setup', 'dependencies', 'complexity: low', 'P0']
  },
  {
    id: 'Frontend-03',
    title: 'TypeScript 타입 정의',
    phase: 'Phase 1 - MVP',
    description: 'API 응답 및 도메인 모델에 대한 TypeScript 타입 정의',
    completionCriteria: [
      '모든 타입이 PRD의 데이터 스키마와 일치',
      '컴파일 에러 없음',
      '타입 재사용성 확보'
    ],
    technicalConsiderations: [
      'User, Todo, PublicHoliday 타입 정의',
      'API 요청/응답 타입 정의',
      'src/types/index.ts에 중앙화'
    ],
    dependencies: {
      before: ['Frontend-01'],
      after: ['Frontend-04', 'Frontend-05']
    },
    estimatedTime: '0.5일',
    labels: ['frontend', 'types', 'typescript', 'complexity: low', 'P0']
  },
  {
    id: 'Frontend-04',
    title: 'Axios 인스턴스 및 API 서비스 기본 구조',
    phase: 'Phase 1 - MVP',
    description: 'Axios 설정, 인터셉터, 토큰 관리, 에러 처리 구현',
    completionCriteria: [
      'Authorization 헤더 자동 추가 확인',
      '401 에러 시 토큰 자동 갱신 로직 동작',
      'Refresh Token 만료 시 로그인 페이지 리다이렉트',
      '에러 응답 일관된 형태로 처리'
    ],
    technicalConsiderations: [
      'Axios 인스턴스 생성 (baseURL: /api)',
      'Request 인터셉터: Authorization 헤더 추가',
      'Response 인터셉터: 401 에러 처리, 토큰 갱신',
      'API 서비스 함수: authService, todoService, trashService, holidayService'
    ],
    dependencies: {
      before: ['Frontend-02', 'Frontend-03'],
      after: ['Frontend-05', 'Frontend-07', 'Frontend-08', 'Frontend-12', 'Frontend-14', 'Frontend-15', 'Frontend-16', 'Frontend-17', 'Frontend-18']
    },
    estimatedTime: '1일',
    labels: ['frontend', 'api', 'axios', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-05',
    title: '인증 Context 및 상태 관리',
    phase: 'Phase 1 - MVP',
    description: '전역 인증 상태 관리 (Context API + Hooks)',
    completionCriteria: [
      '로그인 시 사용자 정보 Context에 저장',
      '로그아웃 시 상태 초기화 및 토큰 삭제',
      '페이지 새로고침 시 토큰으로 자동 로그인',
      'useAuth Hook으로 어디서든 인증 상태 접근 가능'
    ],
    technicalConsiderations: [
      'AuthContext, AuthProvider 구현',
      'useAuth 커스텀 훅',
      'localStorage에 토큰 저장 (보안 고려)',
      '초기화 시 토큰 검증 및 자동 로그인'
    ],
    dependencies: {
      before: ['Frontend-03', 'Frontend-04'],
      after: ['Frontend-06', 'Frontend-08', 'Frontend-09', 'Frontend-19', 'Frontend-22']
    },
    estimatedTime: '1일',
    labels: ['frontend', 'authentication', 'state-management', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-06',
    title: 'React Router 설정 및 인증 라우팅',
    phase: 'Phase 1 - MVP',
    description: '라우팅 구조 설정 및 Protected Routes 구현',
    completionCriteria: [
      '미인증 사용자는 로그인 페이지로 리다이렉트',
      '인증된 사용자는 보호된 라우트 접근 가능',
      '로그인 후 의도한 페이지로 리다이렉트',
      '존재하지 않는 경로 시 404 페이지 표시'
    ],
    technicalConsiderations: [
      'React Router v6 사용',
      'ProtectedRoute 컴포넌트 구현',
      '라우트: /, /login, /register, /trash, /404',
      'useAuth로 인증 상태 확인'
    ],
    dependencies: {
      before: ['Frontend-02', 'Frontend-05'],
      after: ['Frontend-07', 'Frontend-08']
    },
    estimatedTime: '0.5일',
    labels: ['frontend', 'routing', 'authentication', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-07',
    title: '회원가입 페이지',
    phase: 'Phase 1 - MVP',
    description: '사용자 회원가입 화면 및 검증 로직 구현',
    completionCriteria: [
      'PRD의 검증 규칙 충족',
      '실시간 입력 검증 동작',
      '서버 에러 메시지 표시',
      '성공 시 로그인 페이지로 이동',
      '모바일 반응형 디자인'
    ],
    technicalConsiderations: [
      'React Hook Form 사용',
      '이메일, 비밀번호, 사용자명 검증 (PRD Section 8.1)',
      '비밀번호 표시/숨김 토글',
      '비밀번호 강도 표시기',
      'POST /api/auth/register 호출'
    ],
    dependencies: {
      before: ['Frontend-04', 'Frontend-06', 'Backend-05'],
      after: []
    },
    estimatedTime: '1.5일',
    labels: ['frontend', 'authentication', 'ui', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-08',
    title: '로그인 페이지',
    phase: 'Phase 1 - MVP',
    description: '사용자 로그인 화면 및 인증 처리 구현',
    completionCriteria: [
      '유효한 자격증명으로 로그인 성공',
      '잘못된 자격증명 시 에러 메시지 표시',
      '로그인 후 토큰 저장 및 사용자 정보 Context 업데이트',
      '로그인 후 의도한 페이지로 리다이렉트',
      '모바일 반응형 디자인'
    ],
    technicalConsiderations: [
      'React Hook Form 사용',
      '이메일, 비밀번호 입력',
      'POST /api/auth/login 호출',
      'accessToken, refreshToken 저장',
      'AuthContext 업데이트'
    ],
    dependencies: {
      before: ['Frontend-04', 'Frontend-05', 'Frontend-06', 'Backend-06'],
      after: ['Frontend-09']
    },
    estimatedTime: '1일',
    labels: ['frontend', 'authentication', 'ui', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-09',
    title: 'Layout 및 Navigation 컴포넌트',
    phase: 'Phase 1 - MVP',
    description: '애플리케이션 전역 레이아웃 및 네비게이션 구현',
    completionCriteria: [
      'Desktop: 사이드바 네비게이션 표시',
      'Mobile (< 768px): 하단 네비게이션 바 표시',
      '현재 페이지 활성화 표시',
      '로그아웃 버튼 클릭 시 인증 해제 및 로그인 페이지 이동',
      '접근성 기준 준수 (키보드 네비게이션)'
    ],
    technicalConsiderations: [
      'MainLayout 컴포넌트',
      'Sidebar, BottomNavigation 컴포넌트',
      '반응형 디자인 (< 768px: 하단 네비, >= 768px: 사이드바)',
      'useAuth로 사용자 정보 표시'
    ],
    dependencies: {
      before: ['Frontend-02', 'Frontend-05', 'Frontend-06'],
      after: ['Frontend-12', 'Frontend-16', 'Frontend-20', 'Frontend-22']
    },
    estimatedTime: '1.5일',
    labels: ['frontend', 'layout', 'navigation', 'ui', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-10',
    title: '공통 Form 컴포넌트',
    phase: 'Phase 1 - MVP',
    description: '재사용 가능한 폼 입력 컴포넌트 구현',
    completionCriteria: [
      '모든 컴포넌트가 React Hook Form과 호환',
      '에러 상태 시각적 표시',
      '접근성 레이블 (ARIA) 적용',
      '일관된 스타일링',
      'TypeScript 타입 안전성'
    ],
    technicalConsiderations: [
      'Input, Textarea, DatePicker 컴포넌트',
      'React Hook Form register, error 연동',
      'ARIA 레이블, 역할 속성'
    ],
    dependencies: {
      before: ['Frontend-02'],
      after: ['Frontend-14', 'Frontend-15']
    },
    estimatedTime: '1.5일',
    labels: ['frontend', 'components', 'forms', 'ui', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-11',
    title: 'Modal/Dialog 컴포넌트',
    phase: 'Phase 1 - MVP',
    description: '재사용 가능한 모달 및 다이얼로그 컴포넌트',
    completionCriteria: [
      'ESC 키로 모달 닫기',
      '백드롭 클릭 시 닫기',
      '모바일에서 풀스크린 모달 표시',
      '성공/에러 토스트 메시지 표시',
      '접근성 기준 준수 (포커스 트랩)'
    ],
    technicalConsiderations: [
      'Modal, Dialog, Toast 컴포넌트',
      '포커스 관리 (focus trap)',
      '모바일: 100vh 풀스크린',
      'react-hot-toast 또는 notistack 사용'
    ],
    dependencies: {
      before: ['Frontend-02'],
      after: ['Frontend-13', 'Frontend-14', 'Frontend-15', 'Frontend-17', 'Frontend-21']
    },
    estimatedTime: '1일',
    labels: ['frontend', 'components', 'modal', 'ui', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-12',
    title: '할일 목록 페이지 (Dashboard)',
    phase: 'Phase 1 - MVP',
    description: '할일 목록 조회 및 표시 화면 구현',
    completionCriteria: [
      '로그인한 사용자의 활성 할일만 표시',
      '날짜 필터 동작 확인',
      '정렬 옵션 동작 확인',
      '할일이 없을 때 빈 상태 표시',
      '200ms 이내 응답 (로딩 상태 처리)',
      '모바일 반응형 (단일 컬럼)'
    ],
    technicalConsiderations: [
      'GET /api/todos 호출',
      '날짜 필터: 오늘, 이번 주, 이번 달, 전체',
      '정렬: 종료일순, 생성일순',
      'Loading, Error, Empty 상태 처리',
      'Skeleton UI 또는 로딩 스피너'
    ],
    dependencies: {
      before: ['Frontend-04', 'Frontend-05', 'Frontend-09', 'Backend-11'],
      after: ['Frontend-13', 'Frontend-14', 'Frontend-18']
    },
    estimatedTime: '2일',
    labels: ['frontend', 'todo-crud', 'dashboard', 'ui', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-13',
    title: '할일 카드 컴포넌트 및 액션',
    phase: 'Phase 1 - MVP',
    description: '개별 할일 카드 UI 및 수정/삭제 기능 구현',
    completionCriteria: [
      '날짜가 종료일 기준으로 명확히 표시',
      '만료 임박 시 시각적 경고 표시',
      '삭제 버튼 클릭 시 휴지통으로 이동 (즉시)',
      '성공 토스트 표시',
      '목록 실시간 업데이트',
      '접근성 기준 준수'
    ],
    technicalConsiderations: [
      'TodoCard 컴포넌트',
      '수정 버튼 → Frontend-15 모달 열기',
      '삭제 버튼 → DELETE /api/todos/:id 호출',
      '만료 임박 로직: endDate - 현재 < 1일',
      '낙관적 UI 업데이트'
    ],
    dependencies: {
      before: ['Frontend-04', 'Frontend-11', 'Frontend-12', 'Backend-14'],
      after: ['Frontend-15']
    },
    estimatedTime: '1.5일',
    labels: ['frontend', 'todo-crud', 'components', 'ui', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-14',
    title: '할일 추가 모달',
    phase: 'Phase 1 - MVP',
    description: '새로운 할일 추가 기능 구현',
    completionCriteria: [
      'PRD의 검증 규칙 충족',
      '날짜 유효성 검증 동작',
      '성공 시 모달 닫힘 및 목록 업데이트',
      '성공 토스트 표시',
      '모바일에서 풀스크린 모달',
      '취소 시 입력 데이터 초기화'
    ],
    technicalConsiderations: [
      'React Hook Form 사용',
      '제목 (1-200자), 내용 (0-2000자), 시작일 (선택), 종료일 (필수)',
      'startDate <= endDate 검증',
      'POST /api/todos 호출',
      '모달 닫기 시 reset()'
    ],
    dependencies: {
      before: ['Frontend-04', 'Frontend-10', 'Frontend-11', 'Frontend-12', 'Backend-10'],
      after: ['Frontend-15']
    },
    estimatedTime: '2일',
    labels: ['frontend', 'todo-crud', 'modal', 'ui', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-15',
    title: '할일 수정 모달',
    phase: 'Phase 1 - MVP',
    description: '기존 할일 수정 기능 구현',
    completionCriteria: [
      '기존 할일 데이터가 폼에 로드됨',
      '모든 필드 수정 가능',
      '날짜 유효성 재검증',
      '성공 시 목록 실시간 업데이트',
      '성공 토스트 표시'
    ],
    technicalConsiderations: [
      'React Hook Form의 defaultValues 사용',
      'PUT /api/todos/:id 호출',
      '낙관적 UI 업데이트',
      '수정 전 데이터와 비교하여 변경사항만 전송 (선택)'
    ],
    dependencies: {
      before: ['Frontend-04', 'Frontend-14', 'Frontend-13', 'Backend-13'],
      after: []
    },
    estimatedTime: '1일',
    labels: ['frontend', 'todo-crud', 'modal', 'ui', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-16',
    title: '휴지통 페이지',
    phase: 'Phase 1 - MVP',
    description: '삭제된 할일 목록 조회 및 관리 화면 구현',
    completionCriteria: [
      '삭제일시 순으로 정렬 (최신순)',
      '복원/영구삭제 버튼 동작',
      '빈 상태 화면 표시',
      '로딩 상태 처리',
      '모바일 반응형'
    ],
    technicalConsiderations: [
      'GET /api/trash 호출',
      'TrashItem 컴포넌트',
      '복원 버튼 → POST /api/trash/:id/restore',
      '영구 삭제 버튼 → 확인 다이얼로그 → DELETE /api/trash/:id',
      '페이지네이션'
    ],
    dependencies: {
      before: ['Frontend-04', 'Frontend-09', 'Backend-15'],
      after: ['Frontend-17']
    },
    estimatedTime: '1.5일',
    labels: ['frontend', 'trash', 'ui', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-17',
    title: '복원 및 영구 삭제 기능',
    phase: 'Phase 1 - MVP',
    description: '휴지통 항목 복원 및 영구 삭제 구현',
    completionCriteria: [
      '복원 버튼 클릭 시 즉시 복원 (확인 없이)',
      '영구 삭제 시 확인 다이얼로그 표시',
      '확인 후 데이터베이스에서 완전 삭제',
      '성공 토스트 표시',
      '휴지통 목록 실시간 업데이트'
    ],
    technicalConsiderations: [
      '복원: POST /api/trash/:id/restore',
      '영구 삭제: 확인 다이얼로그 → DELETE /api/trash/:id',
      '낙관적 UI 업데이트',
      '에러 시 롤백'
    ],
    dependencies: {
      before: ['Frontend-04', 'Frontend-11', 'Frontend-16', 'Backend-16', 'Backend-17'],
      after: []
    },
    estimatedTime: '1일',
    labels: ['frontend', 'trash', 'ui', 'complexity: medium', 'P0']
  },
  {
    id: 'Frontend-18',
    title: '공휴일 통합 표시',
    phase: 'Phase 2 - Enhancement',
    description: '할일 목록에 공휴일 정보 통합 표시',
    completionCriteria: [
      '공휴일이 할일과 함께 날짜순으로 표시',
      '공휴일은 시각적으로 구분',
      '공휴일은 수정/삭제 불가',
      '연도별 공휴일 정보 로드'
    ],
    technicalConsiderations: [
      'GET /api/calendar 호출',
      'type="holiday"인 항목 별도 스타일링',
      'editable=false인 항목은 액션 버튼 숨김',
      '공휴일 아이콘/뱃지 표시'
    ],
    dependencies: {
      before: ['Frontend-04', 'Frontend-12', 'Backend-18'],
      after: []
    },
    estimatedTime: '1.5일',
    labels: ['frontend', 'holiday', 'calendar', 'ui', 'complexity: medium', 'P1']
  },
  {
    id: 'Frontend-19',
    title: '토큰 자동 갱신 개선',
    phase: 'Phase 2 - Enhancement',
    description: 'Refresh Token을 이용한 자동 토큰 갱신 로직 개선',
    completionCriteria: [
      'Access Token 만료 시 자동 갱신',
      '사용자는 갱신 과정을 인지하지 못함',
      'Refresh Token 만료 시에만 재로그인 요구',
      '동시 요청 시 토큰 갱신 중복 방지'
    ],
    technicalConsiderations: [
      'Axios 인터셉터에서 401 에러 처리',
      'POST /api/auth/refresh 호출',
      '새 Access Token으로 실패한 요청 재시도',
      '토큰 갱신 중 플래그로 중복 방지'
    ],
    dependencies: {
      before: ['Frontend-04', 'Frontend-05', 'Backend-08'],
      after: []
    },
    estimatedTime: '1.5일',
    labels: ['frontend', 'authentication', 'token-refresh', 'complexity: high', 'P1']
  },
  {
    id: 'Frontend-20',
    title: '반응형 디자인 최적화 (모바일)',
    phase: 'Phase 2 - Enhancement',
    description: '모바일 환경 최적화 및 터치 친화적 UI 구현',
    completionCriteria: [
      'Mobile (< 768px): 단일 컬럼, FAB, 하단 네비게이션',
      'Tablet (768-1024px): 2컬럼 레이아웃',
      'Desktop (> 1024px): 멀티 컬럼, 사이드바',
      '모든 인터랙티브 요소 터치 친화적',
      '모바일 브라우저 테스트 (iOS Safari, Android Chrome)'
    ],
    technicalConsiderations: [
      'CSS 미디어 쿼리: 768px, 1024px',
      'Floating Action Button (FAB) for Mobile',
      '터치 영역: 최소 44x44px',
      '스와이프 제스처 고려 (선택)'
    ],
    dependencies: {
      before: ['Frontend-09', '모든 프론트엔드 컴포넌트 완료'],
      after: []
    },
    estimatedTime: '2일',
    labels: ['frontend', 'responsive', 'mobile', 'ui', 'complexity: medium', 'P1']
  },
  {
    id: 'Frontend-21',
    title: '로딩 상태 및 에러 처리 개선',
    phase: 'Phase 2 - Enhancement',
    description: '사용자 경험 향상을 위한 로딩 및 에러 처리 개선',
    completionCriteria: [
      'API 호출 중 로딩 스피너 또는 Skeleton UI 표시',
      '네트워크 오류 시 사용자 친화적 메시지',
      '오프라인 시 배너 표시',
      '에러 발생 시 페이지 크래시 방지',
      '일시적 오류 시 재시도 버튼 제공'
    ],
    technicalConsiderations: [
      'React Suspense + Error Boundary',
      'react-query 또는 swr 고려 (선택)',
      'Skeleton UI 컴포넌트',
      'navigator.onLine으로 오프라인 감지',
      '재시도 로직'
    ],
    dependencies: {
      before: ['Frontend-04', 'Frontend-11'],
      after: []
    },
    estimatedTime: '1.5일',
    labels: ['frontend', 'error-handling', 'loading', 'ux', 'complexity: medium', 'P1']
  },
  {
    id: 'Frontend-22',
    title: '로그아웃 기능',
    phase: 'Phase 2 - Enhancement',
    description: '로그아웃 및 세션 종료 구현',
    completionCriteria: [
      '로그아웃 시 모든 토큰 삭제',
      'AuthContext 상태 초기화',
      '로그인 페이지로 이동',
      '로그아웃 후 보호된 페이지 접근 시 로그인 페이지로 리다이렉트'
    ],
    technicalConsiderations: [
      'POST /api/auth/logout 호출',
      'localStorage에서 토큰 삭제',
      'AuthContext.logout() 메서드',
      'navigate("/login")'
    ],
    dependencies: {
      before: ['Frontend-04', 'Frontend-05', 'Frontend-09', 'Backend-09'],
      after: []
    },
    estimatedTime: '0.5일',
    labels: ['frontend', 'authentication', 'logout', 'complexity: low', 'P1']
  },
  {
    id: 'Frontend-23',
    title: '애니메이션 및 전환 효과',
    phase: 'Phase 3 - Polish',
    description: '부드러운 사용자 경험을 위한 애니메이션 추가',
    completionCriteria: [
      '모든 애니메이션이 부드럽게 동작 (60fps)',
      '접근성 설정 존중 (prefers-reduced-motion)',
      '성능 저하 없음',
      '모바일에서도 원활한 애니메이션'
    ],
    technicalConsiderations: [
      'CSS transitions, animations',
      'framer-motion 또는 react-spring (선택)',
      '@media (prefers-reduced-motion: reduce)',
      'will-change 속성 최적화'
    ],
    dependencies: {
      before: ['모든 프론트엔드 컴포넌트 완료'],
      after: []
    },
    estimatedTime: '1.5일',
    labels: ['frontend', 'animation', 'ux', 'complexity: medium', 'P2']
  },
  {
    id: 'Frontend-24',
    title: '접근성 개선',
    phase: 'Phase 3 - Polish',
    description: 'WCAG AA 기준 접근성 준수',
    completionCriteria: [
      '모든 인터랙티브 요소 키보드 접근 가능',
      '스크린 리더로 모든 콘텐츠 읽기 가능',
      '색상 대비 WCAG AA 기준 충족',
      '포커스 순서 논리적',
      'axe DevTools 검증 통과'
    ],
    technicalConsiderations: [
      'ARIA 레이블, 역할, 속성',
      '시맨틱 HTML',
      '키보드 네비게이션 (Tab, Enter, Esc)',
      '색상 대비 최소 4.5:1',
      'axe-core 또는 pa11y로 자동 테스트'
    ],
    dependencies: {
      before: ['모든 프론트엔드 컴포넌트 완료'],
      after: []
    },
    estimatedTime: '2일',
    labels: ['frontend', 'accessibility', 'a11y', 'complexity: medium', 'P2']
  },
  {
    id: 'Frontend-25',
    title: '성능 최적화',
    phase: 'Phase 3 - Polish',
    description: '로딩 속도 및 렌더링 성능 최적화',
    completionCriteria: [
      'First Contentful Paint < 1.5초',
      'Time to Interactive < 3초',
      'Lighthouse 성능 점수 > 90',
      '번들 사이즈 최소화',
      '불필요한 재렌더링 최소화'
    ],
    technicalConsiderations: [
      'Code splitting (React.lazy, Suspense)',
      'Tree shaking',
      '이미지 최적화 (WebP, lazy loading)',
      'React.memo, useMemo, useCallback',
      'Vite 빌드 최적화'
    ],
    dependencies: {
      before: ['모든 프론트엔드 컴포넌트 완료'],
      after: ['Test-06']
    },
    estimatedTime: '2일',
    labels: ['frontend', 'performance', 'optimization', 'complexity: high', 'P2']
  },

  // Infrastructure Tasks
  {
    id: 'Infra-01',
    title: 'Docker 설정',
    phase: 'Phase 1 - MVP',
    description: '백엔드, 프론트엔드, 데이터베이스 Docker 컨테이너화',
    completionCriteria: [
      '백엔드 Dockerfile 작성 완료',
      '프론트엔드 Dockerfile 작성 완료',
      'docker-compose.yml 작성 완료',
      'docker-compose up으로 전체 스택 실행 성공',
      '컨테이너 간 네트워크 통신 확인'
    ],
    technicalConsiderations: [
      '멀티 스테이지 빌드로 이미지 크기 최소화',
      '.dockerignore 설정',
      'docker-compose: backend, frontend, postgres',
      '환경 변수 전달',
      '볼륨 마운트 (개발 환경)'
    ],
    dependencies: {
      before: ['Backend-01', 'Frontend-01', 'DB-02'],
      after: ['Infra-02']
    },
    estimatedTime: '2일',
    labels: ['infra', 'docker', 'deployment', 'complexity: medium', 'P0']
  },
  {
    id: 'Infra-02',
    title: 'CI/CD 파이프라인 설정',
    phase: 'Phase 1 - MVP',
    description: 'GitHub Actions를 통한 자동화된 테스트 및 빌드',
    completionCriteria: [
      'PR 생성 시 CI 파이프라인 실행',
      '백엔드 테스트 자동 실행',
      '프론트엔드 테스트 자동 실행',
      '커버리지 리포트 생성',
      'Docker 이미지 빌드 성공'
    ],
    technicalConsiderations: [
      'GitHub Actions workflow 파일',
      'jobs: lint, test, build',
      'test-backend, test-frontend 병렬 실행',
      'Docker 이미지 빌드 및 푸시 (GitHub Container Registry)',
      'codecov 또는 coveralls (선택)'
    ],
    dependencies: {
      before: ['Infra-01', 'Test-01', 'Test-03'],
      after: ['Infra-04']
    },
    estimatedTime: '2일',
    labels: ['infra', 'ci-cd', 'github-actions', 'complexity: medium', 'P0']
  },
  {
    id: 'Infra-03',
    title: '개발 환경 설정',
    phase: 'Phase 1 - MVP',
    description: '로컬 개발 환경 구축 및 문서화',
    completionCriteria: [
      'README.md에 설치 가이드 작성',
      '.env.example 파일 작성',
      '로컬 DB 설정 가이드 작성',
      '개발 서버 실행 가이드 작성'
    ],
    technicalConsiderations: [
      'README: Prerequisites, Installation, Running locally',
      '.env.example: 모든 환경 변수 예시',
      'database/schema.sql 실행 방법',
      'docker-compose up 사용법'
    ],
    dependencies: {
      before: ['Backend-01', 'Frontend-01', 'DB-01'],
      after: []
    },
    estimatedTime: '1일',
    labels: ['infra', 'docs', 'setup', 'complexity: low', 'P0']
  },
  {
    id: 'Infra-04',
    title: '프로덕션 배포 환경 설정',
    phase: 'Phase 1 - MVP',
    description: '프로덕션 환경 설정 및 배포',
    completionCriteria: [
      '프로덕션 도메인 설정',
      'HTTPS 인증서 설정',
      '환경 변수 보안 설정',
      '데이터베이스 프로덕션 인스턴스 설정',
      'Health check 엔드포인트 동작 확인'
    ],
    technicalConsiderations: [
      'AWS/Azure/GCP 또는 Railway/Vercel',
      'Let\'s Encrypt HTTPS 인증서',
      '환경 변수: Secrets Manager',
      'PostgreSQL 관리형 서비스',
      'GET /health 엔드포인트'
    ],
    dependencies: {
      before: ['Infra-02', '모든 P0 기능 완료'],
      after: ['Infra-05', 'Infra-06']
    },
    estimatedTime: '2일',
    labels: ['infra', 'deployment', 'production', 'complexity: high', 'P0']
  },
  {
    id: 'Infra-05',
    title: '로깅 및 모니터링 시스템',
    phase: 'Phase 2 - Enhancement',
    description: '애플리케이션 로그 수집 및 모니터링 대시보드 설정',
    completionCriteria: [
      '백엔드 로그 중앙 집중화',
      '에러 추적 시스템 설정',
      '성능 메트릭 수집',
      '알림 설정 (선택)'
    ],
    technicalConsiderations: [
      'Winston/Pino → CloudWatch/Stackdriver',
      'Sentry 또는 Rollbar로 에러 추적',
      '성능 메트릭: API 응답 시간, 에러율',
      'Prometheus + Grafana (선택)'
    ],
    dependencies: {
      before: ['Backend-21', 'Infra-04'],
      after: []
    },
    estimatedTime: '2일',
    labels: ['infra', 'monitoring', 'logging', 'complexity: medium', 'P1']
  },
  {
    id: 'Infra-06',
    title: '데이터베이스 백업 자동화',
    phase: 'Phase 2 - Enhancement',
    description: '프로덕션 데이터베이스 자동 백업 시스템 구축',
    completionCriteria: [
      '일일 자동 백업 실행',
      '백업 파일 30일 보관',
      '복구 절차 테스트 완료',
      '백업 실패 시 알림'
    ],
    technicalConsiderations: [
      'pg_dump 자동화 스크립트',
      'cron job 설정',
      'S3/GCS에 백업 파일 저장',
      '백업 파일 암호화',
      '복구 테스트 절차'
    ],
    dependencies: {
      before: ['DB-04', 'Infra-04'],
      after: []
    },
    estimatedTime: '1일',
    labels: ['infra', 'backup', 'database', 'complexity: medium', 'P1']
  },

  // Test Tasks
  {
    id: 'Test-01',
    title: '백엔드 통합 테스트',
    phase: 'Phase 1 - MVP',
    description: 'API 엔드포인트에 대한 포괄적인 통합 테스트',
    completionCriteria: [
      '모든 API 엔드포인트 테스트 커버',
      '정상 시나리오 및 에러 시나리오 포함',
      '테스트 커버리지 80% 이상',
      'CI 환경에서 테스트 통과'
    ],
    technicalConsiderations: [
      'Jest + Supertest',
      '테스트 DB 설정 (별도 인스턴스)',
      'beforeEach로 DB 초기화',
      'API 엔드포인트별 테스트 스위트'
    ],
    dependencies: {
      before: ['모든 백엔드 API 구현 완료'],
      after: ['Infra-02', 'Backend-20']
    },
    estimatedTime: '3일',
    labels: ['test', 'backend', 'integration', 'complexity: high', 'P0']
  },
  {
    id: 'Test-02',
    title: '백엔드 단위 테스트',
    phase: 'Phase 1 - MVP',
    description: '비즈니스 로직, 유틸리티 함수 단위 테스트',
    completionCriteria: [
      '모든 서비스 로직 테스트',
      '유틸리티 함수 테스트',
      '검증 로직 테스트',
      '테스트 커버리지 80% 이상'
    ],
    technicalConsiderations: [
      'Jest',
      'Mock 데이터베이스 (jest.mock)',
      '순수 함수 위주로 테스트',
      'bcrypt, JWT 유틸리티 테스트'
    ],
    dependencies: {
      before: ['Backend-03', 'Backend-04'],
      after: []
    },
    estimatedTime: '2일',
    labels: ['test', 'backend', 'unit', 'complexity: medium', 'P0']
  },
  {
    id: 'Test-03',
    title: '프론트엔드 컴포넌트 테스트',
    phase: 'Phase 1 - MVP',
    description: 'React 컴포넌트 및 Hook 테스트',
    completionCriteria: [
      '주요 컴포넌트 렌더링 테스트',
      '사용자 인터랙션 테스트',
      'Custom Hook 테스트',
      '테스트 커버리지 70% 이상'
    ],
    technicalConsiderations: [
      'Jest + React Testing Library',
      '컴포넌트 렌더링, 이벤트, 상태 변화 테스트',
      'Mock API 호출 (MSW)',
      'useAuth, useTodos 등 커스텀 훅 테스트'
    ],
    dependencies: {
      before: ['모든 프론트엔드 컴포넌트 완료'],
      after: ['Infra-02']
    },
    estimatedTime: '3일',
    labels: ['test', 'frontend', 'component', 'complexity: high', 'P0']
  },
  {
    id: 'Test-04',
    title: 'E2E 테스트',
    phase: 'Phase 1 - MVP',
    description: 'Playwright를 이용한 주요 사용자 플로우 E2E 테스트',
    completionCriteria: [
      '회원가입 → 로그인 플로우 테스트',
      '할일 추가 → 수정 → 삭제 → 복원 플로우 테스트',
      '영구 삭제 플로우 테스트',
      '크로스 브라우저 테스트 (Chrome, Firefox)'
    ],
    technicalConsiderations: [
      'Playwright',
      '테스트 환경: 로컬 또는 스테이징',
      '페이지 객체 모델 (POM)',
      'Chrome, Firefox, Webkit 테스트'
    ],
    dependencies: {
      before: ['모든 P0 기능 완료'],
      after: []
    },
    estimatedTime: '2일',
    labels: ['test', 'e2e', 'playwright', 'complexity: high', 'P0']
  },
  {
    id: 'Test-05',
    title: '크로스 브라우저 테스트',
    phase: 'Phase 2 - Enhancement',
    description: '주요 브라우저에서 호환성 테스트',
    completionCriteria: [
      'Chrome 최신 2버전 테스트',
      'Firefox 최신 2버전 테스트',
      'Safari 최신 2버전 테스트',
      'Edge 최신 2버전 테스트',
      '모바일 브라우저 테스트 (iOS Safari, Android Chrome)'
    ],
    technicalConsiderations: [
      'BrowserStack 또는 Sauce Labs',
      'Playwright cross-browser 테스트',
      '주요 기능 호환성 확인',
      'CSS, JavaScript 호환성'
    ],
    dependencies: {
      before: ['모든 P0 기능 완료'],
      after: []
    },
    estimatedTime: '2일',
    labels: ['test', 'cross-browser', 'compatibility', 'complexity: medium', 'P1']
  },
  {
    id: 'Test-06',
    title: '성능 테스트',
    phase: 'Phase 2 - Enhancement',
    description: '부하 테스트 및 성능 벤치마크',
    completionCriteria: [
      '동시 사용자 100명 처리 가능',
      'API 응답 시간 p95 < 200ms',
      '프론트엔드 Lighthouse 점수 > 90',
      '성능 리포트 작성'
    ],
    technicalConsiderations: [
      'k6 또는 Artillery로 부하 테스트',
      'Lighthouse CI',
      'API 응답 시간, 처리량, 에러율 측정',
      '프론트엔드 성능 메트릭: FCP, TTI, LCP'
    ],
    dependencies: {
      before: ['Backend-20', 'Frontend-25'],
      after: []
    },
    estimatedTime: '2일',
    labels: ['test', 'performance', 'load-testing', 'complexity: high', 'P1']
  },

  // Documentation Tasks
  {
    id: 'Doc-01',
    title: '사용자 가이드 작성',
    phase: 'Phase 3 - Polish',
    description: '최종 사용자를 위한 사용 설명서',
    completionCriteria: [
      '회원가입/로그인 가이드',
      '할일 관리 가이드',
      '휴지통 사용 가이드',
      'FAQ 작성'
    ],
    technicalConsiderations: [
      'Markdown 형식',
      '스크린샷 포함',
      '단계별 가이드',
      'docs/user-guide.md'
    ],
    dependencies: {
      before: ['모든 기능 완료'],
      after: []
    },
    estimatedTime: '1일',
    labels: ['docs', 'user-guide', 'complexity: low', 'P2']
  },
  {
    id: 'Doc-02',
    title: '개발자 문서 작성',
    phase: 'Phase 3 - Polish',
    description: '개발자를 위한 기술 문서',
    completionCriteria: [
      '아키텍처 문서 업데이트',
      'API 문서 최종 검토',
      '배포 가이드 작성',
      '트러블슈팅 가이드 작성'
    ],
    technicalConsiderations: [
      'Markdown 형식',
      '아키텍처 다이어그램',
      'API 엔드포인트 목록',
      'docs/developer-guide.md'
    ],
    dependencies: {
      before: ['모든 기능 완료'],
      after: []
    },
    estimatedTime: '2일',
    labels: ['docs', 'developer-guide', 'complexity: medium', 'P2']
  }
];

// Helper function to create GitHub issue
function createIssue(task) {
  const title = `[${task.phase}] ${task.id}: ${task.title}`;

  // Build completion criteria checklist
  const completionChecklist = task.completionCriteria
    .map(criterion => `- [ ] ${criterion}`)
    .join('\n');

  // Build technical considerations
  const technicalSection = task.technicalConsiderations && task.technicalConsiderations.length > 0
    ? `## 🔧 기술적 고려사항\n\n${task.technicalConsiderations.map(item => `- ${item}`).join('\n')}`
    : '';

  // Build dependencies
  const beforeDeps = task.dependencies.before.length > 0
    ? task.dependencies.before.map(dep => `- [ ] ${dep}`).join('\n')
    : '없음';

  const afterDeps = task.dependencies.after.length > 0
    ? task.dependencies.after.map(dep => `- ${dep}`).join('\n')
    : '없음';

  const body = `## 📋 작업 개요

${task.description}

## ✅ 완료 조건

${completionChecklist}

${technicalSection}

## 📦 의존성

**선행 작업:**
${beforeDeps}

**후행 작업:**
${afterDeps}

## ⏱️ 예상 소요 시간

${task.estimatedTime}
`;

  const labels = task.labels.join(',');

  if (DRY_RUN) {
    console.log(`\n[DRY RUN] Would create issue: ${title}`);
    console.log(`Labels: ${labels}`);
    console.log(`Body preview:\n${body.substring(0, 200)}...`);
    return { success: true, dryRun: true };
  }

  try {
    // Skip if already completed
    if (task.status === 'completed') {
      console.log(`⏭️  Skipping ${task.id} (already completed)`);
      return { success: true, skipped: true };
    }

    const command = `gh issue create --title "${title}" --body "${body.replace(/"/g, '\\"')}" --label "${labels}"`;
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Created issue: ${task.id}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to create issue ${task.id}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main execution
function main() {
  console.log('🚀 Starting GitHub Issues creation...\n');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;
  const errors = [];

  // Group tasks by phase
  const phases = {
    'Phase 1 - MVP': [],
    'Phase 2 - Enhancement': [],
    'Phase 3 - Polish': []
  };

  TASKS.forEach(task => {
    phases[task.phase].push(task);
  });

  // Create issues
  Object.entries(phases).forEach(([phase, tasks]) => {
    console.log(`\n📌 ${phase} (${tasks.length} tasks)\n`);

    tasks.forEach(task => {
      const result = createIssue(task);

      if (result.success && !result.dryRun && !result.skipped) {
        created++;
      } else if (result.skipped) {
        skipped++;
      } else if (!result.success) {
        failed++;
        errors.push({ task: task.id, error: result.error });
      }
    });
  });

  // Summary
  console.log('\n\n📊 Summary\n');
  console.log(`Total tasks: ${TASKS.length}`);
  console.log(`✅ Created: ${created}`);
  console.log(`⏭️  Skipped (completed): ${skipped}`);
  console.log(`❌ Failed: ${failed}`);

  // Breakdown by phase
  console.log('\n\n📈 Breakdown by Phase\n');
  Object.entries(phases).forEach(([phase, tasks]) => {
    console.log(`${phase}: ${tasks.length} tasks`);
  });

  // Breakdown by area
  console.log('\n\n🏷️  Breakdown by Area\n');
  const areas = {};
  TASKS.forEach(task => {
    const mainLabel = task.labels.find(l => !l.startsWith('complexity:') && !l.startsWith('P'));
    if (mainLabel) {
      areas[mainLabel] = (areas[mainLabel] || 0) + 1;
    }
  });
  Object.entries(areas).sort((a, b) => b[1] - a[1]).forEach(([area, count]) => {
    console.log(`${area}: ${count} tasks`);
  });

  // Errors
  if (errors.length > 0) {
    console.log('\n\n⚠️  Errors\n');
    errors.forEach(({ task, error }) => {
      console.log(`${task}: ${error}`);
    });
  }

  console.log('\n✨ Done!\n');
}

main();
