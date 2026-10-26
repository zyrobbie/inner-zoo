# Inner Zoo browser QA

Playwright acceptance tests for the quiz. Tests use synthetic answers chosen from the published question bank; they contain no participant records or credentials.

**A script or static check is not a browser pass.** Candidate acceptance requires the actual test results, traces where needed, and screenshot review for the tested commit. Post-deployment checks are a separate run.

## Supported layout and commands

The public repository layout is `src/`, `assets/avatars/web/`, `dist/` (built), and `qa-browser/`. Set `ZOO_PROJECT_ROOT` to override source-root detection if necessary.

From `qa-browser/`:

```sh
npm ci --ignore-scripts --no-fund --no-audit
npm run check:draft
npm run preflight
npx --no-install playwright install --with-deps chromium webkit
npm run test:list
npm test
```

Build the complete `dist/` before preflight and candidate testing. Serving a lone HTML file is insufficient: all 18 files in `dist/assets/avatars/` are required. The candidate static server binds only to `127.0.0.1:4173` and does not expose the source tree.

The lockfile pins `@playwright/test`, `playwright`, and `playwright-core` to **1.64.0**, with official registry URLs and SHA512 integrity values. The official engine manifest specifies Chromium **156.0.8078.4**, revision **1248**, and WebKit **27.2**, revision **2370**. Actual runs verify their browser version. CI uses Node22 and standard `ubuntu-24.04` runners.

## Candidate coverage: 29 project tests

| Check | Chromium desktop | Chromium mobile emulation | WebKit desktop | WebKit mobile emulation |
|---|---:|---:|---:|---:|
| Real 20-answer original smoke → restart → all-self | ✓ | ✓ | ✓ | ✓ |
| Back, stable shuffled options, selected style/aria-pressed, edited result, reload reset | ✓ | ✓ | ✓ | ✓ |
| Keyboard-only full quiz, visible focus, accessible names, limited DOM/ARIA order | ✓ | ✓ | ✓ | ✓ |
| Two-way tie, six-way tie, exact zero-self copy | ✓ | — | — | — |
| 360/390/430px × light/dark intro, question and result screenshots | — | ✓ | — | — |
| 1280px × light/dark screenshots | ✓ | — | — | — |
| Explicit 200% text-resize fixture | 1280px | 360px | — | — |
| All 18 image URLs, decode/currentSrc, blocked external fonts, failed images, PNG fixture | ✓ | — | — | — |
| Immutable original standalone HTML: one original 20-answer smoke | ✓ | — | — | — |

The original smoke results are **perfect 25%, anxvig 5%, please 5%, self 65%**. Every scored result is reached by actual named-button interaction, never by injecting quiz state, calling its scoring function or synthesizing stored answers.

The original standalone baseline is only a local test fixture. Its HTML bytes retain SHA256 `5865f5f1094b07a8857b3a2ded3acbb8b8b2dcf758d8bc00c0aabd4bcfbc9604`. Only its local test response receives a restrictive CSP blocking legacy external Google Fonts; the original file is not edited. Expected font CSP errors are isolated, while all JavaScript errors remain failures. Do not publish this fixture as a Pages route.

## Post-deployment coverage: four real browser runs

Only after successful deployment and a separate exact-byte/commit check:

```sh
npm run test:live:list
ZOO_EXPECTED_COMMIT=<tested-commit> npm run test:live
```

The live config is restricted to **https://zyrobbie.github.io/inner-zoo/**. It has no local webServer fallback. It runs Chromium and WebKit, each desktop and mobile emulation, against that live URL: 20-answer original smoke, resource decoding, horizontal overflow, screenshots, restart, and 20-answer all-self. One live project checks all 20 built URLs return HTTP200. Relative navigation and resource paths retain the `/inner-zoo/` Pages prefix.

Live HTTP200 is not proof of exact bytes or release identity. Run the release workflow's SHA verifier for the complete tested dist and commit metadata separately. `ZOO_EXPECTED_COMMIT` is recorded as evidence; it does not by itself assert which commit was deployed.

## Evidence and limits

- `artifacts/results.json` / `artifacts/report/`: actual candidate results and report.
- `artifacts/live-results.json` / `artifacts/live-report/`: actual post-deployment results.
- `artifacts/test-results/` and `artifacts/live-test-results/`: screenshots, network/console records, ARIA and image-selection evidence; failed tests retain trace and failure screenshot.
- `artifacts/draft-check.json` and `preflight.json`: static checks and exact built-file hashes, **not browser acceptance**.

Important boundaries:

1. Linux Chromium/WebKit are real browser engines, but mobile viewports/touch/DPR are emulated, not actual iOS/Android hardware or WeChat.
2. The 200% text fixture doubles computed text font sizes while preserving viewport and DPR. It is **not native browser zoom or OS font scaling**.
3. Modern engines support WebP. The PNG fixture removes only `picture source` nodes after a real quiz; it validates the original PNG `img` path, not a genuinely WebP-unsupported engine. Aborting WebP is not treated as reliable format fallback.
4. Blocking third-party network shows no external font dependency; it does not establish full offline reload support. Routing and `no-store` intentionally mean HTTP cache behavior is untested.
5. Keyboard/name/focus/DOM/ARIA checks are limited accessibility evidence, not VoiceOver/TalkBack testing or complete WCAG certification.
6. Captured screenshots and geometry checks are not a golden-image pixel regression. Review actual images for clipping, overlap and readability.
7. Reload returning to the intro is existing in-memory behavior; these tests do not add progress persistence.

## CI template

`ci/phase3-browser.yml.draft` is a read-only candidate-QA template. Its guard is restricted to public `zyrobbie/inner-zoo`, branch `main`. It supports matching pushes and manual dispatch, uses `contents: read`, disables persisted checkout credentials, has no retries or schedule, and retains synthetic evidence for three days. It does not deploy. A release workflow can use these QA steps before its separate least-privilege Pages deployment and live-verification jobs.

Do not publish local run artifacts, dependency caches, environment files, authentication state or local preparation notes. Test failures are failures until diagnosed, fixed where appropriate, and rerun on the final commit.

## Official references

- [Playwright configuration](https://playwright.dev/docs/test-configuration)
- [Projects and mobile emulation](https://playwright.dev/docs/test-projects)
- [CI setup](https://playwright.dev/docs/ci-intro)
- [Accessibility testing limits](https://playwright.dev/docs/accessibility-testing)
- [Visual screenshot environment limits](https://playwright.dev/docs/test-snapshots)
- [Pinned release](https://github.com/microsoft/playwright/releases/tag/v1.64.0)
- [Pinned browser manifest](https://raw.githubusercontent.com/microsoft/playwright/v1.64.0/packages/playwright-core/browsers.json)
- [GitHub token permissions](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)
