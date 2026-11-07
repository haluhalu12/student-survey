// 설문 문항과 번역. 순서: L(영어, 한국어, 중국어, 베트남어)
// type: single(하나 선택) · multi(여러 개, max로 제한) · scale(1~5) · text(서술형) · contact(이메일+인터뷰 동의)
// 선택지에 other: true 를 넣으면 "직접 입력" 칸이 생깁니다.
// ⚠ 설문을 배포한 뒤에는 문항 id와 선택지 value를 바꾸지 마세요(시트 열·집계가 어긋납니다).
//
// 설계 의도 (사업화 백데이터)
//  1. 기본 정보      → 고객 세그먼트 (누가)
//  2. 생활·소비      → 구매력·지출 구조 (얼마나 쓸 수 있나)
//  3. 가장 큰 문제    → 문제의 빈도 × 심각도 × 이미 쓰는 돈 = 기회 점수 (무엇을 풀까)
//  4. 서비스·가격    → 해결책 선호, 신뢰 요인, 가격 모델, 지불 의향, 획득 채널 (어떻게 팔까)
//  5. 자유 의견      → 인터뷰 대상자 확보 (초기 고객)
(function () {
  const L = (en, ko, zh, vi) => ({ en, ko, zh, vi });
  const o = (value, label, extra) => Object.assign({ value, label }, extra || {});
  const OTHER = () => o("other", L("Other", "기타", "其他", "Khác"), { other: true });

  // "힘든 점"과 "가장 큰 문제"가 같은 선택지를 쓰도록 한 곳에서 관리
  const PAIN = () => [
    o("house", L("Finding housing / signing a lease", "집 구하기·계약", "找房/签租房合同", "Tìm nhà / ký hợp đồng thuê")),
    o("job", L("Finding a part-time job", "아르바이트 구하기", "找兼职", "Tìm việc làm thêm")),
    o("visa", L("Visa & immigration paperwork", "비자·출입국 서류", "签证/出入境手续", "Visa & giấy tờ xuất nhập cảnh")),
    o("bank", L("Bank account, phone plan, ID card", "은행·휴대폰·외국인등록증", "银行卡/手机/外国人登录证", "Ngân hàng, điện thoại, thẻ cư trú")),
    o("remit", L("Sending / receiving money from home", "해외 송금·환전", "跨境汇款/换汇", "Chuyển / nhận tiền từ nước nhà")),
    o("health", L("Hospitals & health insurance", "병원·건강보험", "医院/医疗保险", "Bệnh viện & bảo hiểm y tế")),
    o("study", L("Keeping up with classes in Korean", "한국어 수업 따라가기", "跟上韩语授课", "Theo kịp bài giảng bằng tiếng Hàn")),
    o("friends", L("Making Korean friends / loneliness", "한국인 친구 사귀기·외로움", "结交韩国朋友/孤独感", "Kết bạn với người Hàn / cô đơn")),
    o("career", L("Getting a job or work visa after graduation", "졸업 후 취업·취업비자 전환", "毕业后就业/转工作签证", "Tìm việc / chuyển visa lao động sau tốt nghiệp")),
    o("info", L("Finding reliable info in my language", "모국어로 된 믿을 만한 정보 찾기", "找到可靠的母语信息", "Tìm thông tin tin cậy bằng tiếng mẹ đẻ")),
    OTHER()
  ];

  window.SURVEY = {
    languages: [
      { code: "en", name: "English" },
      { code: "ko", name: "한국어" },
      { code: "zh", name: "中文" },
      { code: "vi", name: "Tiếng Việt" }
    ],

    ui: {
      eyebrow: L("Research survey", "사전 조사 설문", "调研问卷", "Khảo sát"),
      title: L("Life in Korea as an international student", "외국인 유학생 한국 생활 조사", "在韩留学生生活调查", "Cuộc sống du học sinh tại Hàn Quốc"),
      intro: L(
        "We're finding out what international students in Korea need most. Your answers will shape a new service built for students like you.",
        "한국에 있는 외국인 유학생에게 가장 필요한 것이 무엇인지 조사하고 있어요. 답변은 유학생을 위한 새 서비스를 만드는 데 쓰입니다.",
        "我们正在了解在韩留学生最需要什么。您的回答将帮助我们打造专为留学生设计的新服务。",
        "Chúng tôi đang tìm hiểu điều du học sinh tại Hàn Quốc cần nhất. Câu trả lời của bạn sẽ giúp xây dựng một dịch vụ mới dành cho bạn."
      ),
      time: L("About 7 minutes", "약 7분", "约7分钟", "Khoảng 7 phút"),
      anon: L("Anonymous unless you leave an email", "이메일을 남기지 않으면 익명", "除非留下邮箱，否则匿名", "Ẩn danh nếu không để lại email"),
      count: L("{n} questions", "{n}개 문항", "{n}道题", "{n} câu hỏi"),
      start: L("Start survey", "설문 시작", "开始答题", "Bắt đầu khảo sát"),
      required: L("Required", "필수", "必填", "Bắt buộc"),
      optional: L("Optional", "선택", "选填", "Không bắt buộc"),
      upTo: L("Choose up to {n}", "최대 {n}개 선택", "最多选{n}项", "Chọn tối đa {n}"),
      multi: L("Choose all that apply", "해당하는 것 모두 선택", "可多选", "Chọn tất cả phù hợp"),
      other: L("Please specify…", "직접 입력…", "请注明…", "Vui lòng ghi rõ…"),
      textPh: L("Type your answer…", "답변을 입력하세요…", "请输入您的回答…", "Nhập câu trả lời…"),
      submit: L("Submit answers", "답변 제출", "提交回答", "Gửi câu trả lời"),
      sending: L("Sending…", "보내는 중…", "提交中…", "Đang gửi…"),
      missing: L("Choose an answer to continue.", "답을 고르면 다음으로 넘어갈 수 있어요.", "请选择一个答案后继续。", "Hãy chọn một câu trả lời để tiếp tục."),
      next: L("Next", "다음", "下一题", "Tiếp theo"),
      sectionDone: L("✓ {s} done", "✓ {s} 완료", "✓ {s} 完成", "✓ Xong: {s}"),
      back: L("Previous question", "이전 질문", "上一题", "Câu trước"),
      chooseLang: L("Choose your language", "언어를 선택하세요", "选择语言", "Chọn ngôn ngữ"),
      stepOf: L("{a} / {b}", "{a} / {b}", "{a} / {b}", "{a} / {b}"),
      resumeText: L(
        "You answered {a} of {b} questions. Pick up where you left off?",
        "{b}개 중 {a}개까지 답했어요. 이어서 할까요?",
        "您已回答 {b} 题中的 {a} 题。要继续吗？",
        "Bạn đã trả lời {a}/{b} câu. Tiếp tục từ chỗ dừng?"
      ),
      resume: L("Continue", "이어서 하기", "继续答题", "Tiếp tục"),
      restart: L("Start over", "처음부터", "重新开始", "Làm lại từ đầu"),
      share: L("Share with friends", "친구에게 공유", "分享给朋友", "Chia sẻ với bạn bè"),
      shareText: L(
        "A 7-minute survey for international students in Korea. Your answers help build a service for us.",
        "한국 유학생 대상 7분 설문이에요. 우리를 위한 서비스를 만드는 데 쓰인대요.",
        "面向在韩留学生的7分钟问卷，回答将用于打造留学生服务。",
        "Khảo sát 7 phút cho du học sinh tại Hàn. Câu trả lời giúp xây dựng dịch vụ cho chúng ta."
      ),
      copied: L("Link copied.", "링크를 복사했어요.", "链接已复制。", "Đã sao chép liên kết."),
      emailLabel: L("Email (optional)", "이메일 (선택)", "邮箱（选填）", "Email (không bắt buộc)"),
      error: L(
        "Your answers weren't sent. Check your internet connection and try again.",
        "답변을 보내지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.",
        "提交失败，请检查网络连接后重试。",
        "Chưa gửi được câu trả lời. Vui lòng kiểm tra kết nối mạng và thử lại."
      ),
      thanks: L("Thank you!", "감사합니다!", "谢谢！", "Cảm ơn bạn!"),
      thanksBody: L(
        "Your answers have been recorded. Feel free to share this survey with other international students.",
        "답변이 저장되었어요. 주변 유학생 친구에게도 설문을 공유해 주세요.",
        "您的回答已记录。欢迎分享给其他留学生朋友。",
        "Câu trả lời của bạn đã được ghi lại. Hãy chia sẻ khảo sát này với bạn bè du học sinh."
      ),
      again: L("Submit another response", "새 응답 작성", "再填一份", "Gửi câu trả lời khác"),
      progress: L("{a} of {b} answered", "{b}개 중 {a}개 응답", "已答 {a}/{b}", "Đã trả lời {a}/{b}"),
      emailPh: L("e.g. you@example.com", "예: you@example.com", "例：you@example.com", "vd. you@example.com"),
      consent: L(
        "I agree to be contacted for a short follow-up interview.",
        "짧은 후속 인터뷰 연락에 동의합니다.",
        "我同意接受简短的后续访谈联系。",
        "Tôi đồng ý được liên hệ để phỏng vấn ngắn."
      ),
      demo: L("Demo mode: answers are saved only in this browser.", "데모 모드: 응답이 이 브라우저에만 저장됩니다.", "演示模式：回答仅保存在此浏览器中。", "Chế độ demo: câu trả lời chỉ lưu trên trình duyệt này.")
    },

    sections: [
      /* ---------- 1. 기본 정보: 고객 세그먼트 ---------- */
      {
        id: "about",
        title: L("About you", "기본 정보", "基本信息", "Thông tin của bạn"),
        questions: [
          {
            id: "country", type: "single", required: true,
            label: L("Where are you from?", "국적이 어디인가요?", "您来自哪个国家？", "Bạn đến từ đâu?"),
            options: [
              o("cn", L("China", "중국", "中国", "Trung Quốc")),
              o("vn", L("Vietnam", "베트남", "越南", "Việt Nam")),
              o("uz", L("Uzbekistan", "우즈베키스탄", "乌兹别克斯坦", "Uzbekistan")),
              o("mn", L("Mongolia", "몽골", "蒙古", "Mông Cổ")),
              o("jp", L("Japan", "일본", "日本", "Nhật Bản")),
              o("mm", L("Myanmar", "미얀마", "缅甸", "Myanmar")),
              o("west", L("USA / Europe", "미국·유럽", "美国/欧洲", "Mỹ / Châu Âu")),
              OTHER()
            ]
          },
          {
            id: "age", type: "single", required: true,
            label: L("How old are you?", "나이가 어떻게 되나요?", "您的年龄是？", "Bạn bao nhiêu tuổi?"),
            options: [
              o("u20", L("Under 20", "20세 미만", "20岁以下", "Dưới 20")),
              o("20_24", L("20 – 24", "20~24세", "20–24岁", "20 – 24")),
              o("25_29", L("25 – 29", "25~29세", "25–29岁", "25 – 29")),
              o("30p", L("30 or older", "30세 이상", "30岁以上", "Từ 30 trở lên"))
            ]
          },
          {
            id: "degree", type: "single", required: true,
            label: L("What are you studying in Korea?", "어떤 과정에 재학 중인가요?", "您在韩国就读什么课程？", "Bạn đang học chương trình nào?"),
            options: [
              o("lang", L("Korean language program", "어학연수", "语学堂", "Khóa tiếng Hàn")),
              o("college", L("Junior / vocational college", "전문대", "专科大学", "Cao đẳng")),
              o("ug", L("Undergraduate", "학부", "本科", "Đại học")),
              o("ms", L("Master's", "석사", "硕士", "Thạc sĩ")),
              o("phd", L("PhD", "박사", "博士", "Tiến sĩ")),
              o("ex", L("Exchange student", "교환학생", "交换生", "Sinh viên trao đổi"))
            ]
          },
          {
            id: "region", type: "single", required: true,
            label: L("Where is your school?", "학교는 어느 지역에 있나요?", "您的学校在哪个地区？", "Trường của bạn ở đâu?"),
            options: [
              o("seoul", L("Seoul", "서울", "首尔", "Seoul")),
              o("gyeonggi", L("Gyeonggi / Incheon", "경기·인천", "京畿/仁川", "Gyeonggi / Incheon")),
              o("busan", L("Busan / Ulsan / Gyeongnam", "부산·울산·경남", "釜山/蔚山/庆南", "Busan / Ulsan / Gyeongnam")),
              o("daegu", L("Daegu / Gyeongbuk", "대구·경북", "大邱/庆北", "Daegu / Gyeongbuk")),
              o("chung", L("Daejeon / Chungcheong", "대전·충청", "大田/忠清", "Daejeon / Chungcheong")),
              o("jeolla", L("Gwangju / Jeolla", "광주·전라", "光州/全罗", "Gwangju / Jeolla")),
              o("etc", L("Gangwon / Jeju", "강원·제주", "江原/济州", "Gangwon / Jeju"))
            ]
          },
          {
            id: "stay", type: "single", required: true,
            label: L("How long have you lived in Korea?", "한국에 산 지 얼마나 되었나요?", "您在韩国生活多久了？", "Bạn đã sống ở Hàn bao lâu?"),
            options: [
              o("lt6m", L("Less than 6 months", "6개월 미만", "不到6个月", "Dưới 6 tháng")),
              o("6m1y", L("6 months – 1 year", "6개월~1년", "6个月–1年", "6 tháng – 1 năm")),
              o("1y2y", L("1 – 2 years", "1~2년", "1–2年", "1 – 2 năm")),
              o("2y4y", L("2 – 4 years", "2~4년", "2–4年", "2 – 4 năm")),
              o("4yp", L("More than 4 years", "4년 이상", "4年以上", "Trên 4 năm"))
            ]
          },
          {
            id: "korean", type: "single", required: true,
            label: L("How good is your Korean?", "한국어 실력은 어느 정도인가요?", "您的韩语水平如何？", "Tiếng Hàn của bạn ở mức nào?"),
            options: [
              o("none", L("Beginner (no TOPIK)", "입문 (TOPIK 없음)", "入门（无TOPIK）", "Mới bắt đầu (chưa có TOPIK)")),
              o("t12", L("Basic (TOPIK 1–2)", "초급 (TOPIK 1~2급)", "初级（TOPIK 1–2级）", "Sơ cấp (TOPIK 1–2)")),
              o("t34", L("Intermediate (TOPIK 3–4)", "중급 (TOPIK 3~4급)", "中级（TOPIK 3–4级）", "Trung cấp (TOPIK 3–4)")),
              o("t56", L("Advanced (TOPIK 5–6)", "고급 (TOPIK 5~6급)", "高级（TOPIK 5–6级）", "Cao cấp (TOPIK 5–6)"))
            ]
          },
          {
            id: "plan", type: "single", required: true,
            label: L("What do you plan to do after you finish your studies?", "학업을 마친 뒤 계획은 무엇인가요?", "学业结束后您有什么打算？", "Bạn dự định làm gì sau khi học xong?"),
            options: [
              o("work_kr", L("Work in Korea", "한국에서 취업", "在韩国就业", "Làm việc tại Hàn")),
              o("study_kr", L("Continue studying in Korea", "한국에서 진학", "在韩国继续深造", "Học tiếp tại Hàn")),
              o("home", L("Go back to my country", "본국으로 귀국", "回国", "Về nước")),
              o("third", L("Move to another country", "제3국으로 이동", "去其他国家", "Đến nước khác")),
              o("undecided", L("Not decided yet", "아직 모르겠음", "还没决定", "Chưa quyết định"))
            ]
          }
        ]
      },

      /* ---------- 2. 생활·소비: 구매력 ---------- */
      {
        id: "life",
        title: L("Life & spending", "생활·소비", "生活与消费", "Sinh hoạt & chi tiêu"),
        questions: [
          {
            id: "housing", type: "single", required: true,
            label: L("Where do you live now?", "현재 어디에 살고 있나요?", "您现在住在哪里？", "Hiện bạn đang ở đâu?"),
            options: [
              o("dorm", L("School dormitory", "학교 기숙사", "学校宿舍", "Ký túc xá")),
              o("oneroom", L("One-room / officetel", "원룸·오피스텔", "单间/公寓", "Phòng đơn / officetel")),
              o("goshiwon", L("Goshiwon", "고시원", "考试院", "Goshiwon")),
              o("share", L("Share house", "셰어하우스", "合租房", "Nhà ở ghép")),
              o("family", L("With family / relatives", "가족·친척 집", "与家人/亲戚同住", "Ở cùng gia đình / người thân")),
              OTHER()
            ]
          },
          {
            id: "spend", type: "single", required: true,
            label: L("Monthly living costs, not counting tuition?", "등록금을 제외한 한 달 생활비는?", "不含学费，每月生活费是多少？", "Chi phí sinh hoạt hằng tháng (không tính học phí)?"),
            options: [
              o("lt50", L("Under ₩500,000", "50만 원 미만", "50万韩元以下", "Dưới 500.000₩")),
              o("50_100", L("₩500,000 – 1,000,000", "50~100만 원", "50–100万韩元", "500.000 – 1.000.000₩")),
              o("100_150", L("₩1,000,000 – 1,500,000", "100~150만 원", "100–150万韩元", "1.000.000 – 1.500.000₩")),
              o("150_200", L("₩1,500,000 – 2,000,000", "150~200만 원", "150–200万韩元", "1.500.000 – 2.000.000₩")),
              o("200p", L("Over ₩2,000,000", "200만 원 이상", "200万韩元以上", "Trên 2.000.000₩"))
            ]
          },
          {
            id: "funding", type: "multi", max: 2, required: true,
            label: L("Where does most of your living money come from?", "생활비는 주로 어디서 마련하나요?", "您的生活费主要来自哪里？", "Tiền sinh hoạt của bạn chủ yếu đến từ đâu?"),
            options: [
              o("family", L("Family support", "가족 지원", "家人资助", "Gia đình hỗ trợ")),
              o("parttime", L("Part-time job in Korea", "한국에서 아르바이트", "在韩兼职", "Làm thêm tại Hàn")),
              o("scholar", L("Scholarship", "장학금", "奖学金", "Học bổng")),
              o("savings", L("My own savings", "본인 저축", "个人积蓄", "Tiền tiết kiệm của tôi")),
              o("loan", L("Loan", "대출", "贷款", "Khoản vay"))
            ]
          },
          {
            id: "work", type: "single", required: true,
            label: L("Do you work part-time now?", "현재 아르바이트를 하고 있나요?", "您现在做兼职吗？", "Hiện bạn có làm thêm không?"),
            options: [
              o("no", L("No, and I'm not looking", "안 함, 찾지도 않음", "没有，也不打算找", "Không, và không tìm")),
              o("looking", L("No, but I'm looking", "안 하지만 찾는 중", "没有，但正在找", "Không, nhưng đang tìm")),
              o("lt10", L("Yes, under 10 hours a week", "주 10시간 미만", "每周不到10小时", "Có, dưới 10 giờ/tuần")),
              o("10_20", L("Yes, 10 – 20 hours a week", "주 10~20시간", "每周10–20小时", "Có, 10 – 20 giờ/tuần")),
              o("20p", L("Yes, over 20 hours a week", "주 20시간 이상", "每周20小时以上", "Có, trên 20 giờ/tuần"))
            ]
          }
        ]
      },

      /* ---------- 3. 가장 큰 문제: 기회 점수 ---------- */
      {
        id: "problem",
        title: L("Your biggest problem", "가장 큰 문제", "最大的困难", "Khó khăn lớn nhất"),
        questions: [
          {
            id: "pain", type: "multi", max: 3, required: true,
            label: L("What has been hardest about living in Korea?", "한국 생활에서 힘든 점은 무엇인가요?", "在韩国生活有哪些困难？", "Những điều khó khăn khi sống ở Hàn là gì?"),
            options: PAIN()
          },
          {
            id: "pain_top", type: "single", required: true,
            label: L("Of these, which ONE is your biggest problem right now?", "그중 지금 가장 큰 문제 하나만 고른다면?", "其中，您目前最大的一个困难是？", "Trong số đó, vấn đề LỚN NHẤT hiện nay của bạn là gì?"),
            options: PAIN()
          },
          {
            id: "pain_freq", type: "single", required: true,
            label: L("How often do you run into this problem?", "그 문제를 얼마나 자주 겪나요?", "您多久遇到一次这个问题？", "Bạn gặp vấn đề này thường xuyên thế nào?"),
            options: [
              o("daily", L("Almost every day", "거의 매일", "几乎每天", "Gần như mỗi ngày")),
              o("weekly", L("Every week", "매주", "每周", "Mỗi tuần")),
              o("monthly", L("Every month", "매달", "每月", "Mỗi tháng")),
              o("semester", L("A few times a year (e.g. each semester)", "1년에 몇 번 (학기마다 등)", "一年几次（如每学期）", "Vài lần một năm (vd. mỗi học kỳ)")),
              o("once", L("Only once so far", "지금까지 한 번", "目前只有一次", "Mới một lần"))
            ]
          },
          {
            id: "pain_severity", type: "scale", required: true,
            label: L("How serious is this problem for you?", "그 문제는 얼마나 심각한가요?", "这个问题对您来说有多严重？", "Vấn đề này nghiêm trọng thế nào với bạn?"),
            low: L("A small annoyance", "조금 불편한 정도", "有点不便", "Hơi bất tiện"),
            high: L("Costs me a lot of money, time or stress", "돈·시간·스트레스가 크게 듦", "花费大量金钱、时间或压力", "Tốn rất nhiều tiền, thời gian hoặc căng thẳng")
          },
          {
            id: "solve_now", type: "multi", max: 3, required: true,
            label: L("How do you usually deal with it now?", "지금은 그 문제를 주로 어떻게 해결하나요?", "您现在通常如何解决这个问题？", "Hiện bạn thường giải quyết vấn đề này thế nào?"),
            options: [
              o("community", L("Ask in groups of students from my country", "자국 유학생 커뮤니티에 물어봄", "在同胞留学生群里问", "Hỏi trong nhóm du học sinh cùng nước")),
              o("friend", L("A Korean friend helps me", "한국인 친구가 도와줌", "韩国朋友帮忙", "Bạn người Hàn giúp")),
              o("school", L("School international office", "학교 국제처", "学校国际处", "Phòng quốc tế của trường")),
              o("self", L("Search online or ask AI myself", "인터넷·AI로 직접 검색", "自己上网搜索或问AI", "Tự tìm trên mạng hoặc hỏi AI")),
              o("paid", L("Pay an agency, broker or expert", "유료 업체·중개인·전문가 이용", "付费找中介或专业人士", "Trả tiền cho công ty / môi giới / chuyên gia")),
              o("public", L("Government / public support center", "정부·공공 지원센터", "政府/公共服务中心", "Trung tâm hỗ trợ của chính phủ")),
              o("endure", L("I just put up with it", "그냥 참고 지냄", "就忍着", "Chỉ chịu đựng")),
              OTHER()
            ]
          },
          {
            id: "spent", type: "single", required: true,
            label: L(
              "In the last 12 months, about how much did you pay to solve this problem (fees, agents, services)?",
              "지난 12개월 동안 그 문제를 해결하려고 쓴 돈은 대략 얼마인가요? (수수료·중개비·서비스 이용료 등)",
              "过去12个月，您为解决这个问题大约花了多少钱？（手续费、中介费、服务费等）",
              "Trong 12 tháng qua, bạn đã trả khoảng bao nhiêu để giải quyết vấn đề này (phí, môi giới, dịch vụ)?"
            ),
            options: [
              o("0", L("Nothing", "없음", "没有花钱", "Không tốn")),
              o("lt50k", L("Under ₩50,000", "5만 원 미만", "5万韩元以下", "Dưới 50.000₩")),
              o("50_200k", L("₩50,000 – 200,000", "5~20만 원", "5–20万韩元", "50.000 – 200.000₩")),
              o("200_500k", L("₩200,000 – 500,000", "20~50만 원", "20–50万韩元", "200.000 – 500.000₩")),
              o("500kp", L("Over ₩500,000", "50만 원 이상", "50万韩元以上", "Trên 500.000₩"))
            ]
          }
        ]
      },

      /* ---------- 4. 서비스·가격: 해결책, 가격, 채널 ---------- */
      {
        id: "solution",
        title: L("What would help", "필요한 서비스", "需要的服务", "Điều gì sẽ giúp bạn"),
        questions: [
          {
            id: "service", type: "multi", max: 3, required: true,
            label: L("Which services would you actually use?", "실제로 이용할 것 같은 서비스는?", "您真正会使用哪些服务？", "Bạn thực sự sẽ dùng dịch vụ nào?"),
            options: [
              o("house", L("Verified housing + lease help in my language", "검증된 매물 + 모국어 계약 지원", "认证房源 + 母语签约协助", "Nhà đã xác minh + hỗ trợ hợp đồng bằng tiếng mẹ đẻ")),
              o("job", L("Visa-safe part-time jobs", "비자 규정에 맞는 아르바이트 매칭", "符合签证规定的兼职匹配", "Việc làm thêm đúng quy định visa")),
              o("visa", L("Visa & document help", "비자·서류 대행/상담", "签证/文件代办咨询", "Hỗ trợ visa & giấy tờ")),
              o("remit", L("Cheaper money transfer / exchange", "저렴한 해외 송금·환전", "更便宜的汇款/换汇", "Chuyển tiền / đổi tiền rẻ hơn")),
              o("tutor", L("Korean tutoring / TOPIK prep", "한국어 과외·TOPIK 대비", "韩语辅导/TOPIK备考", "Gia sư tiếng Hàn / luyện TOPIK")),
              o("career", L("Internships & job matching (incl. work visa)", "인턴십·취업 매칭 (취업비자 포함)", "实习/就业匹配（含工作签证）", "Thực tập & tìm việc (gồm visa lao động)")),
              o("buddy", L("Korean buddy & social events", "한국인 버디·교류 모임", "韩国伙伴/交流活动", "Bạn đồng hành Hàn & sự kiện giao lưu")),
              o("health", L("Hospital booking & interpreting", "병원 예약·통역", "医院预约/翻译", "Đặt lịch & phiên dịch bệnh viện")),
              o("arrival", L("Arrival package (pickup, SIM, bank, ID card)", "입국 정착 패키지 (픽업·유심·은행·외국인등록)", "落地安家套餐（接机、电话卡、银行、登录证）", "Gói hỗ trợ khi đến (đón, SIM, ngân hàng, thẻ cư trú)")),
              o("market", L("Second-hand marketplace for students", "유학생 중고거래·물품 나눔", "留学生二手交易", "Chợ đồ cũ cho du học sinh")),
              o("qa", L("Q&A community with verified answers in my language", "모국어 Q&A 커뮤니티 (검증된 답변)", "母语问答社区（答案经过核实）", "Cộng đồng hỏi đáp bằng tiếng mẹ đẻ (câu trả lời đã xác minh)")),
              OTHER()
            ]
          },
          {
            id: "trust", type: "multi", max: 3, required: true,
            label: L("What would make you trust and choose a new service?", "새 서비스를 믿고 선택하게 만드는 것은?", "什么会让您信任并选择一个新服务？", "Điều gì khiến bạn tin và chọn một dịch vụ mới?"),
            options: [
              o("native", L("Support in my language", "모국어 지원", "母语服务", "Hỗ trợ bằng tiếng mẹ đẻ")),
              o("reviews", L("Reviews from students from my country", "같은 나라 유학생의 후기", "同胞留学生的评价", "Đánh giá của du học sinh cùng nước")),
              o("school", L("Partnership with my school", "학교와의 제휴", "与学校合作", "Hợp tác với trường của tôi")),
              o("price", L("Clear, upfront prices", "투명한 가격", "价格透明", "Giá rõ ràng, minh bạch")),
              o("fast", L("Fast replies (within 24 hours)", "빠른 응답 (24시간 이내)", "快速回复（24小时内）", "Phản hồi nhanh (trong 24 giờ)")),
              o("expert", L("Korean staff who know the rules", "규정을 잘 아는 한국인 담당자", "熟悉规定的韩国工作人员", "Nhân viên người Hàn hiểu rõ quy định")),
              o("refund", L("Refund if the problem isn't solved", "해결 못 하면 환불", "未解决可退款", "Hoàn tiền nếu không giải quyết được")),
              o("friend_rec", L("A friend recommends it", "친구의 추천", "朋友推荐", "Bạn bè giới thiệu"))
            ]
          },
          {
            id: "pay_model", type: "single", required: true,
            label: L("Which way of paying would you prefer?", "어떤 결제 방식이 가장 좋나요?", "您更喜欢哪种付费方式？", "Bạn thích hình thức thanh toán nào?"),
            options: [
              o("per_use", L("Pay each time I use it", "이용할 때마다 결제", "按次付费", "Trả mỗi lần sử dụng")),
              o("monthly", L("Monthly subscription for everything", "월 구독 (모든 서비스 이용)", "月度订阅（全部服务）", "Gói tháng (dùng mọi dịch vụ)")),
              o("ads", L("Free, with ads", "무료 + 광고", "免费 + 广告", "Miễn phí, có quảng cáo")),
              o("sponsor", L("Free to me, paid by school or employer", "학교·기업이 비용 부담 (나는 무료)", "学校或企业付费（我免费）", "Miễn phí cho tôi, trường hoặc công ty trả"))
            ]
          },
          {
            id: "pay", type: "single", required: true,
            label: L(
              "If a service fully solved your biggest problem, how much would you pay for it once?",
              "가장 큰 문제를 확실히 해결해 준다면, 한 번에 얼마까지 낼 수 있나요?",
              "如果某项服务能彻底解决您最大的困难，您单次最多愿意支付多少？",
              "Nếu một dịch vụ giải quyết triệt để vấn đề lớn nhất của bạn, bạn sẵn sàng trả bao nhiêu cho một lần?"
            ),
            options: [
              o("0", L("Only if free", "무료일 때만", "仅限免费", "Chỉ khi miễn phí")),
              o("lt10k", L("Under ₩10,000", "1만 원 미만", "1万韩元以下", "Dưới 10.000₩")),
              o("10_30k", L("₩10,000 – 30,000", "1~3만 원", "1–3万韩元", "10.000 – 30.000₩")),
              o("30_50k", L("₩30,000 – 50,000", "3~5만 원", "3–5万韩元", "30.000 – 50.000₩")),
              o("50_100k", L("₩50,000 – 100,000", "5~10만 원", "5–10万韩元", "50.000 – 100.000₩")),
              o("100kp", L("Over ₩100,000", "10만 원 이상", "10万韩元以上", "Trên 100.000₩"))
            ]
          },
          {
            id: "channel", type: "multi", max: 3, required: true,
            label: L("Where do you usually get information about life in Korea?", "한국 생활 정보는 주로 어디서 얻나요?", "您通常从哪里获取在韩生活信息？", "Bạn thường tìm thông tin về cuộc sống ở Hàn ở đâu?"),
            options: [
              o("community", L("Messenger groups from my country (WeChat, Zalo…)", "자국민 메신저 단톡방 (위챗, 잘로 등)", "同胞群（微信、Zalo等）", "Nhóm chat người cùng nước (WeChat, Zalo…)")),
              o("facebook", L("Facebook groups", "페이스북 그룹", "Facebook群组", "Nhóm Facebook")),
              o("office", L("School international office", "학교 국제처", "学校国际处", "Phòng quốc tế của trường")),
              o("sns", L("Instagram / TikTok", "인스타그램·틱톡", "Instagram/抖音", "Instagram / TikTok")),
              o("youtube", L("YouTube", "유튜브", "YouTube", "YouTube")),
              o("everytime", L("Everytime app", "에브리타임", "Everytime", "Everytime")),
              o("naver", L("Naver / Korean websites", "네이버·한국 사이트", "Naver/韩国网站", "Naver / web Hàn")),
              o("friends", L("Friends & seniors", "친구·선배", "朋友/学长学姐", "Bạn bè & tiền bối")),
              o("ai", L("ChatGPT or other AI", "ChatGPT 등 AI", "ChatGPT等AI", "ChatGPT hoặc AI khác"))
            ]
          },
          {
            id: "format", type: "single", required: true,
            label: L("How would you prefer to use such a service?", "이런 서비스를 어떤 방식으로 이용하고 싶나요?", "您希望通过什么方式使用这类服务？", "Bạn muốn dùng dịch vụ này qua hình thức nào?"),
            options: [
              o("web", L("Mobile website", "모바일 웹사이트", "手机网页", "Trang web di động")),
              o("app", L("Mobile app", "모바일 앱", "手机App", "Ứng dụng di động")),
              o("kakao", L("KakaoTalk channel", "카카오톡 채널", "KakaoTalk频道", "Kênh KakaoTalk")),
              o("messenger", L("My own messenger (WeChat, Zalo…)", "자국 메신저 (위챗, 잘로 등)", "本国通讯软件（微信、Zalo等）", "Ứng dụng nhắn tin của tôi (WeChat, Zalo…)")),
              o("offline", L("In person on campus", "캠퍼스 오프라인", "校园线下", "Trực tiếp tại trường"))
            ]
          },
          {
            id: "beta", type: "single", required: true,
            label: L(
              "If a service for your biggest problem launched in the next 3 months, would you try it?",
              "가장 큰 문제를 해결하는 서비스가 3개월 안에 나온다면 써 보겠어요?",
              "如果3个月内推出解决您最大困难的服务，您会试用吗？",
              "Nếu trong 3 tháng tới có dịch vụ giải quyết vấn đề lớn nhất của bạn, bạn có dùng thử không?"
            ),
            options: [
              o("yes", L("Definitely", "꼭 써 보겠다", "一定会", "Chắc chắn")),
              o("probably", L("Probably", "아마 써 볼 것 같다", "可能会", "Có thể")),
              o("unsure", L("Not sure", "잘 모르겠다", "不确定", "Chưa chắc")),
              o("no", L("No", "쓰지 않겠다", "不会", "Không"))
            ]
          }
        ]
      },

      /* ---------- 5. 자유 의견: 인터뷰 대상자 ---------- */
      {
        id: "voice",
        title: L("In your words", "자유 의견", "您的意见", "Ý kiến của bạn"),
        questions: [
          {
            id: "story", type: "text", required: false,
            label: L(
              "Tell us about a recent moment in Korea when you needed help and couldn't find it. What happened, and what did you do?",
              "최근 한국에서 도움이 필요했는데 찾지 못했던 경험을 알려주세요. 무슨 일이 있었고, 어떻게 했나요?",
              "请分享最近在韩国需要帮助却找不到的经历。发生了什么？您是怎么做的？",
              "Hãy kể về một lần gần đây bạn cần giúp đỡ ở Hàn nhưng không tìm được. Chuyện gì đã xảy ra và bạn đã làm gì?"
            )
          },
          {
            id: "wish", type: "text", required: false,
            label: L(
              "If one service could make your life in Korea easier starting tomorrow, what would it do?",
              "내일부터 한국 생활을 쉽게 해 줄 서비스가 딱 하나 생긴다면, 어떤 일을 해 주면 좋겠나요?",
              "如果明天起有一项服务能让您在韩生活更轻松，您希望它做什么？",
              "Nếu từ ngày mai có một dịch vụ giúp cuộc sống ở Hàn dễ dàng hơn, bạn muốn nó làm gì?"
            )
          },
          {
            id: "email", type: "contact", required: false,
            label: L("Email for a follow-up interview", "후속 인터뷰용 이메일", "后续访谈联系邮箱", "Email để phỏng vấn thêm")
          }
        ]
      }
    ]
  };
})();
