export interface ExampleSketch {
  name: string
  content: string
}

export interface ExampleCategory {
  category: string
  sketches: ExampleSketch[]
}

export const examples: ExampleCategory[] = [
  {
    category: "01. Basics",
    sketches: [
      {
        name: "Blink",
        content: `/*
  Blink
  Turns an LED on for one second, then off for one second, repeatedly.
*/

int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Blink started!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
`,
      },
      {
        name: "DigitalReadSerial",
        content: `/*
  DigitalReadSerial
  Reads a digital input on pin 2 and prints the result to the Serial Monitor.
  Use interactive digital pins to toggle the input.
*/

int BUTTON_PIN = 2;

void setup() {
  pinMode(BUTTON_PIN, INPUT);
  Serial.begin(9600);
  Serial.println("DigitalReadSerial started. Toggle pin 2!");
}

void loop() {
  int sensorValue = digitalRead(BUTTON_PIN);
  Serial.print("Button state: ");
  Serial.println(sensorValue);
  delay(100);
}
`,
      },
      {
        name: "AnalogReadSerial",
        content: `/*
  AnalogReadSerial
  Reads an analog input on pin A0 and prints the result to the Serial Monitor.
  Use the interactive analog slider to change the input value (0-1023).
*/

int SENSOR_PIN = A0;

void setup() {
  Serial.begin(9600);
  Serial.println("AnalogReadSerial started. Adjust pin A0 slider!");
}

void loop() {
  int sensorValue = analogRead(SENSOR_PIN);
  Serial.print("Sensor value: ");
  Serial.println(sensorValue);
  delay(100);
}
`,
      },
      {
        name: "Fade",
        content: `/*
  Fade
  Demonstrates analog output using PWM to fade an LED on pin 9.
*/

int LED_PIN = 9;
int brightness = 0;
int fadeAmount = 5;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Fade started!");
}

void loop() {
  analogWrite(LED_PIN, brightness);
  brightness = brightness + fadeAmount;

  if (brightness <= 0 || brightness >= 255) {
    fadeAmount = -fadeAmount;
  }

  Serial.print("Brightness: ");
  Serial.println(brightness);
  delay(30);
}
`,
      },
    ],
  },
  {
    category: "02. Digital",
    sketches: [
      {
        name: "Button",
        content: `/*
  Button
  Controls an LED (pin 13) with a button connected to pin 2.
  Use the interactive digital pin 2 to simulate button presses.
*/

int BUTTON_PIN = 2;
int LED_PIN = 13;

void setup() {
  pinMode(BUTTON_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Button example started. Toggle pin 2!");
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);

  if (buttonState == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("Button pressed - LED ON");
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.println("Button released - LED OFF");
  }
  delay(100);
}
`,
      },
    ],
  },
  {
    category: "03. Analog",
    sketches: [
      {
        name: "Potentiometer",
        content: `/*
  Potentiometer
  Reads an analog input from a potentiometer on pin A0
  and controls an LED brightness on pin 9.
  Use the interactive analog slider for pin A0.
*/

int POT_PIN = A0;
int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Potentiometer example started. Adjust pin A0 slider!");
}

void loop() {
  int sensorValue = analogRead(POT_PIN);
  int ledBrightness = sensorValue / 4;  // Map 0-1023 to 0-255
  analogWrite(LED_PIN, ledBrightness);

  Serial.print("Potentiometer: ");
  Serial.print(sensorValue);
  Serial.print(" -> LED: ");
  Serial.println(ledBrightness);
  delay(50);
}
`,
      },
    ],
  },
  {
    category: "04. Communication",
    sketches: [
      {
        name: "SerialEcho",
        content: `/*
  SerialEcho
  Echoes any characters received on the Serial port back to the sender.
  Type text in the Serial Monitor and see it echoed back.
*/

void setup() {
  Serial.begin(9600);
  Serial.println("Serial Echo started. Type something!");
}

void loop() {
  if (Serial.available() > 0) {
    char receivedChar = Serial.read();
    Serial.print("Echo: ");
    Serial.println(receivedChar);
  }
}
`,
      },
    ],
  },
  {
    category: "05. EEPROM",
    sketches: [
      {
        name: "EEPROMWrite",
        content: `/*
  EEPROMWrite
  Demonstrates writing to and reading from EEPROM memory.
  Writes characters to EEPROM addresses and reads them back.
*/

#include <EEPROM.h>

int address = 0;
char value;

void setup() {
  Serial.begin(9600);
  Serial.println("EEPROM Write example started.");

  // Write some characters to EEPROM
  EEPROM.write(0, 'H');
  EEPROM.write(1, 'e');
  EEPROM.write(2, 'l');
  EEPROM.write(3, 'l');
  EEPROM.write(4, 'o');

  Serial.println("Written 'Hello' to EEPROM addresses 0-4");

  // Read them back
  for (int i = 0; i < 5; i++) {
    value = EEPROM.read(i);
    Serial.print("Address ");
    Serial.print(i);
    Serial.print(": ");
    Serial.println(value);
  }
}

void loop() {
  // Nothing to do in loop
}
`,
      },
    ],
  },
]
