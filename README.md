# Chiikawa desktop pet

투명한 전체 화면 창 위에서 토끼가 화면 아래를 걷는 Electron 프로토타입입니다. 캐릭터가 없는 화면 영역은 클릭이 통과하고, 캐릭터를 클릭하면 인사합니다. 캐릭터를 누른 채 끌면 원하는 위치로 옮길 수 있습니다.

## 실행

```sh
npm install
npm start
```

종료는 macOS 메뉴 막대에서 `Electron > Quit Electron` 또는 `⌘Q`를 누르세요.

## 폴더 구성

```text
Chiikawa/
├── package.json   # Electron 의존성과 실행 명령
├── main.js        # 투명 오버레이 창과 마우스 클릭 통과 처리
├── preload.js     # 화면 코드에서 캐릭터 위치를 앱에 전달
├── index.html     # 캐릭터 화면 구조와 SVG
├── style.css      # 색상과 걷기/숨쉬기 애니메이션
├── renderer.js    # 화면 이동과 클릭 반응
└── README.md
```

Electron 버전은 `package.json`에 지정되어 있고 `package-lock.json`으로 설치 버전이 고정됩니다.

현재 캐릭터는 `index.html`에 포함된 SVG 시안입니다. 직접 준비한 스프라이트가 있다면 `assets/` 폴더를 만든 뒤 SVG를 이미지 요소로 교체해 연결하면 됩니다.
