/*
 * Arduino Code cho Trạm Sản Xuất TEKCOM
 * Điều khiển đèn 3 màu và nút bấm
 * Kết nối với server qua TCP/IP
 */

#include <Ethernet.h>
#include <SPI.h>

// Cấu hình mạng
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress serverIP(192, 168, 1, 100); // IP của server
int serverPort = 5000;

// Cấu hình đèn
const int GREEN_LIGHT_PIN = 13;
const int YELLOW_LIGHT_PIN = 12; 
const int RED_LIGHT_PIN = 11;

// Cấu hình nút bấm
const int ALERT_BUTTON_PIN = 7;
const int RESET_BUTTON_PIN = 6;
const int MAINTENANCE_BUTTON_PIN = 5;

// Biến trạng thái
String currentStatus = "green";
String lastButtonPressed = "";
unsigned long lastButtonTime = 0;
const unsigned long DEBOUNCE_TIME = 200; // 200ms debounce

// Kết nối Ethernet
EthernetClient client;

void setup() {
  // Khởi tạo Serial để debug
  Serial.begin(9600);
  Serial.println("🚀 Khởi động Trạm Sản Xuất TEKCOM");
  
  // Khởi tạo đèn
  pinMode(GREEN_LIGHT_PIN, OUTPUT);
  pinMode(YELLOW_LIGHT_PIN, OUTPUT);
  pinMode(RED_LIGHT_PIN, OUTPUT);
  
  // Khởi tạo nút bấm
  pinMode(ALERT_BUTTON_PIN, INPUT_PULLUP);
  pinMode(RESET_BUTTON_PIN, INPUT_PULLUP);
  pinMode(MAINTENANCE_BUTTON_PIN, INPUT_PULLUP);
  
  // Bật đèn xanh mặc định
  setLightStatus("green");
  
  // Khởi tạo Ethernet
  if (Ethernet.begin(mac) == 0) {
    Serial.println("❌ Không thể cấu hình Ethernet");
    while (true);
  }
  
  Serial.print("✅ IP Address: ");
  Serial.println(Ethernet.localIP());
  
  // Kết nối đến server
  connectToServer();
}

void loop() {
  // Kiểm tra kết nối server
  if (!client.connected()) {
    Serial.println("🔌 Mất kết nối server, thử kết nối lại...");
    connectToServer();
  }
  
  // Đọc trạng thái nút bấm
  checkButtons();
  
  // Xử lý dữ liệu từ server
  if (client.available()) {
    String command = client.readStringUntil('\n');
    command.trim();
    processServerCommand(command);
  }
  
  // Gửi trạng thái định kỳ
  static unsigned long lastStatusTime = 0;
  if (millis() - lastStatusTime > 5000) { // Gửi mỗi 5 giây
    sendStatus();
    lastStatusTime = millis();
  }
  
  delay(100); // Delay nhỏ để ổn định
}

// Kết nối đến server
void connectToServer() {
  Serial.print("🔗 Kết nối đến server: ");
  Serial.print(serverIP);
  Serial.print(":");
  Serial.println(serverPort);
  
  if (client.connect(serverIP, serverPort)) {
    Serial.println("✅ Kết nối server thành công");
    sendStatus(); // Gửi trạng thái ban đầu
  } else {
    Serial.println("❌ Không thể kết nối server");
  }
}

// Kiểm tra nút bấm
void checkButtons() {
  unsigned long currentTime = millis();
  
  // Nút cảnh báo
  if (digitalRead(ALERT_BUTTON_PIN) == LOW && currentTime - lastButtonTime > DEBOUNCE_TIME) {
    lastButtonPressed = "alert";
    lastButtonTime = currentTime;
    Serial.println("🔴 Nút cảnh báo được nhấn");
    sendButtonPress("alert");
  }
  
  // Nút reset
  if (digitalRead(RESET_BUTTON_PIN) == LOW && currentTime - lastButtonTime > DEBOUNCE_TIME) {
    lastButtonPressed = "reset";
    lastButtonTime = currentTime;
    Serial.println("🔄 Nút reset được nhấn");
    sendButtonPress("reset");
    setLightStatus("green"); // Reset về trạng thái xanh
  }
  
  // Nút bảo trì
  if (digitalRead(MAINTENANCE_BUTTON_PIN) == LOW && currentTime - lastButtonTime > DEBOUNCE_TIME) {
    lastButtonPressed = "maintenance";
    lastButtonTime = currentTime;
    Serial.println("🔧 Nút bảo trì được nhấn");
    sendButtonPress("maintenance");
  }
}

// Điều khiển đèn
void setLightStatus(String status) {
  // Tắt tất cả đèn
  digitalWrite(GREEN_LIGHT_PIN, LOW);
  digitalWrite(YELLOW_LIGHT_PIN, LOW);
  digitalWrite(RED_LIGHT_PIN, LOW);
  
  // Bật đèn tương ứng
  if (status == "green") {
    digitalWrite(GREEN_LIGHT_PIN, HIGH);
    Serial.println("💚 Bật đèn xanh");
  } else if (status == "yellow") {
    digitalWrite(YELLOW_LIGHT_PIN, HIGH);
    Serial.println("💛 Bật đèn vàng");
  } else if (status == "red") {
    digitalWrite(RED_LIGHT_PIN, HIGH);
    Serial.println("❤️ Bật đèn đỏ");
  }
  
  currentStatus = status;
}

// Gửi trạng thái đến server
void sendStatus() {
  if (client.connected()) {
    String statusMessage = "STATUS:" + currentStatus;
    client.println(statusMessage);
    Serial.println("📤 Gửi trạng thái: " + statusMessage);
  }
}

// Gửi thông tin nút bấm
void sendButtonPress(String buttonType) {
  if (client.connected()) {
    String buttonMessage = "STATUS:" + currentStatus + "|BUTTON:" + buttonType;
    client.println(buttonMessage);
    Serial.println("📤 Gửi nút bấm: " + buttonMessage);
  }
}

// Xử lý lệnh từ server
void processServerCommand(String command) {
  Serial.println("📥 Nhận lệnh từ server: " + command);
  
  if (command.startsWith("SET_LIGHT:")) {
    String lightColor = command.substring(10);
    setLightStatus(lightColor);
  } else if (command == "RESET_BUTTON") {
    lastButtonPressed = "";
    Serial.println("🔄 Reset nút bấm");
  } else if (command == "PING") {
    client.println("PONG");
    Serial.println("🏓 Phản hồi PING");
  }
}

// Hàm tiện ích để nhấp nháy đèn
void blinkLight(String color, int times) {
  int pin;
  if (color == "green") pin = GREEN_LIGHT_PIN;
  else if (color == "yellow") pin = YELLOW_LIGHT_PIN;
  else if (color == "red") pin = RED_LIGHT_PIN;
  else return;
  
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(200);
    digitalWrite(pin, LOW);
    delay(200);
  }
} 