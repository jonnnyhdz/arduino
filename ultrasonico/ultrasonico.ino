#define LED_PIN 13
int pirPin = 3;
int pirState = LOW;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(pirPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  while (Serial.available() > 0) {
    char command = Serial.read();
    controlarDispositivo(command);
  }

  pirState = digitalRead(pirPin);
  Serial.println(pirState);

  delay(500);
}

void controlarDispositivo(char command) {
  if (command == 'M') {
    Serial.println("Movimiento detectado");
    digitalWrite(LED_PIN, HIGH);
  } else if (command == 'N') {
    Serial.println("Sin movimiento");
    digitalWrite(LED_PIN, LOW);
  } else if (command == '1') {
    Serial.println("Encender LED");
    digitalWrite(LED_PIN, HIGH);
  } else if (command == '0') {
    Serial.println("Apagar LED");
    digitalWrite(LED_PIN, LOW);
  }
}
