#include <Ultrasonic.h>
int pirPin = 3;
int pirState = LOW;

Ultrasonic ultrasonic(4, 5); // (Trig pin, Echo pin)
int ledR = 7; // LED Rojo
int ledA = 6; // LED Amarillo
int ledV = 13; // LED Amarillo 2

int ledF = 8; // Foco

void setup() {
  Serial.begin(9600);
  pinMode(ledR, OUTPUT);
  pinMode(ledA, OUTPUT);
  pinMode(ledV, OUTPUT);
  pinMode(ledF, OUTPUT);

  pinMode(pirPin, INPUT);
}

void loop() {
  pirState = digitalRead(pirPin);
  long distance = ultrasonic.read(CM);
  Serial.print(distance);
  Serial.print(",");
  Serial.println(pirState);
  
  while (Serial.available() >= 2) {
    char command = Serial.read();
    char commandPIR = Serial.read();
    controlarPIR(commandPIR);
    controlLEDs(command);
  }

  delay(500);
}

void controlarPIR(char commandPIR) {
  if (commandPIR == 'M') {
    
    Serial.println("Movimiento detectado");
    digitalWrite(ledF, HIGH);
  } else if (commandPIR == 'N') {
    
    Serial.println("Sin movimiento");
    digitalWrite(ledF, LOW);
  }
}


void controlLEDs(char command) {
  // Apagar todos los LEDs primero
  digitalWrite(ledR, LOW);
  digitalWrite(ledA, LOW);
  digitalWrite(ledV, LOW);
  
  // Encender el LED basado en el comando recibido
  switch (command) {
    case 'R':
      digitalWrite(ledR, HIGH);
      break;
    case 'A':
      digitalWrite(ledA, HIGH);
      break;
    case 'V':
      digitalWrite(ledV, HIGH);
      break;
    default:
      // Si se recibe otro carácter, no hacer nada o apagar todos los LEDs
      break;
  }
}