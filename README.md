# Arduino Simulator

Arduino Simulator in JavaScript. Write, edit, and run Arduino sketches directly in your browser without the need for physical hardware.

Симулятор Arduino на JavaScript — пишите, редактируйте и запускайте Arduino-скетчи прямо в браузере, без необходимости в физическом оборудовании.

![Screenshot](https://raw.githubusercontent.com/lrusso/ArduinoSimulator/master/README.png)

---

## EN — English

### Live Demo

https://lrusso.github.io/ArduinoSimulator

### Demo Pages

- [Working with Digital and Analog Pins](https://lrusso.github.io/ArduinoSimulator/demo1.html)
- [Using the Serial Monitor](https://lrusso.github.io/ArduinoSimulator/demo2.html)
- [Working with EEPROM (work in progress)](https://lrusso.github.io/ArduinoSimulator/demo3.html)

### Features

- **Code Editor** — Arduino syntax highlighting, Arduino IDE-themed light theme (Ace Editor)
- **Toolbar** — create, open (.ino upload), save (download) files, undo/redo, search/replace, board selection, start/stop simulation
- **Digital Pins Panel** — visualizes 14 digital pins (54 for MEGA boards) with on/off state indicators
- **Analog Pins Panel** — displays analog pin PWM duty cycle values
- **Serial Monitor** — bidirectional serial communication (Serial.print, Serial.println, Serial.read, Serial.available)
- **EEPROM Support** — read, write, put, get, update operations
- **Board Selection** — Arduino UNO R3, MEGA 1280, MEGA 2560, NANO V3
- **Embeddable** — can be embedded into other web pages as a widget
- **Multi-language** — English, Spanish, Italian, French, Portuguese

### Supported Arduino API

| Category | Functions |
|---|---|
| Digital Pins | `pinMode()`, `digitalWrite()`, `digitalRead()` |
| Analog Pins | `analogWrite()`, `analogRead()` |
| Timing | `delay()`, `delayMicroseconds()`, `pulseIn()` |
| Serial | `Serial.begin()`, `Serial.print()`, `Serial.println()`, `Serial.available()`, `Serial.read()` |
| EEPROM | `EEPROM.read()`, `EEPROM.write()`, `EEPROM.get()`, `EEPROM.put()`, `EEPROM.update()` |
| Types | `String()`, `boolean`, `byte` |

### Technology Stack

- **React 18** — UI framework
- **TypeScript** — type safety
- **Ace Editor** — code editor with syntax highlighting
- **JSCPP** — C++ interpreter for executing sketches
- **Web Workers** — simulation runs in a separate thread (non-blocking)
- **PWA** — offline caching support via Service Worker

### Installation & Running

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run prettier

# Type checking
npm run check-types

# Run tests
npm test
```

### How to Set a Default Sketch

Create a JavaScript variable called `DEFAULT_SKETCH` with your sketch code and place it in the HTML file before loading the simulator (see `demo1.html` for an example).

### Deployment

1. Build the web app (`npm run build`)
2. Place the files from the `build/` directory into `.github/pages`
3. Commit and push to the main branch
4. GitHub Actions will automatically publish the updated version

### Project Structure

```
ArduinoSimulator/
├── src/
│   ├── components/          # React components (Toolbar, CodeEditor, Pins, SerialMonitor...)
│   ├── contexts/            # Global state management (SimulatorContext)
│   ├── screens/             # Main editor screen
│   ├── assets/              # SVG icons
│   └── utils/               # Utilities (interpreter, editor, translations)
├── public/                  # Static files (interpreter, PWA manifest)
├── __tests__/               # Unit and E2E tests
├── .github/pages/           # GitHub Pages (demo pages)
└── .github/workflows/       # CI/CD (build, test, deploy)
```

---

## RU — Русский

### Онлайн-демо

https://lrusso.github.io/ArduinoSimulator

### Демо-страницы

- [Работа с цифровыми и аналоговыми пинами](https://lrusso.github.io/ArduinoSimulator/demo1.html)
- [Использование монитора порта (Serial)](https://lrusso.github.io/ArduinoSimulator/demo2.html)
- [Работа с EEPROM (в разработке)](https://lrusso.github.io/ArduinoSimulator/demo3.html)

### Возможности

- **Редактор кода** — подсветка синтаксиса Arduino, темизация в стиле Arduino IDE (Ace Editor)
- **Панель инструментов** — создание, открытие (.ino), сохранение файлов, отмена/повтор, поиск/замена, выбор платы, запуск/остановка симуляции
- **Цифровые пины** — визуализация 14 цифровых пинов (54 для плат MEGA) с индикацией состояния вкл/выкл
- **Аналоговые пины** — отображение значений ШИМ (PWM) на аналоговых пинах
- **Монитор порта** — двусторонняя связь через Serial (Serial.print, Serial.println, Serial.read, Serial.available)
- **EEPROM** — операции чтения/записи (read, write, put, get, update)
- **Поддержка плат** — Arduino UNO R3, MEGA 1280, MEGA 2560, NANO V3
- **Встраивание** — симулятор можно встроить в другие веб-страницы как виджет
- **Мультиязычность** — английский, испанский, итальянский, французский, португальский

### Технологии

- **React 18** — пользовательский интерфейс
- **TypeScript** — типизация
- **Ace Editor** — редактор кода с подсветкой синтаксиса
- **JSCPP** — интерпретатор C++ для выполнения скетчей
- **Web Workers** — симуляция в отдельном потоке (не блокирует UI)
- **PWA** — поддержка офлайн-кэширования через Service Worker

### Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск сервера разработки
npm start

# Сборка для продакшена
npm run build

# Линтинг
npm run lint

# Форматирование кода
npm run prettier

# Проверка типов
npm run check-types

# Запуск тестов
npm test
```

### Как задать скетч по умолчанию

Создайте JavaScript-переменную `DEFAULT_SKETCH` с вашим скетчем и разместите её в HTML-файле перед загрузкой симулятора (см. пример в `demo1.html`).

### Развёртывание

1. Соберите веб-приложение (`npm run build`)
2. Разместите файлы из папки `build/` в директории `.github/pages`
3. Зафиксируйте изменения и отправьте в основную ветку
4. GitHub Actions автоматически опубликует обновлённую версию

### Структура проекта

```
ArduinoSimulator/
├── src/
│   ├── components/          # React-компоненты (Toolbar, CodeEditor, Pins, SerialMonitor...)
│   ├── contexts/            # Глобальное состояние (SimulatorContext)
│   ├── screens/             # Основной экран редактора
│   ├── assets/              # SVG-иконки
│   └── utils/               # Утилиты (интерпретатор, редактор, переводы)
├── public/                  # Статические файлы (интерпретатор, PWA manifest)
├── __tests__/               # Модульные и E2E-тесты
├── .github/pages/           # GitHub Pages (демо-страницы)
└── .github/workflows/       # CI/CD (сборка, тесты, деплой)
```

---

## Authors / Авторы

- **Maxim Dupley** (Дуплей Максим Игоревич) — developer / разработчик
- **Leonardo Javier Russo** — co-author / соавтор ([lrusso](https://github.com/lrusso))

## License / Лицензия

This project is distributed under the GNU General Public License v3.0. See `LICENSE_EN.md` (English) or `LICENSE_RU.md` (Русский) for details.

Проект распространяется под лицензией GNU General Public License v3.0. Подробности см. в файлах `LICENSE_EN.md` (English) или `LICENSE_RU.md` (Русский).
