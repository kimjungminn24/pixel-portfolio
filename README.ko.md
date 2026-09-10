<div align="center">

# pixel-portfolio

[English](README.md) | **한국어**

픽셀 컨셉 포트폴리오 템플릿. JSON 한 파일과 마크다운 몇 장으로 프로젝트 모음, 개선사항, 개발기록 페이지가 만들어집니다. 버튼 하나로 사이트 전체가 **240p** 와 **4K** 를 오갑니다.

[데모 보기](https://kimjungminn24.github.io/pixel-portfolio/)

</div>

## 특징

- 빌드 없음, 의존성 없음. 정적 서버면 어디든 됩니다
- **240p**: 픽셀 폰트(Galmuri), 딱딱한 그림자, 스캔라인, 픽셀 커서. OS 가 다크 모드면 검정 바탕에 흰 글자
- **4K**: Pretendard, 둥근 모서리, 부드러운 그림자
- 고른 모드는 브라우저에 저장됩니다
- 240p 에서 세션당 한 번 부팅 화면이 뜹니다. 아무 키나 클릭으로 건너뜁니다. 4K 와 동작 줄이기 설정에서는 안 뜹니다
- UI 문구를 전부 JSON 에서 바꿀 수 있어서 어떤 언어로든 쓸 수 있습니다

| 페이지 | 주소 |
| --- | --- |
| 홈: 소개와 섹션별 카드 | `/` |
| 프로젝트: 썸네일, 링크, 스택, 소개, 개선사항, 개발기록 | `/p/:id` |
| 개선사항: 전/후 수치와 마크다운 본문 | `/p/:id/improve/:id` |
| 개발기록: 마크다운 본문 | `/p/:id/log/:date` |
| 기록 전체 | `/logs` |

## 시작하기

1. **Use this template** 을 누르거나 fork 합니다
2. `data/portfolio.json` 을 내 정보로 바꿉니다
3. `content/<프로젝트 id>/` 아래에 마크다운을 씁니다
4. `assets/thumbs/` 에 썸네일을 넣습니다
5. 로컬에서 확인합니다

   ```
   npm run serve     # http://127.0.0.1:5588/
   npm run check     # JSON 검사
   ```

6. 저장소 설정의 **Pages** 에서 Source 를 **GitHub Actions** 로 둡니다. `main` 에 푸시하면 배포됩니다

Node 는 스크립트 두 개에만 필요합니다. 사이트 자체는 HTML, CSS, JS 뿐입니다.

## 데이터

`data/portfolio.json` 하나가 전부입니다.

```jsonc
{
  "site": {
    "title": "Pixel Portfolio",          // 탭 제목과 로고
    "owner": "이름",
    "tagline": "한 줄 소개",
    "intro": "두세 줄 소개",
    "avatar": "assets/avatar.svg",
    "avatar_pixel": "assets/avatar-pixel.svg",   // 선택. 240p 에서 avatar 대신 보임
    "links": [{ "label": "GitHub", "url": "https://github.com/..." }],
    "sections": [                         // 홈 섹션. type 으로 프로젝트를 분류
      { "type": "project", "label": "프로젝트" },
      { "type": "opensource", "label": "오픈소스" }
    ],
    "footer": "마크다운 가능"
  },
  "labels": { "nav_home": "홈", "more": "자세히 보기" },   // 선택. 아래 목록 참고
  "projects": [ /* 아래 */ ]
}
```

프로젝트 하나:

```jsonc
{
  "id": "my-app",                       // 주소에 쓰임. 영문, 숫자, 하이픈
  "type": "project",                    // site.sections 의 type 중 하나
  "title": "My App",
  "summary": "카드에 보이는 한 줄",
  "thumbnail": "assets/thumbs/my-app.png",         // 없으면 제목 첫 글자로 채움
  "thumbnail_pixel": "assets/thumbs/my-app-px.png", // 선택. 240p 에서 thumbnail 대신 보임
  "repo": "https://github.com/...",
  "demo": "https://...",
  "links": [{ "label": "발표 자료", "url": "..." }],   // 선택
  "stack": ["Go", "React"],
  "period": "2026.07 ~ 2026.08",
  "role": "1인 개발",
  "about": "짧은 소개 (마크다운)",       // 길면 "aboutFile": "content/my-app/about.md"
  "improvements": [
    {
      "id": "faster-boot",
      "title": "첫 화면 뜨는 시간 줄이기",
      "summary": "목록에 보이는 한 줄",
      "tags": ["성능"],
      "metrics": [{ "label": "첫 페인트", "before": "1.8s", "after": "0.6s" }],   // 선택
      "file": "content/my-app/improvements/faster-boot.md"   // 짧으면 "body": "마크다운"
    }
  ],
  "logs": [
    { "date": "2026-09-10", "title": "첫 배포", "summary": "...", "tags": [], "file": "content/my-app/logs/2026-09-10.md" }
  ]
}
```

- 개발기록 주소는 `date` 로 만듭니다. 같은 날 기록이 둘이면 `id` 를 따로 주세요
- `file` 과 `body` 는 둘 중 하나만
- 샘플 프로젝트(`id: sample`)는 모든 필드를 채워 둔 예시입니다. 보고 나서 지우세요

바꿀 수 있는 문구: `nav_home`, `nav_logs`, `home`, `repo`, `demo`, `stack`, `about`, `improvements`, `logs`, `all_logs`, `more`, `prev`, `next`, `empty`, `not_found`, `loading`, `content_error`, `load_error`

## 마크다운

`js/markdown.js` 가 제목, 굵게, 기울임, 취소선, `==형광펜==`, 인라인 코드, 코드 블록, 목록, 번호 목록, 인용, 표, 구분선, 링크, 이미지를 그립니다.

안 되는 것: 중첩 목록, HTML 태그(글자로 보임), 주소만 적은 링크(`[글자](주소)` 로 쓰세요). 코드 펜스를 안 닫으면 파일 끝까지 코드로 잡힙니다.

## 테마

| 파일 | 역할 |
| --- | --- |
| `css/base.css` | 레이아웃. 두 테마가 같이 씁니다 |
| `css/theme-pixel.css` | 240p 의 변수와 장식 |
| `css/theme-modern.css` | 4K 의 변수와 장식 |

색, 글꼴, 모서리, 그림자는 각 테마 파일 맨 위의 CSS 변수입니다. 240p 의 깎인 모서리는 같은 블록의 `--corner` SVG 인데 `fill` 색이 글자로 박혀 있어서 `--ink` 를 바꾸면 같이 바꿔야 합니다.

주소 뒤에 `?theme=pixel` 이나 `?theme=modern` 을 붙이면 그 방문만 해당 모드로 열립니다.

부팅 화면을 빼려면 `index.html` 의 `js/boot.js` 줄을 지우세요.

## 호스팅

주소가 진짜 경로(`/p/sample`)라서 호스팅이 모르는 경로에 `index.html` 을 내려줘야 합니다.

- **GitHub Pages**: 그대로 됩니다. `404.html` 이 모르는 경로를 앱으로 돌려보내고, 워크플로가 프로젝트 사이트의 `<base href>` 를 맞춥니다
- **Netlify, Vercel, Cloudflare Pages**: `/*` 를 `/index.html` 로 보내는 rewrite 를 추가하세요
- **다른 호스트의 하위 폴더**: `index.html` 과 `404.html` 의 `<base href>` 를 그 폴더로 바꾸세요
- `file://` 로 직접 열면 `fetch` 가 막혀서 안 뜹니다. `npm run serve` 를 쓰세요

폰트는 jsdelivr CDN 에서 오고, 막히면 시스템 글꼴로 떨어집니다.

## 파일 구성

```
index.html
404.html      GitHub Pages 용 리다이렉트
css/          base, theme-pixel, theme-modern
js/           app(라우터와 화면), markdown, theme, boot
data/         portfolio.json
content/      <프로젝트 id>/about.md, improvements/*.md, logs/*.md
assets/       thumbs/, avatar.svg, avatar-pixel.svg, favicon.svg
scripts/      serve.js, check.js
```

## 기여하기

버그 제보와 풀 리퀘스트를 환영합니다. [CONTRIBUTING.md](CONTRIBUTING.md) 를 봐 주세요.

## 라이선스

MIT

픽셀 폰트 [Galmuri](https://galmuri.quiple.dev) 와 [Pretendard](https://github.com/orioncactus/pretendard) 는 저장소에 넣지 않고 CDN 에서 불러옵니다. 둘 다 SIL Open Font License 1.1 입니다.
