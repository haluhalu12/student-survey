# 외국인 유학생 사전 조사 웹

| 파일 | 역할 |
|---|---|
| `index.html` | 학생용 설문 (PC·모바일, 영어/한국어/중국어/베트남어) |
| `admin.html` | 운영자용 실시간 결과 대시보드 |
| `js/questions.js` | **문항·번역 수정은 여기서** |
| `js/config.js` | Apps Script 주소 입력 |
| `apps-script/Code.gs` | Google Sheets 저장용 서버 코드 |
| `PLAN.md` | 기획서 · 아키텍처 |

## 1. 바로 테스트 (데모 모드)
`index.html`을 브라우저로 열어 설문을 제출한 뒤 `admin.html`을 열면 결과가 보입니다.
데모 모드에서는 응답이 **그 브라우저에만** 저장되므로 테스트용으로만 쓰세요.

## 2. Google Sheets 연결 (실제 운영, 약 10분)
1. Google Sheets에서 새 스프레드시트 만들기 (이름 예: `유학생 설문 응답`)
2. 메뉴 **확장 프로그램 → Apps Script** → 기본 코드를 지우고 `apps-script/Code.gs` 내용 붙여넣기 → 저장
3. 왼쪽 **⚙ 프로젝트 설정 → 스크립트 속성 → 속성 추가**
   - 속성: `ADMIN_KEY` / 값: 대시보드 비밀번호 (추측하기 어려운 값으로)
4. 오른쪽 위 **배포 → 새 배포 → 유형: 웹 앱**
   - 실행 사용자: **나** / 액세스 권한: **모든 사용자**
   - 권한 승인 → 나오는 **웹 앱 URL** 복사 (`https://script.google.com/macros/s/.../exec`)
5. `js/config.js`의 `ENDPOINT: ""` 안에 URL 붙여넣기
6. `admin.html`을 열고 ADMIN_KEY 입력 → 실시간 대시보드 확인

> 응답은 스프레드시트의 `responses` 시트에도 한 줄씩 쌓이므로 시트를 직접 열어 봐도 됩니다.
> `Code.gs`를 수정했다면 **배포 → 배포 관리 → 수정 → 새 버전**으로 다시 배포해야 반영됩니다.

## 3. GitHub Pages로 배포 (무료)
1. GitHub에서 새 저장소 만들기 (예: `student-survey`, Public)
2. 이 폴더의 파일을 전부 업로드 (**Add file → Upload files**)
3. 저장소 **Settings → Pages → Branch: main / root → Save**
4. 1~2분 뒤 주소가 생깁니다.
   - 설문: `https://<아이디>.github.io/student-survey/`
   - 대시보드: `https://<아이디>.github.io/student-survey/admin.html`
5. 설문 주소로 QR 코드를 만들어 포스터나 단톡방에 배포

## 4. 문항 바꾸기
`js/questions.js`에서 `L("영어", "한국어", "중국어", "베트남어")` 형식으로 수정합니다.
- 질문 `id`를 바꾸면 시트에 새 열이 생깁니다. **설문 배포 후에는 id를 바꾸지 마세요.**
- `required: false`면 선택 문항, `max: 3`이면 최대 3개 선택
