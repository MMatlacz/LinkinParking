byte red_pins[] = {0,6,11};
byte green_pins[] = {2,8};


void setup() {
  Serial.begin(115200);
  for(int i = 0; i < sizeof(red_pins); ++i) {
    pinMode(red_pins[i], OUTPUT);    
    pinMode(red_pins[i] + 1, OUTPUT);    
    digitalWrite(red_pins[i], LOW);
    digitalWrite(red_pins[i] + 1, LOW);
  }
  for(int i = 0; i < sizeof(green_pins); ++i) {
    pinMode(green_pins[i], OUTPUT);    
    pinMode(green_pins[i] + 1, OUTPUT);    
    digitalWrite(green_pins[i], LOW);
    digitalWrite(green_pins[i] + 1, LOW);
  }

  // distance sensor
  // a5=acc, a4=gnd, a3=anout, a2, dout
  pinMode(A5, OUTPUT);
  pinMode(A4, OUTPUT);
  digitalWrite(A5, HIGH);
  digitalWrite(A4, LOW);
  pinMode(A3, INPUT);
  pinMode(A2, INPUT);
}

void ledOff() {
  for(int i = 0; i < sizeof(red_pins); ++i)
    digitalWrite(red_pins[i], LOW);
  for(int i = 0; i < sizeof(green_pins); ++i)
    digitalWrite(green_pins[i], LOW);
}

void turnRed() {
  ledOff();
  for(int i = 0; i < sizeof(red_pins); ++i)
    digitalWrite(red_pins[i], HIGH);
}

void turnGreen() {
  ledOff();
  for(int i = 0; i < sizeof(green_pins); ++i)
    digitalWrite(green_pins[i], HIGH);
}

int i = 0;
bool reserved = false;
void loop() {
  int val = analogRead(A3);
  if(reserved) {
    i += 1;
    if(i % 2 == 0)
      turnRed();            
    if(i % 2 == 1)
      ledOff();
    if(val < 500) { // taking the spot
      reserved = false;
      turnRed();
      Serial.println(1);
    } else {
      Serial.println(2);      
    }
  } else {
    if(val < 500) {
      turnRed();
      Serial.println(1);
    } else {
      turnGreen();    
      Serial.println(0);
    }
  }
  if(Serial.available() > 0) {
    byte v = Serial.read();
    if(v == 0x00) {
      reserved = false;
    } else {
      reserved = true;
    }
  }
  delay(100);
}