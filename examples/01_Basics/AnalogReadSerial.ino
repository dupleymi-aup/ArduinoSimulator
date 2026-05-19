/*
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
