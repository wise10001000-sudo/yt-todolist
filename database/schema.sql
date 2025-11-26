-- ========================================
-- yt-todolist Database Schema
-- ========================================
-- Description: PostgreSQL 16 database schema for yt-todolist application
-- Author: Development Team
-- Created: 2025-11-26
-- Version: 1.0
-- ========================================

-- ========================================
-- 0. Database Setup (Optional)
-- ========================================
-- Uncomment the following lines if you need to create the database
-- CREATE DATABASE yt_todolist
--   WITH
--   OWNER = postgres
--   ENCODING = 'UTF8'
--   LC_COLLATE = 'en_US.UTF-8'
--   LC_CTYPE = 'en_US.UTF-8'
--   TABLESPACE = pg_default
--   CONNECTION LIMIT = -1;

-- Connect to database
-- \c yt_todolist;

-- ========================================
-- 1. Extensions
-- ========================================
-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable additional statistics for query monitoring (optional)
-- CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ========================================
-- 2. Drop Existing Objects (Development Only)
-- ========================================
-- WARNING: Uncomment only in development environments
-- This will delete all data!

-- DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP TABLE IF EXISTS refresh_tokens CASCADE;
-- DROP TABLE IF EXISTS public_holidays CASCADE;
-- DROP TABLE IF EXISTS todos CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ========================================
-- 3. Table Definitions
-- ========================================

-- ----------------------------------------
-- 3.1 users (사용자 테이블)
-- ----------------------------------------
-- 사용자 계정 정보를 저장하는 테이블
CREATE TABLE users (
  -- 기본 키
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 인증 정보
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,

  -- 사용자 정보
  username VARCHAR(100) NOT NULL,

  -- 타임스탬프
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP,

  -- 제약조건
  CONSTRAINT chk_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 테이블 코멘트
COMMENT ON TABLE users IS '사용자 계정 정보';
COMMENT ON COLUMN users.id IS '사용자 고유 식별자';
COMMENT ON COLUMN users.email IS '이메일 (로그인 ID)';
COMMENT ON COLUMN users.password_hash IS 'bcrypt 해시된 비밀번호 (salt rounds: 10)';
COMMENT ON COLUMN users.username IS '사용자명 (2-50자)';
COMMENT ON COLUMN users.created_at IS '가입일시';
COMMENT ON COLUMN users.last_login_at IS '최종 로그인 일시';

-- ----------------------------------------
-- 3.2 todos (할일 테이블)
-- ----------------------------------------
-- 사용자별 할일 정보를 저장하는 테이블
CREATE TABLE todos (
  -- 기본 키
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 외래 키
  user_id UUID NOT NULL,

  -- 할일 정보
  title VARCHAR(200) NOT NULL,
  content TEXT,

  -- 일정 정보
  start_date TIMESTAMP,
  end_date TIMESTAMP NOT NULL,

  -- 상태 정보
  status VARCHAR(20) NOT NULL DEFAULT 'active',

  -- 타임스탬프
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,

  -- 제약조건
  CONSTRAINT chk_todos_status
    CHECK (status IN ('active', 'trash')),
  CONSTRAINT chk_date_order
    CHECK (start_date IS NULL OR start_date <= end_date),

  -- 외래 키 제약조건
  CONSTRAINT fk_todos_user_id
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- 테이블 코멘트
COMMENT ON TABLE todos IS '사용자별 할일 정보';
COMMENT ON COLUMN todos.id IS '할일 고유 식별자';
COMMENT ON COLUMN todos.user_id IS '소유자 (users.id 참조)';
COMMENT ON COLUMN todos.title IS '할일 제목 (최대 200자)';
COMMENT ON COLUMN todos.content IS '할일 내용 (최대 2000자)';
COMMENT ON COLUMN todos.start_date IS '시작일시 (선택사항)';
COMMENT ON COLUMN todos.end_date IS '종료일시 (필수)';
COMMENT ON COLUMN todos.status IS '상태 (active: 활성, trash: 휴지통)';
COMMENT ON COLUMN todos.created_at IS '생성일시';
COMMENT ON COLUMN todos.updated_at IS '수정일시 (자동 갱신)';
COMMENT ON COLUMN todos.deleted_at IS '삭제일시 (휴지통 이동 시 기록)';

-- ----------------------------------------
-- 3.3 public_holidays (공휴일 테이블)
-- ----------------------------------------
-- 대한민국 공휴일 정보를 저장하는 테이블 (모든 사용자 공유)
CREATE TABLE public_holidays (
  -- 기본 키
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 공휴일 정보
  title VARCHAR(200) NOT NULL,
  holiday_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,

  -- 타임스탬프
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 제약조건
  CONSTRAINT chk_holiday_type
    CHECK (type IN ('national', 'memorial'))
);

-- 테이블 코멘트
COMMENT ON TABLE public_holidays IS '대한민국 공휴일 정보 (모든 사용자 공유)';
COMMENT ON COLUMN public_holidays.id IS '공휴일 고유 식별자';
COMMENT ON COLUMN public_holidays.title IS '공휴일 명칭 (예: 설날, 추석)';
COMMENT ON COLUMN public_holidays.holiday_date IS '공휴일 날짜';
COMMENT ON COLUMN public_holidays.type IS '유형 (national: 국경일, memorial: 기념일)';
COMMENT ON COLUMN public_holidays.is_recurring IS '매년 반복 여부 (true: 양력, false: 음력)';
COMMENT ON COLUMN public_holidays.created_at IS '생성일시';

-- ----------------------------------------
-- 3.4 refresh_tokens (리프레시 토큰 테이블)
-- ----------------------------------------
-- JWT Refresh Token을 관리하는 테이블
CREATE TABLE refresh_tokens (
  -- 기본 키
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 외래 키
  user_id UUID NOT NULL,

  -- 토큰 정보
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,

  -- 타임스탬프
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- 제약조건
  CONSTRAINT chk_expires_future
    CHECK (expires_at > created_at),

  -- 외래 키 제약조건
  CONSTRAINT fk_refresh_tokens_user_id
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- 테이블 코멘트
COMMENT ON TABLE refresh_tokens IS 'JWT Refresh Token 관리';
COMMENT ON COLUMN refresh_tokens.id IS '토큰 고유 식별자';
COMMENT ON COLUMN refresh_tokens.user_id IS '사용자 (users.id 참조)';
COMMENT ON COLUMN refresh_tokens.token IS '리프레시 토큰 값 (JWT)';
COMMENT ON COLUMN refresh_tokens.expires_at IS '만료일시 (생성 시각 + 7일)';
COMMENT ON COLUMN refresh_tokens.created_at IS '생성일시';

-- ========================================
-- 4. Indexes
-- ========================================

-- ----------------------------------------
-- 4.1 users 테이블 인덱스
-- ----------------------------------------
-- 로그인 시 이메일로 사용자 빠른 조회
CREATE INDEX idx_users_email ON users(email);

-- ----------------------------------------
-- 4.2 todos 테이블 인덱스
-- ----------------------------------------
-- 사용자별 할일 목록 조회
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- active/trash 필터링
CREATE INDEX idx_todos_status ON todos(status);

-- 날짜 범위 조회 및 정렬
CREATE INDEX idx_todos_end_date ON todos(end_date);

-- 휴지통 항목 조회 (부분 인덱스)
CREATE INDEX idx_todos_deleted_at ON todos(deleted_at)
  WHERE status = 'trash';

-- 사용자별 활성 할일 조회 최적화 (복합 인덱스)
CREATE INDEX idx_todos_user_status ON todos(user_id, status);

-- ----------------------------------------
-- 4.3 public_holidays 테이블 인덱스
-- ----------------------------------------
-- 날짜 범위 조회
CREATE INDEX idx_holidays_date ON public_holidays(holiday_date);

-- 유형별 필터링
CREATE INDEX idx_holidays_type ON public_holidays(type);

-- ----------------------------------------
-- 4.4 refresh_tokens 테이블 인덱스
-- ----------------------------------------
-- 사용자별 토큰 조회
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- 토큰 검증 (이미 UNIQUE 제약조건으로 자동 생성되지만 명시적 표현)
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- 만료 토큰 정리
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ========================================
-- 5. Functions
-- ========================================

-- ----------------------------------------
-- 5.1 updated_at 자동 갱신 함수
-- ----------------------------------------
-- todos 테이블의 updated_at 컬럼을 UPDATE 시 자동으로 현재 시각으로 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'updated_at 컬럼을 현재 시각으로 자동 갱신';

-- ========================================
-- 6. Triggers
-- ========================================

-- ----------------------------------------
-- 6.1 todos.updated_at 자동 갱신 트리거
-- ----------------------------------------
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TRIGGER update_todos_updated_at ON todos IS 'UPDATE 시 updated_at 자동 갱신';

-- ========================================
-- 7. Initial Data (Optional)
-- ========================================

-- ----------------------------------------
-- 7.1 공휴일 샘플 데이터
-- ----------------------------------------
-- 2025년 대한민국 공휴일 데이터
-- Uncomment to insert sample holiday data
/*
INSERT INTO public_holidays (title, holiday_date, type, is_recurring) VALUES
  ('신정', '2025-01-01', 'national', true),
  ('설날', '2025-01-29', 'national', true),
  ('삼일절', '2025-03-01', 'national', true),
  ('어린이날', '2025-05-05', 'national', true),
  ('현충일', '2025-06-06', 'memorial', true),
  ('광복절', '2025-08-15', 'national', true),
  ('추석', '2025-10-06', 'national', false),
  ('개천절', '2025-10-03', 'national', true),
  ('한글날', '2025-10-09', 'national', true),
  ('크리스마스', '2025-12-25', 'national', true);
*/

-- ========================================
-- 8. Database Users and Permissions
-- ========================================

-- ----------------------------------------
-- 8.1 애플리케이션 전용 사용자 생성 (Optional)
-- ----------------------------------------
-- Uncomment to create application user with limited privileges
/*
-- 애플리케이션 전용 사용자 생성
CREATE USER app_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';

-- 필요한 권한만 부여
GRANT CONNECT ON DATABASE yt_todolist TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

-- 테이블별 권한 설정
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON todos TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON refresh_tokens TO app_user;
GRANT SELECT ON public_holidays TO app_user;

-- 시퀀스 권한 (UUID 사용 시 불필요하지만 참고용)
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- 스키마 변경 권한은 부여하지 않음 (보안)
*/

-- ========================================
-- 9. Verification Queries
-- ========================================

-- ----------------------------------------
-- 9.1 스키마 확인 쿼리
-- ----------------------------------------
-- Uncomment to verify the schema after creation

-- 모든 테이블 확인
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;

-- 모든 인덱스 확인
-- SELECT tablename, indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- 모든 트리거 확인
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- ORDER BY event_object_table, trigger_name;

-- 모든 제약조건 확인
-- SELECT conname, contype, conrelid::regclass AS table_name
-- FROM pg_constraint
-- WHERE connamespace = 'public'::regnamespace
-- ORDER BY conrelid::regclass::text, conname;

-- ========================================
-- 10. Performance Monitoring Queries
-- ========================================

-- ----------------------------------------
-- 10.1 성능 모니터링 쿼리 (Optional)
-- ----------------------------------------
-- Uncomment to check database performance

-- 인덱스 사용률 확인
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as index_scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan ASC;

-- 테이블 크기 확인
-- SELECT
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ========================================
-- 11. Cleanup Functions (Optional)
-- ========================================

-- ----------------------------------------
-- 11.1 만료된 토큰 정리 함수
-- ----------------------------------------
-- 주기적으로 실행하여 만료된 리프레시 토큰 삭제
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM refresh_tokens
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_tokens() IS '만료된 리프레시 토큰 정리 (주기적 실행 권장)';

-- 사용 예시: SELECT cleanup_expired_tokens();

-- ========================================
-- Schema Creation Complete
-- ========================================
-- Next Steps:
-- 1. Review the schema
-- 2. Uncomment initial data if needed
-- 3. Run verification queries
-- 4. Set up application user and permissions
-- 5. Configure backup strategy
-- ========================================
