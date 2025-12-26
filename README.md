# 📱 Todo & Calendar Mobile App

React Native 기반의 **Todo + Calendar 모바일 애플리케이션**입니다.  
웹 버전과 동일한 Firebase 프로젝트를 사용하여,  
같은 `todos` 컬렉션과 사용자 데이터를 공유하도록 구현했습니다.  

Android 에뮬레이터(또는 실제 기기)에서 실행되며,  
Firebase Authentication(익명 로그인) + Cloud Firestore 연동을 포함합니다.


## ✨ Feature

- 🔐 **Authentication**
  - Firebase Authentication 기반 **익명 로그인 / 로그아웃**
  - 로그인 상태를 실시간으로 감시하여 화면 전환

- 📅 **Calendar & Todo (모바일용)**
  - 캘린더에서 날짜 선택
  - 선택한 날짜 기준으로 Todo 추가
  - 선택한 날짜의 Todo 목록 표시
  - Todo 완료 상태 토글(미완료 ↔ 완료), 삭제 기능

- 🔗 **Firebase 연동**
  - 웹 앱과 **동일한 Firestore `todos` 컬렉션** 사용
  - `title`, `dueDate("YYYY-MM-DD")`, `isCompleted`, `createdAt` 필드 구조 공유


## 🛠 Tech Stack

- **Mobile**: React Native (React Native CLI)
- **Backend Service**: Firebase Authentication, Cloud Firestore  
  - `@react-native-firebase/app`
  - `@react-native-firebase/auth`
  - `@react-native-firebase/firestore`
- **UI**: React Native 기본 컴포넌트, `react-native-calendars`


## 🚀 Getting Started

### 1. Installation
``` bash
git clone <REPO_URL>
cd <project-folder> # 예: todo_mobile
npm install
```
Android 개발 환경(ADB, Android Studio, 에뮬레이터)은  
React Native 공식 문서 환경 설정을 기준으로 구성했습니다.


### 2. Firebase 설정

같은 Firebase 프로젝트를 웹/모바일에서 공유합니다.

1. Firebase 콘솔에서 Android 앱을 등록한 뒤  
   `google-services.json` 파일을 다운로드합니다.
2. 프로젝트 내 경로에 배치합니다.
```bash
android/app/google-services.json
```
3. `android/build.gradle`의 `buildscript.dependencies`에 아래 항목이 포함되어야 합니다.
```bash
classpath "com.google.gms:google-services:4.4.2"
```
4. `android/app/build.gradle` 상단/하단에 Google Services 플러그인을 적용합니다.
```bash
plugins {
id "com.android.application"
id "com.facebook.react"
id "com.google.gms.google-services" // 또는 apply plugin 방식
}
```

> `google-services.json` 파일은 민감 정보이므로  
> `.gitignore` 에 포함하여 GitHub에는 업로드하지 않습니다.


### 3. Run on Android

에뮬레이터(또는 실제 기기)를 켜 둔 상태에서:
```bash
npm run android

- 앱 실행 후, **익명 로그인 버튼**을 눌러 로그인
- 상단에 UID 일부가 표시되고,
- “웹과 같은 Firestore에서 Todos 가져오기” 버튼으로
  웹과 동일한 Firestore `todos` 목록을 불러옵니다.
- 캘린더에서 날짜를 선택하고, 해당 날짜의 할 일을 추가/완료/삭제할 수 있습니다.
```



