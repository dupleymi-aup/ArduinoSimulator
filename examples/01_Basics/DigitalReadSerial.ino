/*
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
