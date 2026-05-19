/*
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
