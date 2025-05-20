# NOTI

> **강의 영상, 실시간 스크립트, 노트 정리, 질문까지! 공부의 흐름을 그대로 담는 학습 보조 서비스**

> AI 기반 실시간 강의 필기 및 학습 관리 서비스

- [🌐 노티티 서비스 바로가기](https://notii.kr/)

## 📑 목차

1. [📋 프로젝트 소개](#-프로젝트-소개)
2. [🚀 주요 기능](#-주요-기능)
3. [🔬 주요 기술](#-주요-기술)
4. [🛠️ 기술 스택](#-기술-스택)
5. [📂 프로젝트 구조](#-프로젝트-구조)
6. [⚙️ 설치 및 실행 방법](#-설치-및-실행-방법)
7. [👨‍👩‍👧‍👦 팀원 정보](#-팀원-정보)
8. [📌 기타 정보](#-기타-정보)

---

## 📋 프로젝트 소개

**목표**: 온라인 강의 중 사용자들이 효율적으로 노트 필기를 하고, AI가 학습을 도와주는 기능을 제공하여 학습 효과를 극대화한다.

**핵심 가치**:
- 실시간 자동 필기와 요약
- 사용자 맞춤 학습 리듬 제공(대시보드)
- 강사-학생 간 피드백 순환 고도화

---

## 🚀 주요 기능

1. 실시간 강의 환경에서의 효율적인 노트 필기 지원
 - 블록 단위로 마크다운 기반의 유연한 노트 작성
 - 화면 캡처 및 즉시 자동 노트 임베딩 (단축키 지원)
 - OCR을 통한 캡처 이미지 내 텍스트 실시간 추출
 - Whisper-large-v3 모델을 활용한 정확도 높은 실시간 스크립트 제공
 - 노트 필기 시 타임스탬프 기록 및 빠른 시간 이동 기능 제공

2. GPT-4o 기반 AI 학습 보조 시스템
 - 강의 전체 및 구간별 AI 기반 자동 요약
 - GPT-4o를 활용한 노트 재구성 및 사용자 노트와 AI 정리본 비교·병합 지원
 - 학습 콘텐츠의 질적 향상 및 사용자 맞춤형 학습 자료 자동 생성 지원

3. MCP 기반 AI 챗봇 시스템
 - CS 및 AI 관련 실시간 지식 검색 및 질의응답 지원
 - 텍스트 드래그 시 즉시 챗봇 연동을 통한 빠른 지식 검색 지원

4. 데이터 기반 학습 분석 및 통계 제공
 - 챗봇 로그 기반 사용자 질문 키워드 분석을 통한 학습 난이도 및 관심 분야 분석
 - 구글 애널리틱스를 활용하여 사용자 활동 데이터를 정량화, 맞춤형 학습 분석 제공

5. 아카이브 및 콘텐츠 관리
 - 작성된 노트의 자유로운 편집 및 저장 지원
 - PDF 내보내기 및 Notion 페이지 자동 생성으로 편의성 극대화

6. 강사 전용 대시보드
 - 강의별 사용자 활동, 필기 통계 및 주요 키워드 추출 시각화 제공
 - 학생 피드백 및 참여도 분석을 통한 맞춤형 교육 지원

## 🔬 주요 기술

1. Blocknote.js 기반의 블록형 마크다운 에디터
 - 블록 기반의 유연한 편집 환경 제공
 - 다양한 마크다운 요소(코드 블록, 표, 체크박스 등)를 통한 구조화된 필기 가능
 - 콘텐츠의 자유로운 재배치 및 사용자 맞춤형 노트 관리 가능

2. Hugging Face Whisper-large-v3 오픈소스 모델을 활용한 실시간 STT
 - 외부 API 호출 없이 자체 서버(GPU 환경)에서 고정밀 실시간 STT 처리
 - Transformer 기반 음성 인식 모델로 잡음에 강하고 높은 인식 정확도 제공

3. OCR을 활용한 이미지 기반 자동 텍스트 추출 및 분류
 - 캡처한 이미지를 텍스트화하고 코드 및 일반 텍스트 자동 구분 및 분류
 - 추출된 결과를 블록 단위로 자동 임베딩하여 효율적이고 신속한 콘텐츠 작성 지원

4. GPT-4o 기반 AI 요약 및 필기 자동 정리 시스템
 - 최신 GPT-4o 모델로 정확하고 맥락에 맞는 요약 및 필기 재구성 제공
 - 사용자 작성 노트와 AI 기반 요약본 간의 비교 및 병합하여 완성도 높은 학습 자료 제공

5.  AI 챗봇 연계 시스템 구축
 - 실시간 지식 검색 및 질의응답 서비스 제공
 - 내부 지식 베이스와 외부 데이터의 실시간 검색 및 연동으로 응답의 정확도 및 최신성 확보

6. PDF 및 Notion API 연계를 통한 콘텐츠 배포 지원
 - 마크다운 기반 노트를 손쉽게 PDF 및 Notion 페이지로 변환 및 배포 가능
 - API 연동으로 사용자 필기의 활용도를 높이고 효율적인 자료 관리 환경 제공

---

## 🛠️ 기술 스택

### 💻 프론트엔드

![React](https://img.shields.io/badge/react-%230db7ed.svg?style=for-the-badge&logo=react&logoColor=white)![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white)![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220)![ky](https://img.shields.io/badge/axios-%23663399.svg?style=for-the-badge&logo=ky&logoColor=)![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)![Prettier](https://img.shields.io/badge/prettier-%23F7B93E.svg?style=for-the-badge&logo=prettier&logoColor=black)![Zustand](https://img.shields.io/badge/zustand-black.svg?style=for-the-badge&logo=zustand&logoColor=black)

### ⚙️ 백엔드

![Java](https://img.shields.io/badge/java-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)![SpringBoot](https://img.shields.io/badge/SpringBoot-6DB33F?style=for-the-badge&logo=Spring&logoColor=white)![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)![Gradle](https://img.shields.io/badge/Gradle-02303A.svg?style=for-the-badge&logo=Gradle&logoColor=white)![YAML](https://img.shields.io/badge/yaml-black.svg?style=for-the-badge&logo=yaml&logoColor=white)![NumPy](https://img.shields.io/badge/numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white)![ChatGPT](https://img.shields.io/badge/chatGPTAPI-74aa9c?style=for-the-badge&logo=openai&logoColor=white)

### 🗄️ 데이터베이스

![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)![Amazon S3](https://img.shields.io/badge/Amazon%20S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

### ☁️ 인프라

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)![Ubuntu](https://img.shields.io/badge/Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)![Docker](https://img.shields.io/badge/docker_compose-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)![Jenkins](https://img.shields.io/badge/jenkins-%232C5263.svg?style=for-the-badge&logo=jenkins&logoColor=white)![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)![Grafana](https://img.shields.io/badge/grafana-%23F46800.svg?style=for-the-badge&logo=grafana&logoColor=white)![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=Prometheus&logoColor=white)

### 👊 협업 툴

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)![GitLab](https://img.shields.io/badge/gitlab-%23181717.svg?style=for-the-badge&logo=gitlab&logoColor=white)![Jira](https://img.shields.io/badge/jira-%230A0FFF.svg?style=for-the-badge&logo=jira&logoColor=white)![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white)![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)![Mattermost](https://img.shields.io/badge/Mattermost-0285FF?style=for-the-badge&logo=Mattermost&logoColor=white)![Notion](https://img.shields.io/badge/Notion-%23000000.svg?style=for-the-badge&logo=notion&logoColor=white)![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)![KakaoTalk](https://img.shields.io/badge/kakaotalk-ffcd00.svg?style=for-the-badge&logo=kakaotalk&logoColor=000000)

### ✍️ IDE & 편집툴

![Vim](https://img.shields.io/badge/VIM-%2311AB00.svg?style=for-the-badge&logo=vim&logoColor=white)![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ_IDEA-000000.svg?style=for-the-badge&logo=intellij-idea&logoColor=white)![PyCharm](https://img.shields.io/badge/pycharm-143?style=for-the-badge&logo=pycharm&logoColor=black&color=black&labelColor=green)![ScreenToGif](https://img.shields.io/badge/Screen_To_Gif-black.svg?style=for-the-badge&logo=Screen-To-Gif&logoColor=white)

---

## 📂 프로젝트 구조

### 📦 프론트엔드

```
src
    ├─app
    │  ├─(dashboard)
    │  │  ├─bookmark
    │  │  ├─folders
    │  │  │  └─[folderId]
    │  │  ├─lecture-rooms
    │  │  │  └─[id]
    │  │  ├─notes
    │  │  └─recently-deleted
    │  ├─api
    │  │  ├─upload-file
    │  │  └─upload-image
    │  ├─auth
    │  │  └─callback
    │  ├─editor
    │  ├─fonts
    │  ├─notes
    │  │  ├─new
    │  │  └─[noteId]
    │  │      └─ai
    │  ├─signin
    │  ├─signup
    │  └─watch
    ├─components
    │  ├─ai
    │  ├─archive
    │  ├─auth
    │  ├─common
    │  │  ├─buttons
    │  │  ├─modals
    │  │  ├─searchInput
    │  │  └─sideItems
    │  ├─lecture
    │  │  ├─list
    │  │  ├─listItems
    │  │  ├─modals
    │  │  │  └─view
    │  │  ├─question
    │  │  └─sections
    │  ├─note
    │  │  └─editor
    │  ├─pages
    │  ├─panels
    │  ├─ui
    │  ├─user
    │  └─video
    ├─data
    ├─hooks
    │  ├─editor
    │  ├─file
    │  ├─lecture
    │  ├─lectureNotice
    │  ├─lectureQuestion
    │  ├─modal
    │  └─note
    ├─lib
    │  ├─editor
    │  ├─mock
    │  └─service
    ├─mockdata
    ├─providers
    ├─store
    ├─types
    └─util
```

### 🖥️ 백엔드

1. Spring Boot

```

└── main
    └── java
        └── com
            └── noti
                ├── adapter
                │   ├── analytics
                │   └── notion
                ├── domain
                │   ├── analytics
                │   ├── auth
                │   ├── feedback
                │   ├── file
                │   ├── folder
                │   ├── instructor
                │   ├── lecture
                │   ├── lectureroom
                │   ├── member
                │   ├── note
                │   ├── notice
                │   ├── openai
                │   ├── question
                │   └── youtube
                └── global
                    ├── config
                    ├── exception
                    ├── handler
                    └── model
```

2. FastAPI

```
폴더구조 넣어주세요요
```

### 🏗️ 아키텍처

![ERD_NOTI](erd_etc_img/시스템%20아키텍처_BDL.png)


### 📚 ERD

![architecture_NOTI](erd_etc_img/ERD_BDL.png)

---

## 👨‍👩‍👧‍👦 팀원 정보

| 🧑‍💻**이름** |         🏆**역할**          |  🚀**이메일주소**   |
| :--------: | :-------------------------: | :-----------------: |
| **서현석** |  프론트엔드 개발자 |   |
| **윤지원원** |      프론트엔드 개발자      |  |
| **허정은** | 프론트엔드 개발자  |  |
| **구현진** |    백엔드 개발자    |    |
| **김선주** |   팀장, 백엔드 개발자, 인프라  |   |
| **전승기** |        백엔드 개발자        | moda2047@naver.com  |
| **전용현** |        백엔드 개발자        |   |

---

## 🛠 담당 파트

### 서현석

- **프론트엔드 개발**
  

### 윤지원

- **프론트엔드 개발**
  

### 허정은

- **프론트엔드 개발**
  

### 구현진

- **백엔드 개발**
  

### 김선주

- **백엔드 개발**
  

### 전승기

- **백엔드 개발**
    - 폴더, 수강생 관리, 북마크 등 API 개발

- **인프라**
    - Grafana를 이용한 모니터링 대시보드
        - Prometheus, node-exporter를 이용한 ec2 매트릭 수집 및 모니터링
        - Promtail, Loki를 이용한 스프링부트 매트릭, 로그 수집 및 모니터링링
  

### 전용현

- **백엔드 개발**

---

## 기능 시연

### 홈

![home](gif/mainpage.gif)


---

## 📌 기타 정보

- **CI/CD:** GitLab, Jenkins를 활용한 자동화 배포
- **테스트 방법:** QA 문서 작성 후 페이지별 테스트 진행
