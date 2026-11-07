// 설문 문항과 번역. 순서: L(영어, 한국어, 중국어, 베트남어)
// type: single(하나 선택) · multi(여러 개, max로 제한) · scale(1~5) · text(서술형) · contact(이메일+인터뷰 동의)
// 선택지에 other: true 를 넣으면 "직접 입력" 칸이 생깁니다.
(function () {
  const L = (en, ko, zh, vi) => ({ en, ko, zh, vi });
  const o = (value, label, extra) => Object.assign({ value, label }, extra || {});

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
      time: L("About 5 minutes", "약 5분", "约5分钟", "Khoảng 5 phút"),
      anon: L("Anonymous unless you leave an email", "이메일을 남기지 않으면 익명", "除非留下邮箱，否则匿名", "Ẩn danh nếu không để lại email"),
      count: L("15 questions", "15개 문항", "15道题", "15 câu hỏi"),
      start: L("Start survey", "설문 시작", "开始答题", "Bắt đầu khảo sát"),
      required: L("Required", "필수", "必填", "Bắt buộc"),
      optional: L("Optional", "선택", "选填", "Không bắt buộc"),
      upTo: L("Choose up to {n}", "최대 {n}개 선택", "最多选{n}项", "Chọn tối đa {n}"),
      multi: L("Choose all that apply", "해당하는 것 모두 선택", "可多选", "Chọn tất cả phù hợp"),
      other: L("Please specify", "직접 입력", "请注明", "Vui lòng ghi rõ"),
      textPh: L("Type your answer", "답변을 입력하세요", "请输入您的回答", "Nhập câu trả lời"),
      submit: L("Submit answers", "답변 제출", "提交回答", "Gửi câu trả lời"),
      sending: L("Sending…", "보내는 중…", "提交中…", "Đang gửi…"),
      missing: L("Please answer the highlighted questions.", "표시된 질문에 답해 주세요.", "请回答标出的问题。", "Vui lòng trả lời các câu được đánh dấu."),
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
      emailPh: L("you@example.com", "you@example.com", "you@example.com", "you@example.com"),
      consent: L(
        "I agree to be contacted for a short follow-up interview (a gift card will be offered).",
        "짧은 후속 인터뷰 연락에 동의합니다 (기프트카드 제공).",
        "我同意接受简短的后续访谈联系（将提供礼品卡）。",
        "Tôi đồng ý được liên hệ phỏng vấn ngắn (có thẻ quà tặng)."
      ),
      demo: L("Demo mode: answers are saved only in this browser.", "데모 모드: 응답이 이 브라우저에만 저장됩니다.", "演示模式：回答仅保存在此浏览器中。", "Chế độ demo: câu trả lời chỉ lưu trên trình duyệt này.")
    },

    sections: [
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
              o("np", L("Nepal", "네팔", "尼泊尔", "Nepal")),
              o("west", L("USA / Europe", "미국·유럽", "美国/欧洲", "Mỹ / Châu Âu")),
              o("other", L("Other", "기타", "其他", "Khác"), { other: true })
            ]
          },
          {
            id: "degree", type: "single", required: true,
            label: L("What are you studying in Korea?", "어떤 과정에 재학 중인가요?", "您在韩国就读什么课程？", "Bạn đang học chương trình nào?"),
            options: [
              o("lang", L("Korean language program", "어학연수", "语学堂", "Khóa tiếng Hàn")),
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
          }
        ]
      },
      {
        id: "life",
        title: L("Life in Korea", "한국 생활", "在韩生活", "Cuộc sống tại Hàn"),
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
              o("other", L("Other", "기타", "其他", "Khác"), { other: true })
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
            id: "pain", type: "multi", max: 3, required: true,
            label: L("What has been hardest about living in Korea?", "한국 생활에서 가장 힘든 점은 무엇인가요?", "在韩国生活最困难的是什么？", "Điều khó khăn nhất khi sống ở Hàn là gì?"),
            options: [
              o("house", L("Finding housing / contracts", "집 구하기·계약", "找房/签合同", "Tìm nhà / hợp đồng")),
              o("job", L("Finding a part-time job", "아르바이트 구하기", "找兼职", "Tìm việc làm thêm")),
              o("visa", L("Visa & immigration paperwork", "비자·출입국 서류", "签证/出入境手续", "Visa & giấy tờ xuất nhập cảnh")),
              o("bank", L("Bank account, phone, ID card", "은행·휴대폰·외국인등록증", "银行卡/手机/外国人登录证", "Ngân hàng, điện thoại, thẻ cư trú")),
              o("health", L("Hospitals & health insurance", "병원·건강보험", "医院/医疗保险", "Bệnh viện & bảo hiểm y tế")),
              o("lang", L("Korean language in class", "수업에서의 한국어", "课堂上的韩语", "Tiếng Hàn trong lớp học")),
              o("friends", L("Making Korean friends", "한국인 친구 사귀기", "结交韩国朋友", "Kết bạn với người Hàn")),
              o("career", L("Jobs after graduation", "졸업 후 취업", "毕业后就业", "Việc làm sau tốt nghiệp")),
              o("info", L("Finding info in my language", "모국어로 된 정보 찾기", "找到母语信息", "Tìm thông tin bằng tiếng mẹ đẻ"))
            ]
          },
          {
            id: "satisfaction", type: "scale", required: true,
            label: L("Overall, how satisfied are you with life in Korea?", "한국 생활에 전반적으로 얼마나 만족하나요?", "总体来说，您对在韩生活满意吗？", "Nhìn chung, bạn hài lòng với cuộc sống ở Hàn thế nào?"),
            low: L("Very unsatisfied", "매우 불만족", "非常不满意", "Rất không hài lòng"),
            high: L("Very satisfied", "매우 만족", "非常满意", "Rất hài lòng")
          }
        ]
      },
      {
        id: "needs",
        title: L("What would help", "필요한 서비스", "需要的服务", "Điều gì sẽ giúp bạn"),
        questions: [
          {
            id: "channel", type: "multi", max: 3, required: true,
            label: L("Where do you usually get information about life in Korea?", "한국 생활 정보는 주로 어디서 얻나요?", "您通常从哪里获取在韩生活信息？", "Bạn thường tìm thông tin về cuộc sống ở Hàn ở đâu?"),
            options: [
              o("community", L("Messenger groups from my country (WeChat, Zalo…)", "자국민 메신저 단톡방 (위챗, 잘로 등)", "同胞群（微信、Zalo等）", "Nhóm chat người cùng nước (WeChat, Zalo…)")),
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
            id: "service", type: "multi", max: 3, required: true,
            label: L("Which services would you actually use?", "실제로 이용할 것 같은 서비스는?", "您真正会使用哪些服务？", "Bạn thực sự sẽ dùng dịch vụ nào?"),
            options: [
              o("house", L("Verified housing for foreigners", "외국인 전용 검증 매물", "面向外国人的认证房源", "Nhà ở đã xác minh cho người nước ngoài")),
              o("job", L("Visa-safe part-time jobs", "비자 규정에 맞는 아르바이트", "符合签证规定的兼职", "Việc làm thêm đúng quy định visa")),
              o("visa", L("Visa & document help", "비자·서류 대행/상담", "签证/文件代办咨询", "Hỗ trợ visa & giấy tờ")),
              o("tutor", L("Korean tutoring / TOPIK prep", "한국어 과외·TOPIK 대비", "韩语辅导/TOPIK备考", "Gia sư tiếng Hàn / luyện TOPIK")),
              o("career", L("Internships & job matching", "인턴십·취업 매칭", "实习/就业匹配", "Thực tập & tìm việc")),
              o("buddy", L("Korean buddy & social events", "한국인 버디·교류 모임", "韩国伙伴/交流活动", "Bạn đồng hành Hàn & sự kiện giao lưu")),
              o("health", L("Hospital booking & interpreting", "병원 예약·통역", "医院预约/翻译", "Đặt lịch & phiên dịch bệnh viện")),
              o("arrival", L("Airport pickup & move-in help", "공항 픽업·입주 도움", "接机/入住帮助", "Đón sân bay & hỗ trợ dọn vào"))
            ]
          },
          {
            id: "pay", type: "single", required: true,
            label: L("How much would you pay per month for a service that solves your biggest problem?", "가장 큰 불편을 해결해 주는 서비스에 월 얼마까지 낼 수 있나요?", "解决您最大困难的服务，您每月愿意支付多少？", "Bạn sẵn sàng trả bao nhiêu mỗi tháng cho dịch vụ giải quyết vấn đề lớn nhất?"),
            options: [
              o("0", L("Only if free", "무료일 때만", "仅限免费", "Chỉ khi miễn phí")),
              o("lt10", L("Under ₩10,000", "1만 원 미만", "1万韩元以下", "Dưới 10.000₩")),
              o("10_30", L("₩10,000 – 30,000", "1~3만 원", "1–3万韩元", "10.000 – 30.000₩")),
              o("30_50", L("₩30,000 – 50,000", "3~5만 원", "3–5万韩元", "30.000 – 50.000₩")),
              o("50p", L("Over ₩50,000", "5만 원 이상", "5万韩元以上", "Trên 50.000₩"))
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
          }
        ]
      },
      {
        id: "voice",
        title: L("In your words", "자유 의견", "您的意见", "Ý kiến của bạn"),
        questions: [
          {
            id: "story", type: "text", required: false,
            label: L(
              "Tell us about a recent moment in Korea when you needed help and couldn't find it.",
              "최근 한국에서 도움이 필요했는데 찾지 못했던 경험을 알려주세요.",
              "请分享最近在韩国需要帮助却找不到的经历。",
              "Hãy kể về một lần gần đây bạn cần giúp đỡ ở Hàn nhưng không tìm được."
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
