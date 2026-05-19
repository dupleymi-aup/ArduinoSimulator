/*
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
