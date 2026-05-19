# Arduino Simulator

Симулятор Arduino на JavaScript — пишите, редактируйте и запускайте Arduino-скетчи прямо в браузере, без необходимости в физическом оборудовании.

![Скриншот](https://raw.githubusercontent.com/lrusso/ArduinoSimulator/master/README.png)

## Онлайн-демо

https://lrusso.github.io/ArduinoSimulator

## Демо-страницы

- [Работа с цифровыми и аналоговыми пинами](https://lrusso.github.io/ArduinoSimulator/demo1.html)
- [Использование монитора порта (Serial)](https://lrusso.github.io/ArduinoSimulator/demo2.html)
- [Работа с EEPROM (в разработке)](https://lrusso.github.io/ArduinoSimulator/demo3.html)

## Возможности

- **Редактор кода** — подсветка синтаксиса Arduino, темизация в стиле Arduino IDE (Ace Editor)
- **Панель инструментов** — создание, открытие (.ino), сохранение файлов, отмена/повтор, поиск/замена, выбор платы, запуск/остановка симуляции
- **Цифровые пины** — визуализация 14 цифровых пинов (54 для плат MEGA) с индикацией состояния вкл/выкл
- **Аналоговые пины** — отображение значений ШИМ (PWM) на аналоговых пинах
- **Монитор порта** — двусторонняя связь через Serial (Serial.print, Serial.println, Serial.read, Serial.available)
- **EEPROM** — операции чтения/записи (read, write, put, get, update)
- **Поддержка плат** — Arduino UNO R3, MEGA 1280, MEGA 2560, NANO V3
- **Встраивание** — симулятор можно встроить в другие веб-страницы как виджет
- **Мультиязычность** — английский, испанский, итальянский, французский, португальский

## Поддерживаемые Arduino API

| Категория | Функции |
|---|---|
| Цифровые пины | `pinMode()`, `digitalWrite()`, `digitalRead()` |
| Аналоговые пины | `analogWrite()`, `analogRead()` |
| Время | `delay()`, `delayMicroseconds()`, `pulseIn()` |
| Serial | `Serial.begin()`, `Serial.print()`, `Serial.println()`, `Serial.available()`, `Serial.read()` |
| EEPROM | `EEPROM.read()`, `EEPROM.write()`, `EEPROM.get()`, `EEPROM.put()`, `EEPROM.update()` |
| Типы | `String()`, `boolean`, `byte` |

## Технологии

- **React 18** — пользовательский интерфейс
- **TypeScript** — типизация
- **Ace Editor** — редактор кода с подсветкой синтаксиса
- **JSCPP** — интерпретатор C++ для выполнения скетчей
- **Web Workers** — симуляция в отдельном потоке (не блокирует UI)
- **PWA** — поддержка офлайн-кэширования через Service Worker

## Установка и запуск

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

## Как задать скетч по умолчанию

Создайте JavaScript-переменную `DEFAULT_SKETCH` с вашим скетчем и разместите её в HTML-файле перед загрузкой симулятора (см. пример в `demo1.html`).

## Развёртывание

1. Соберите веб-приложение (`npm run build`)
2. Разместите файлы из папки `build/` в директории `.github/pages`
3. Зафиксируйте изменения и отправьте в основной分支
4. GitHub Actions автоматически опубликует обновлённую версию

## Структура проекта

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

## Авторы

- **Maxim Dupley** (Дуплей Максим Игоревич) — разработчик
- **Leonardo Javier Russo** — соавтор ([lrusso](https://github.com/lrusso))

## Лицензия

Проект распространяется под лицензией GNU General Public License v3.0. Подробности см. в файле `LICENSE_EN.md`.
