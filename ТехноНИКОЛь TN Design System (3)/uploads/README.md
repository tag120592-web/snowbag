# TN Life UI Kit

TN Life UI Kit - это инструмент для создания систем дизайна пользовательского интерфейса с помощью Vue.js. Он предоставляет вам набор организованных инструментов, шаблонов и практик, которые служат основой для разработки вашего приложения.

## Установка

В первую очередь необходимо наличие в `.npmrc` файле информации по данному пакету:

`.npmrc`:
```
@life_uikit:registry=https://gitlab.tn.ru/api/v4/projects/744/packages/npm/
//gitlab.tn.ru/api/v4/projects/744/packages/npm/:_authToken=AUTHTOKEN
```

Где `AUTHTOKEN` - Ваш токен Gitlab.

Установка производится при помощи команды:

```shell
npm install @life_uikit/uikit
```

## Использование

Пакет используется как плагин, который добавляет глобальные компоненты:

```ts
import TNLifeUIKit from "@life_uikit/uikit";

const app = createApp(App);

app.use(TNLifeUIKit);
```

```html
<TNButton size="sm">Применить</TNButton>
```

Также в пакете есть два css-файла стилей:
- с css-переменными `variables.css"`:

```js
import "@life_uikit/uikit/variables.css";
```

- с шрифтами `fonts.css`:

```js
import "@life_uikit/uikit/fonts.css";
```

### Расширение списка иконок

При использовании локального расширения списка иконок для расширения и типа `IconNames` в файл `package.json` вашего проекта следует добавить объект:

```json
{
  "tn-ui-kit": {
    "external-icon-names": [
      "new-icon-name"
    ]
  }
}
```

И при создании и обновлении этого поля выполнять скрипт:

```shell
npm explore @life_uikit/uikit -- npm run update-icon-names
```

Также рекомендуется добавить этот скрипт в npm-хук при установке (`install`) зависимостей в `package.json`:

```json
{
  "scripts": {
    "install": "npm explore @life_uikit/uikit -- npm run update-icon-names"
  }
}
```

## Разработка

### `git-hook`

`git-hook` на коммит фиксируется командой:

```shell
git config --local core.hooksPath .githooks/
```

### Платформа для разработки

Для разработки или доработки и тестирования рекомендуется использовать [репозиторий документации](https://gitlab.tn.ru/superapp/superapp/tn-uikit/doc), где TN Life UI Kit используется посредством [`git submodule`](https://git-scm.com/book/en/v2/Git-Tools-Submodules).
