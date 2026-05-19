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

### Backend Server & Admin Panel

The project includes a backend server for tracking student sessions and an admin panel for viewing reports.

#### Server Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env and set a strong JWT_SECRET

# Run database migrations
npm run db:migrate

# Create default admin user
npm run db:seed

# Start the development server
npm run dev
```

The server runs on `http://localhost:3001` by default.

#### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `3001` |
| `JWT_SECRET` | Secret key for JWT tokens (CHANGE IN PRODUCTION) | - |
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:3000` |
| `REACT_APP_BACKEND_URL` | Frontend API endpoint | `http://localhost:3001` |

#### Admin Panel

Access the admin panel at `http://localhost:3000/admin` (when running the frontend with the backend server).

- **Default credentials**: `admin` / `admin123` (change after first login!)
- **Features**:
  - Dashboard with session statistics
  - Activity report (sessions over time)
  - Performance report (completion rates, errors)
  - Pin usage report (most-used pins)
  - Progress report (student progress)
  - Session browser with pagination

#### Tracking System

The tracking system automatically records:
- Session start/end times
- Board type changes
- Simulation starts/stops
- File operations (new, open, save)
- Pin interactions
- Serial monitor usage

All data is stored in SQLite and viewable through the admin panel.

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

### Бэкенд-сервер и Админ-панель

Проект включает бэкенд-сервер для отслеживания сессий студентов и админ-панель для просмотра отчётов.

#### Настройка сервера

```bash
# Перейдите в директорию сервера
cd server

# Установите зависимости
npm install

# Скопируйте шаблон переменных окружения
cp .env.example .env

# Отредактируйте .env и задайте надёжный JWT_SECRET

# Примените миграции базы данных
npm run db:migrate

# Создайте администратора по умолчанию
npm run db:seed

# Запустите сервер разработки
npm run dev
```

Сервер работает на `http://localhost:3001` по умолчанию.

#### Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `PORT` | Порт сервера | `3001` |
| `JWT_SECRET` | Секретный ключ для JWT (ИЗМЕНИТЕ В ПРОДАКШЕНЕ) | - |
| `DATABASE_URL` | Путь к SQLite базе | `file:./dev.db` |
| `CORS_ORIGINS` | Разрешённые origin (через запятую) | `http://localhost:3000` |
| `REACT_APP_BACKEND_URL` | API endpoint фронтенда | `http://localhost:3001` |

#### Админ-панель

Доступна по адресу `http://localhost:3000/admin` (при запущенном фронтенде с бэкендом).

- **Учётные данные по умолчанию**: `admin` / `admin123` (смените после первого входа!)
- **Возможности**:
  - Дашборд со статистикой сессий
  - Отчёт по активности (сессии во времени)
  - Отчёт по производительности (завершения, ошибки)
  - Отчёт по использованию пинов
  - Отчёт по прогрессу студентов
  - Браузер сессий с пагинацией

#### Система отслеживания

Система автоматически записывает:
- Время начала/окончания сессий
- Изменения типа платы
- Запуски/остановки симуляции
- Операции с файлами (создание, открытие, сохранение)
- Взаимодействия с пинами
- Использование монитора порта

Все данные хранятся в SQLite и доступны через админ-панель.

---

## Authors / Авторы

- **Maxim Dupley** (Дуплей Максим Игоревич) — developer / разработчик
- **Leonardo Javier Russo** — co-author / соавтор ([lrusso](https://github.com/lrusso))

## License / Лицензия

This project is distributed under the GNU General Public License v3.0. See `LICENSE_EN.md` (English) or `LICENSE_RU.md` (Русский) for details.

Проект распространяется под лицензией GNU General Public License v3.0. Подробности см. в файлах `LICENSE_EN.md` (English) или `LICENSE_RU.md` (Русский).
