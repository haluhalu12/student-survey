// 설정 파일 — 여기만 수정하면 됩니다.
window.SURVEY_CONFIG = {
  // Google Apps Script 웹 앱 URL (README의 "Google Sheets 연결" 참고)
  // 비워두면 데모 모드: 응답이 이 브라우저에만 저장됩니다.
  ENDPOINT: "https://script.google.com/macros/s/AKfycbzhp5psR1KxBmajZClzAlyzO2YcPDfT-24ajl_5p8uykRarfIaBqWyiCHRRO2Ov0QrJ/exec",

  // 계절 배경 효과: "auto" = 날짜에 맞춰 자동 (봄 3~5월 벚꽃잎 · 여름 6~8월 수국 꽃잎 · 가을 9~11월 낙엽 · 겨울 12~2월 눈)
  //   계절 고정: "spring" | "summer" | "autumn" | "winter" · 끄기: "off"
  //   미리 보기: 설문 주소 뒤에 ?season=winter 처럼 붙이기
  SEASON_FX: "auto",

  // 관리자 대시보드 자동 갱신 주기(초)
  REFRESH_SECONDS: 15
};
