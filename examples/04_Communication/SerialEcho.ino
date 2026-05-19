/*
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
