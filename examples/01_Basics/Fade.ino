/*
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
