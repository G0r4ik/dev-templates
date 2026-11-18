# dev-templates

Мои шаблоны, конфиги и сниппеты, собранные из старых проектов. Отсюда копирую в новые проекты.

> Workflow лежат в `github/`, а не в `.github/`, поэтому в этом репозитории они не запускаются. Чтобы использовать, скопируй нужный файл в `.github/workflows/` своего проекта.

## monorepo/ — актуальный сетап (из `it-vacancy-trend`)
Самые свежие и зрелые конфиги — начинать с них.

| Файл | Что это |
|---|---|
| `eslint.config.js` | ESLint flat config: vue, import, unicorn, sonarjs, security, promise, n, prettier |
| `.lintstagedrc.json`, `.husky/*` | lint-staged на pre-commit, commitlint на commit-msg, проверка секретов на pre-push, `pnpm install` на post-merge |
| `.commitlintrc`, `.prettierrc`, `.editorconfig`, `.browserslistrc`, `.gitattributes`, `.dockerignore` | базовые правила |
| `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `mise.toml` | монорепо на pnpm + Turborepo, версии тулов через mise, скрипты `setup` / `secrets:pull` / `deploy` |
| `vitest.config.js` | тесты |
| `github/workflows/ci.yml` | CI |
| `docker-compose.dev.yml`, `docker-compose.prod.yml` | dev и prod (Traefik + Let's Encrypt — поменять `acme.email`) |
| `apps/frontend/*` | Vite, PostCSS, stylelint, Dockerfile, nginx для SPA |
| `apps/backend/Dockerfile` | бэкенд |
| `apps/database/atlas.hcl`, `compose.dev.yml` | миграции Atlas, Postgres для разработки |

## lint-format/ — более ранние варианты
| Файл | Откуда | Что это |
|---|---|---|
| `.editorconfig` | AnoTodo | lf, utf-8, 2 пробела, 80 символов |
| `.prettierrc` | AnoTodo | singleQuote, без `;`, `arrowParens: avoid`, `bracketSameLine` |
| `eslintrc.vue-standard.cjs` | AnoTodo | legacy-конфиг: standard + vue3-recommended |
| `.stylelintrc.json` | it-vacancy-trend-frontend | standard + recommended-vue + recess-order |
| `.commitlintrc`, `commit-msg` | it-vacancy-trend-frontend | conventional commits через husky (старый формат хука) |
| `.browserslistrc` | it-vacancy-trend-frontend | `> 0.1%`, без IE11 / OperaMini |

## build/
| Файл | Что это |
|---|---|
| `webpack.config.js` | Vue 3 на webpack 5 без vue-cli: SWC-минификация, contenthash, dotenv-webpack, CaseSensitivePaths, урезанный `stats` |
| `postcss.purge-doiuse.cjs` | только в prod: doiuse (проверка CSS по browserslist) + PurgeCSS + preset-env + reporter |
| `postcss.minify-chain.js` | convert-values → calc → flexbugs → autoprefixer → preset-env → merge-rules → cssnano |
| `vite.config.js` | `base: './'`, alias `@`, rollup-plugin-visualizer |

## css/
| Файл | Что это |
|---|---|
| `tokens.itvacna.css` | двухуровневые токены: палитра `--color-<имя>-base` → семантика; `--unit: 5px` + `calc`; шкалы z-index, шрифтов, радиусов, бордеров |
| `_config.scss` | то же на SCSS + брейкпоинты + `@mixin flex` (Vozrozhdenie) |
| `themes.data-attr.css` | темы через `:root[theme='…']` (AnoTodo) |
| `normalize.css`, `_reset.scss` | сбросы |

## snippets/
| Файл | Что это |
|---|---|
| `sm2.ts` | интервальное повторение SM-2 + превью интервала по оценке (gamewords) |
| `hotkeys.js` | настраиваемые горячие клавиши с хранением в localStorage (AnoTodo) |
| `jsonToMarkdown.js` | экспорт задач в Markdown-чеклист + скачивание файла (AnoTodo) |
| `apiWrapper.tsx` | React-хуки `useGetData` / `usePostData` поверх axios (detliar) |
| `hookOutside.tsx` | клик вне элемента (detliar) |

## backend/ (из it-vacancy-trend-backend)
Паттерн фичи: `components/<feature>/{routes,controllers,services,sql,mapping}.js`.

| Файл | Что это |
|---|---|
| `errorHandler.js` | иерархия `CustomHTTPError` + единый error-middleware; в prod — алерт в Telegram и на почту |
| `middleware.js` | `validateRequest` для express-validator |
| `statusCodes.js`, `telegram.js`, `ecosystem.config.cjs` | коды ответов, уведомления, pm2 |

## github/
| Файл | Откуда | Что это |
|---|---|---|
| `dependabot.yml` | lefthook | npm + actions, `cooldown: 7`, группа `vue-ecosystem`, префикс `chore` |
| `workflows/scorecard.yml` | lefthook | OpenSSF Scorecard, захардненный StepSecurity |
| `workflows/dependency-review.yml` | lefthook | проверка зависимостей в PR |
| `workflows/ai-issue-summary.yml` | cdci | саммари новых issue через `actions/ai-inference` |
| `workflows/labeler.yml` + `labeler.yml` | cdci | автометки PR по путям (frontend, docs) |
| `workflows/pages-static.yml`, `pages-nuxt.yml` | cdci | деплой статики / Nuxt на GitHub Pages |
| `workflows/manual-dispatch.yml`, `greetings.yml` | cdci | ручной запуск, приветствие новых контрибьюторов |
| `workflows/deploy-vps-ssh.yml` | detliar | деплой по SSH на push в main (лучше ключ вместо пароля) |

## docker/ (из gamewords)
`compose.healthcheck.yml` — бэкенд с healthcheck, фронт стартует после `service_healthy`, БД в volume. `Dockerfile.bun`, `nginx.spa.conf`.

## archive/
- `giftmarket/` — монитор цен NFT-подарков Telegram (Portals / MRKT / Tunnel → SQLite → алерт в бот при цене < 80% средней). Секреты заменены на `process.env`.
- `itvacna-admin/` — дипломная админка it-vacancy-trend: патч бэкенда и `PageAdmin.vue`.

## sandboxes/ — песочницы целиком, с историей коммитов
| Папка | Что это |
|---|---|
| `cdci/` | первые эксперименты с GitHub Actions и Pages |
| `lefthook/` | безопасность CI: Scorecard, dependency-review, Dependabot, StepSecurity |
| `testdemo/` | форк-копия `dependabot/demo` |

## Идеи из старых проектов
- **Изучение английского** — `learnExten` (расширение Chrome: «добавить слово» из контекстного меню; модель word / translate / sentence / progress / nextShow; EN→RU и RU→EN), `anoLearn` (ассоциации-карточки, списки, популярные слова), `gamewords` (OCR из игр → SM-2 → PWA), `english`.
- **AnoTodo** — drag-n-drop, папки, подзадачи, темы, горячие клавиши, экспорт в MD; бэклог: история изменений, хештеги, уровень важности, a11y.
- **cryptoMine** — журнал сделок: статистика, конвертер валют, focus trap, экспорт / импорт.
- **detliar** — форум с пасхалками: треды, реакции, карма, голосования.
- **gmae** — онлайн-игра на WebSocket: история ходов, рейтинг, бот.
