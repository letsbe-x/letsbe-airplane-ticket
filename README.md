# Airport Ticket PWA

이 프로젝트는 사용자가 항공권 정보를 입력하여 공유 가능한 티켓을 생성하는 웹 애플리케이션입니다. 기존 Node.js 백엔드에서 서버 없이 동작하는 완전한 정적 웹사이트(Static Site)로 재구성되었습니다. 모든 데이터는 브라우저의 `localStorage`에 저장되며, 티켓 이미지는 클라이언트 사이드에서 동적으로 생성됩니다.

## 주요 기능

- **동적 티켓 생성**: 항공편명, 도시, 승객 이름, 좌석 등 정보를 입력하여 여러 개의 항공권을 한 번에 생성합니다.
- **실시간 미리보기**: 입력하는 정보가 실시간으로 티켓 UI에 반영됩니다.
- **데이터 영속성**: 생성된 티켓 정보는 브라우저의 `localStorage`에 저장되어 페이지를 새로고침해도 유지됩니다.
- **이미지 다운로드**: 생성된 티켓을 PNG 이미지 파일로 다운로드할 수 있습니다. (개별 또는 전체 다운로드)
- **서버리스(Serverless)**: GitHub Pages와 같은 정적 사이트 호스팅 서비스에 바로 배포할 수 있습니다.

## 기술 스택

- **HTML, CSS, JavaScript (Vanilla JS)**: 별도의 프레임워크 없이 순수 웹 기술만으로 구현되었습니다.
- **[html2canvas](https://html2canvas.hertzen.com/)**: HTML 요소를 캡처하여 이미지(Canvas)로 변환하는 데 사용됩니다.
- **[JsBarcode](https://github.com/lindell/JsBarcode)**: 바코드를 생성하는 데 사용됩니다.

## 실행 방법

### 로컬에서 실행

이 프로젝트는 서버 없이 동작하므로, 로컬에서 `docs/index.html` 파일을 웹 브라우저로 열기만 하면 됩니다.

1.  이 저장소를 클론하거나 다운로드합니다.
2.  `docs` 폴더에 있는 `index.html` 파일을 브라우저에서 엽니다.

> **참고**: 일부 브라우저는 보안 정책(`CORS`)으로 인해 `file:///` 프로토콜에서 `localStorage` 접근이나 이미지 처리에 제약을 둘 수 있습니다. 이 경우, 간단한 로컬 서버를 구동하는 것을 권장합니다. Python이 설치되어 있다면 아래 명령어로 쉽게 서버를 실행할 수 있습니다.
>
> ```bash
> # docs 폴더로 이동
> cd docs
> # Python 3.x
> python -m http.server
> ```
>
> 그 후 브라우저에서 `http://localhost:8000`으로 접속하세요.

### GitHub Pages로 배포

이 프로젝트는 `docs` 폴더를 기준으로 GitHub Pages에 배포할 수 있도록 구성되어 있습니다.

1.  이 저장소를 자신의 GitHub 계정으로 포크(Fork)합니다.
2.  포크한 저장소의 **Settings > Pages** 메뉴로 이동합니다.
3.  **Source** 항목에서 브랜치를 `main` (또는 `master`)으로 선택하고, 폴더를 `/docs`로 지정한 후 **Save** 버튼을 누릅니다.
4.  잠시 후, 표시되는 URL (`https://<your-username>.github.io/<repository-name>/`)로 접속하여 배포된 애플리케이션을 확인할 수 있습니다.

## 프로젝트 구조

```
/
└── docs/
    ├── index.html       # 티켓 생성 페이지
    ├── ticket.html      # 생성된 티켓 확인 및 다운로드 페이지
    ├── style.css        # 전체 스타일시트
    ├── js/
    │   ├── app.js       # index.html의 메인 로직
    │   └── ticket.js    # ticket.html의 로직 (데이터 로딩, 이미지 생성)
    └── ticket.png       # (샘플 이미지, 현재 사용되지 않음)
```
