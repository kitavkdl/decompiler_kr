export type Lang = "ko" | "en";

export const translations = {
  hero: {
    subtitle: { ko: "SUNY Korea // 보안 연구 동아리", en: "SUNY Korea // Security Research Club" },
    tagline1: { ko: "Break the Code,", en: "Break the Code," },
    tagline2: { ko: "Build the Future", en: "Build the Future" },
    scroll: { ko: "스크롤하여 탐색", en: "Scroll to Explore" },
  },
  about: {
    cmd: { ko: "> about.init()", en: "> about.init()" },
    title1: { ko: "우리는 ", en: "We " },
    titleHighlight1: { ko: "해체", en: "Deconstruct" },
    titleMid: { ko: "하고", en: " and" },
    titleHighlight2: { ko: "재구성", en: "Rebuild" },
    titleEnd: { ko: "합니다", en: "" },
    desc: {
      ko: "Decompiler는 SUNY Korea 최대 규모의 정보보안/개발 동아리입니다. 웹개발, 보안, 네트워크뿐만 아니라 세부적인 코딩 문제들까지 함께 공부하며 전반적인 컴퓨팅 지식을 쌓습니다. 뿐만 아니라 관련 지식이 전무한 학생들도 다양하게 협력하고 활동하며 즐거움을 찾습니다.",
      en: "Decompiler is the largest cybersecurity & development club at SUNY Korea. We study web development, security, networking, and various coding challenges together to build comprehensive computing knowledge. Students with no prior experience are also welcome to collaborate and have fun.",
    },
  },
  activities: {
    cmd: { ko: "> modules.list()", en: "> modules.list()" },
    title: { ko: "활동 영역", en: "Activities" },
    desc: {
      ko: "보안에만 국한되지 않습니다. 개발, AI, 해커톤 주최, 자격증 스터디부터 MT, 회식까지 — 다양한 활동이 여러분을 기다립니다.",
      en: "Not limited to security. From development, AI, hosting hackathons, certification studies to trips and dinners — a variety of activities await you.",
    },
    badge: {
      ko: "모든 활동은 자유 참여 : 원하는 것만, 몇 개든 OK",
      en: "All activities are voluntary : pick what you want, as many as you like",
    },
    cards: [
      {
        title: { ko: "Security", en: "Security" },
        subtitle: { ko: "보안 연구", en: "Security Research" },
        items: {
          ko: ["웹 해킹 & 시스템 해킹", "리버스 엔지니어링", "CTF 대회 참가 지원", "Google Cybersecurity Certificate"],
          en: ["Web & System Hacking", "Reverse Engineering", "CTF Competition Support", "Google Cybersecurity Certificate"],
        },
      },
      {
        title: { ko: "Development", en: "Development" },
        subtitle: { ko: "개발 스터디", en: "Dev Study" },
        items: {
          ko: ["웹 개발 (React, Node.js, etc..)", "Python / Java 코딩 스터디", "AI & 머신러닝 프로젝트", "SBU Seek-Once Project"],
          en: ["Web Dev (React, Node.js, etc..)", "Python / Java Coding Study", "AI & Machine Learning Projects", "SBU Seek-Once Project"],
        },
      },
      {
        title: { ko: "Community", en: "Community" },
        subtitle: { ko: "커뮤니티", en: "Community" },
        items: {
          ko: ["MT (여행)", "학기초 & 시험 후 회식", "외부 연사 초청 강연", "엔드 세미나 & 네트워킹"],
          en: ["MT (Trips)", "Semester & Post-Exam Dinners", "Guest Speaker Lectures", "End Seminar & Networking"],
        },
      },
      {
        title: { ko: "Professional", en: "Professional" },
        subtitle: { ko: "전문 활동", en: "Professional" },
        items: {
          ko: ["SUNY Korea 최초 아이디어톤 개최", "외부 기관 협력 프로젝트", "실생활 보안연구 및 제언", "외부기업 탐방 및 투어"],
          en: ["First-ever SUNY Korea Ideathon", "External Collaboration Projects", "Real-world Security Research", "Company Visits & Tours"],
        },
      },
    ],
  },
  gallery: {
    cmd: { ko: "> gallery.render()", en: "> gallery.render()" },
    title: { ko: "우리의 ", en: "Our " },
    titleHighlight: { ko: "순간들", en: "Moments" },
    photos: [
      { title: { ko: "End Semester Seminar", en: "End Semester Seminar" }, desc: { ko: "학기말 세미나 & 네트워킹", en: "End-of-semester seminar & networking" } },
      { title: { ko: "2025 Ideathon", en: "2025 Ideathon" }, desc: { ko: "SUNY Korea 최초 아이디어톤 개최", en: "First-ever SUNY Korea Ideathon" } },
      { title: { ko: "Group Study", en: "Group Study" }, desc: { ko: "함께 배우고 성장하는 그룹 스터디", en: "Learning and growing together" } },
    ],
  },
  network: {
    cmd: { ko: "> network.status()", en: "> network.status()" },
    title1: { ko: "커뮤니티 & ", en: "Community & " },
    titleHighlight: { ko: "네트워크", en: "Network" },
    titleEnd: { ko: "", en: "" },
    pillarsLabel: { ko: "핵심 영역", en: "Core Pillars" },
    desc: {
      ko: "Decompiler는 SUNY Korea를 넘어 고려대학교, 중앙대학교, 경희대학교 등 34개 이상의 대학 보안 동아리 연합과 함께하며, 10명 이상의 교수진 및 외부 전문가와의 멘토링, 연 10회 이상의 행사로 활발한 네트워크를 이어가고 있습니다.",
      en: "Beyond SUNY Korea, Decompiler connects with 34+ university security clubs including Korea, Chung-Ang, and Kyung Hee Universities, with mentorship from 10+ faculty and external experts and 10+ events every year.",
    },
  },
  join: {
    cmd: { ko: "> recruit.apply()", en: "> recruit.apply()" },
    title1: { ko: "함께 ", en: "Ready to " },
    titleHighlight: { ko: "활동", en: "Join" },
    titleEnd: { ko: "할", en: "" },
    title2: { ko: "준비가 되셨나요?", en: "Us?" },
    desc: { ko: "코딩을 몰라도 괜찮습니다.\n열정만 있다면 누구나 환영합니다.", en: "No coding experience needed.\nEveryone with passion is welcome." },
    cta: { ko: "지원하기 →", en: "Apply Now →" },
  },
  langToggle: { ko: "EN", en: "한" },
} as const;
