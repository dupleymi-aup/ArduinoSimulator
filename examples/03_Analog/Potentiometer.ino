/*
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
