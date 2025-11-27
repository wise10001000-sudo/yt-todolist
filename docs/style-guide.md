# 스타일 가이드

## 개요
이 문서는 Todo List 애플리케이션의 UI/UX 디자인 가이드라인을 정의합니다.
네이버 캘린더의 디자인 시스템을 참조하여 일관되고 사용하기 편한 인터페이스를 구현합니다.

## 색상 팔레트

### Primary Colors
- **Primary Green**: `#00C73C` - 주요 액션 버튼, 브랜드 색상
- **Primary Dark**: `#00B235` - Primary 색상의 hover 상태

### Accent Colors
- **Blue**: `#5B5FED` - 선택된 항목, 강조 표시
- **Red**: `#FF5B5B` - 삭제, 경고, 중요 이벤트
- **Orange**: `#FF9500` - 알림, 보조 강조

### Neutral Colors
- **Gray 50**: `#F8F9FA` - 배경색
- **Gray 100**: `#F1F3F5` - 카드 배경, 구분선
- **Gray 200**: `#E9ECEF` - 비활성 요소
- **Gray 300**: `#DEE2E6` - 테두리
- **Gray 600**: `#868E96` - 보조 텍스트
- **Gray 900**: `#212529` - 주 텍스트

### Status Colors
- **Success**: `#00C73C` - 완료된 할일
- **Warning**: `#FF9500` - 임박한 마감
- **Error**: `#FF5B5B` - 기한 초과
- **Info**: `#5B5FED` - 정보 표시

## 타이포그래피

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR",
             "Malgun Gothic", sans-serif;
```

### Font Sizes
- **Heading 1**: 24px / 700 weight
- **Heading 2**: 20px / 700 weight
- **Heading 3**: 16px / 700 weight
- **Body**: 14px / 400 weight
- **Body Large**: 15px / 400 weight
- **Caption**: 12px / 400 weight
- **Small**: 11px / 400 weight

### Line Heights
- **Heading**: 1.4
- **Body**: 1.6
- **Compact**: 1.2

## 레이아웃

### Spacing Scale
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 20px;
--space-2xl: 24px;
--space-3xl: 32px;
```

### Container
- **Max Width**: 1200px
- **Padding**: 20px (mobile), 40px (desktop)

### Grid System
- **Columns**: 12
- **Gutter**: 16px
- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 컴포넌트

### Buttons

#### Primary Button
```css
background: #00C73C;
color: #FFFFFF;
padding: 10px 16px;
border-radius: 4px;
font-size: 14px;
font-weight: 500;
border: none;
cursor: pointer;
transition: background 0.2s;

&:hover {
  background: #00B235;
}

&:active {
  background: #009F2E;
}

&:disabled {
  background: #E9ECEF;
  color: #868E96;
  cursor: not-allowed;
}
```

#### Secondary Button
```css
background: #FFFFFF;
color: #212529;
padding: 10px 16px;
border: 1px solid #DEE2E6;
border-radius: 4px;
font-size: 14px;
font-weight: 500;
cursor: pointer;
transition: all 0.2s;

&:hover {
  border-color: #868E96;
  background: #F8F9FA;
}
```

#### Icon Button
```css
background: transparent;
border: none;
padding: 8px;
border-radius: 4px;
cursor: pointer;
color: #868E96;
transition: all 0.2s;

&:hover {
  background: #F1F3F5;
  color: #212529;
}
```

### Cards

#### Basic Card
```css
background: #FFFFFF;
border: 1px solid #E9ECEF;
border-radius: 8px;
padding: 16px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
transition: box-shadow 0.2s;

&:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

### Forms

#### Input Field
```css
background: #FFFFFF;
border: 1px solid #DEE2E6;
border-radius: 4px;
padding: 10px 12px;
font-size: 14px;
color: #212529;
width: 100%;
transition: border-color 0.2s;

&:focus {
  outline: none;
  border-color: #5B5FED;
  box-shadow: 0 0 0 3px rgba(91, 95, 237, 0.1);
}

&:disabled {
  background: #F1F3F5;
  color: #868E96;
  cursor: not-allowed;
}

&::placeholder {
  color: #868E96;
}
```

#### Checkbox
```css
width: 18px;
height: 18px;
border: 2px solid #DEE2E6;
border-radius: 3px;
cursor: pointer;
transition: all 0.2s;

&:checked {
  background: #00C73C;
  border-color: #00C73C;
}

&:hover {
  border-color: #868E96;
}
```

### Calendar Components

#### Calendar Header
```css
background: #FFFFFF;
border-bottom: 1px solid #E9ECEF;
padding: 16px 20px;
display: flex;
justify-content: space-between;
align-items: center;
```

#### Calendar Grid
```css
display: grid;
grid-template-columns: repeat(7, 1fr);
gap: 1px;
background: #E9ECEF;
```

#### Calendar Day Cell
```css
background: #FFFFFF;
min-height: 100px;
padding: 8px;
position: relative;
cursor: pointer;
transition: background 0.2s;

&:hover {
  background: #F8F9FA;
}

&.today {
  background: #FFF8F0;
}

&.selected {
  background: #F0F0FF;
}

&.other-month {
  color: #868E96;
}
```

#### Event Item (Todo Item in Calendar)
```css
background: #5B5FED;
color: #FFFFFF;
padding: 4px 8px;
border-radius: 4px;
font-size: 12px;
margin-bottom: 4px;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
cursor: pointer;

&.completed {
  background: #E9ECEF;
  color: #868E96;
  text-decoration: line-through;
}

&.high-priority {
  background: #FF5B5B;
}

&.medium-priority {
  background: #FF9500;
}

&.low-priority {
  background: #00C73C;
}
```

### Sidebar

#### Sidebar Container
```css
width: 240px;
background: #FFFFFF;
border-right: 1px solid #E9ECEF;
height: 100vh;
overflow-y: auto;
```

#### Sidebar Menu Item
```css
padding: 10px 16px;
cursor: pointer;
display: flex;
align-items: center;
gap: 8px;
color: #212529;
font-size: 14px;
transition: all 0.2s;

&:hover {
  background: #F8F9FA;
}

&.active {
  background: #F0F0FF;
  color: #5B5FED;
  font-weight: 500;
}
```

### Todo List

#### Todo Item
```css
background: #FFFFFF;
border: 1px solid #E9ECEF;
border-radius: 8px;
padding: 12px 16px;
margin-bottom: 8px;
display: flex;
align-items: center;
gap: 12px;
cursor: pointer;
transition: all 0.2s;

&:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-color: #5B5FED;
}

&.completed {
  opacity: 0.6;
}
```

#### Todo Checkbox
```css
flex-shrink: 0;
width: 20px;
height: 20px;
border: 2px solid #DEE2E6;
border-radius: 50%;
cursor: pointer;
transition: all 0.2s;

&:hover {
  border-color: #00C73C;
}

&.checked {
  background: #00C73C;
  border-color: #00C73C;
  position: relative;

  &::after {
    content: '✓';
    color: #FFFFFF;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
```

#### Todo Text
```css
flex: 1;
font-size: 14px;
color: #212529;

&.completed {
  text-decoration: line-through;
  color: #868E96;
}
```

## 애니메이션

### Transition Timing
```css
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;
```

### Common Animations

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

#### Slide In
```css
@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

#### Scale In
```css
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

## 반응형 디자인

### Mobile (< 768px)
- 사이드바를 드로어(drawer)로 변경
- 버튼 크기 증가 (최소 44px 터치 영역)
- 폰트 크기 조정
- 패딩/마진 축소
- 캘린더 그리드 축소 또는 주간 뷰로 전환

### Tablet (768px - 1024px)
- 사이드바 너비 조정 (200px)
- 그리드 레이아웃 조정
- 적절한 간격 유지

### Desktop (> 1024px)
- 전체 레이아웃 표시
- 사이드바 고정
- 넓은 캘린더 뷰
- 추가 정보 표시

## 접근성 (Accessibility)

### 키보드 네비게이션
- 모든 인터랙티브 요소는 Tab으로 접근 가능
- Enter/Space로 버튼 활성화
- Escape로 모달 닫기
- 화살표 키로 캘린더 네비게이션

### 스크린 리더
- 의미 있는 alt 텍스트
- aria-label 속성 사용
- 적절한 heading 구조
- role 속성 명시

### 색상 대비
- WCAG 2.1 AA 기준 준수
- 텍스트 대비율 최소 4.5:1
- 중요 정보는 색상 외 다른 방법으로도 표시

## 아이콘

### 아이콘 라이브러리
- Material Icons 또는 Heroicons 권장
- 일관된 스타일 유지
- 크기: 16px, 20px, 24px

### 사용 예시
- 추가: plus icon
- 삭제: trash icon
- 편집: pencil icon
- 체크: check icon
- 닫기: x icon
- 설정: gear icon
- 캘린더: calendar icon
- 리스트: list icon

## 다크 모드 (선택사항)

### 다크 모드 색상
- **Background**: `#1E1E1E`
- **Surface**: `#2D2D2D`
- **Primary Text**: `#E9ECEF`
- **Secondary Text**: `#868E96`
- **Border**: `#404040`

## 베스트 프랙티스

### 일관성
- 컴포넌트 간 일관된 스타일 유지
- 동일한 액션에는 동일한 UI 패턴 사용
- 색상 의미 일관성 (예: 빨강 = 삭제/경고)

### 성능
- 불필요한 애니메이션 지양
- 이미지 최적화
- CSS 번들 크기 최소화

### 사용성
- 명확한 피드백 제공
- 로딩 상태 표시
- 에러 메시지 명확하게 전달
- 충분한 터치 영역 확보

### 유지보수
- CSS 변수 활용
- 재사용 가능한 컴포넌트
- 명확한 네이밍 규칙
- 주석으로 복잡한 스타일 설명

## 구현 우선순위

### Phase 1: 기본 스타일
1. 색상 시스템 구축
2. 타이포그래피 설정
3. 기본 버튼/입력 필드
4. 레이아웃 그리드

### Phase 2: 컴포넌트
1. Todo 리스트 아이템
2. 사이드바 네비게이션
3. 모달/다이얼로그
4. 폼 요소

### Phase 3: 고급 기능
1. 캘린더 뷰
2. 애니메이션
3. 반응형 레이아웃
4. 다크 모드

## 참고 자료

- [Naver Calendar Design](https://calendar.naver.com)
- [Material Design Guidelines](https://material.io)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
