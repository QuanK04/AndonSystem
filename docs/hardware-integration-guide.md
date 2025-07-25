# 🏭 Hướng dẫn tích hợp phần cứng - Hệ thống Andon TEKCOM

## 📋 Tổng quan

Hệ thống Andon TEKCOM được thiết kế để kết nối với các thiết bị thực tế tại các công đoạn sản xuất, bao gồm:
- **Đèn 3 màu**: Xanh (Bình thường), Vàng (Cảnh báo), Đỏ (Dừng máy)
- **Nút bấm**: Nút cảnh báo, nút reset, nút bảo trì

## 🔌 Kiến trúc kết nối

```
┌─────────────────┐    TCP/IP    ┌─────────────────┐    GPIO    ┌─────────────────┐
│   Server        │◄────────────►│   Arduino       │◄──────────►│   Đèn & Nút     │
│   (Backend)     │              │   (Trạm)        │            │   (Hardware)    │
└─────────────────┘              └─────────────────┘            └─────────────────┘
```

## 🛠️ Yêu cầu phần cứng

### Cho mỗi trạm sản xuất:

#### **Arduino + Ethernet Shield:**
- Arduino Uno/Mega + Ethernet Shield
- Hoặc Arduino Ethernet (có sẵn Ethernet)
- Hoặc ESP32 với WiFi/Ethernet

#### **Đèn LED:**
- 3 đèn LED màu: Xanh, Vàng, Đỏ
- Điện trở 220Ω cho mỗi đèn
- Breadboard và dây kết nối

#### **Nút bấm:**
- 3 nút bấm thường mở (NO)
- Điện trở 10kΩ pull-up
- Breadboard và dây kết nối

## 🔧 Sơ đồ mạch điện

```
Arduino Pin 13 ──[220Ω]──[LED Xanh]── GND
Arduino Pin 12 ──[220Ω]──[LED Vàng]── GND  
Arduino Pin 11 ──[220Ω]──[LED Đỏ]─── GND

Arduino Pin 7 ──[10kΩ]──[Nút Cảnh báo]── GND
Arduino Pin 6 ──[10kΩ]──[Nút Reset]──── GND
Arduino Pin 5 ──[10kΩ]──[Nút Bảo trì]── GND
```

## 📡 Cấu hình mạng

### **Server (Backend):**
- IP: `192.168.1.100`
- Port: `5000` (HTTP API)
- Port: `3001` (Socket.IO)

### **Các trạm sản xuất:**
```
Trạm 001 (Cắt gỗ):     192.168.1.101
Trạm 002 (Khoan lỗ):   192.168.1.102  
Trạm 003 (Phủ bề mặt): 192.168.1.103
Trạm 004 (Lắp ráp):    192.168.1.104
Trạm 005 (Kiểm tra):   192.168.1.105
Trạm 006 (Đóng gói):   192.168.1.106
```

## 🚀 Triển khai từng bước

### **Bước 1: Chuẩn bị phần cứng**

1. **Lắp ráp mạch điện:**
   - Kết nối 3 đèn LED với các pin 11, 12, 13
   - Kết nối 3 nút bấm với các pin 5, 6, 7
   - Thêm điện trở phù hợp

2. **Cấu hình mạng:**
   - Cấu hình IP tĩnh cho Arduino
   - Đảm bảo kết nối mạng ổn định

### **Bước 2: Upload code Arduino**

1. **Cài đặt thư viện:**
   ```cpp
   #include <Ethernet.h>
   #include <SPI.h>
   ```

2. **Cấu hình IP:**
   ```cpp
   byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
   IPAddress serverIP(192, 168, 1, 100);
   ```

3. **Upload code từ file:** `hardware/arduino-station/station_arduino.ino`

### **Bước 3: Cấu hình server**

1. **Cập nhật cấu hình trạm:**
   - Chỉnh sửa file `server/config/stations-config.js`
   - Cập nhật IP và thông tin trạm

2. **Khởi động server:**
   ```bash
   cd server
   npm install
   npm start
   ```

### **Bước 4: Kiểm tra kết nối**

1. **Kiểm tra kết nối trạm:**
   ```bash
   curl http://localhost:5000/api/hardware/stations/status
   ```

2. **Điều khiển đèn test:**
   ```bash
   curl -X POST http://localhost:5000/api/hardware/stations/station_001/light \
        -H "Content-Type: application/json" \
        -d '{"color": "red"}'
   ```

## 📊 API Endpoints

### **Lấy trạng thái:**
- `GET /api/hardware/stations/status` - Tất cả trạm
- `GET /api/hardware/stations/:stationId/status` - Trạm cụ thể

### **Điều khiển đèn:**
- `POST /api/hardware/stations/:stationId/light`
  ```json
  {
    "color": "green|yellow|red"
  }
  ```

### **Điều khiển hàng loạt:**
- `POST /api/hardware/stations/lights/bulk`
  ```json
  {
    "color": "red",
    "stationIds": ["station_001", "station_002"]
  }
  ```

### **Quản lý kết nối:**
- `POST /api/hardware/stations/:stationId/connect` - Kết nối lại
- `POST /api/hardware/stations/:stationId/disconnect` - Ngắt kết nối
- `GET /api/hardware/stations/:stationId/connection` - Kiểm tra kết nối

## 🔍 Troubleshooting

### **Lỗi kết nối mạng:**
1. Kiểm tra cáp mạng
2. Kiểm tra IP và subnet mask
3. Ping test giữa Arduino và server

### **Lỗi đèn không sáng:**
1. Kiểm tra kết nối dây
2. Kiểm tra điện trở
3. Test từng pin riêng lẻ

### **Lỗi nút bấm:**
1. Kiểm tra điện trở pull-up
2. Kiểm tra debounce time
3. Test với Serial Monitor

### **Lỗi giao tiếp:**
1. Kiểm tra port và IP
2. Kiểm tra firewall
3. Test với telnet

## 📱 Giao diện điều khiển

### **Dashboard:**
- Hiển thị trạng thái real-time của tất cả trạm
- Điều khiển đèn trực tiếp từ giao diện
- Thông báo khi có sự kiện từ trạm

### **Settings:**
- Cấu hình IP và port cho từng trạm
- Thiết lập thời gian timeout
- Quản lý kết nối

## 🔒 Bảo mật

### **Mạng:**
- Sử dụng VLAN riêng cho hệ thống Andon
- Cấu hình firewall chỉ cho phép kết nối cần thiết
- Monitoring lưu lượng mạng

### **Phần mềm:**
- Validate tất cả input từ client
- Rate limiting cho API calls
- Logging tất cả hoạt động

## 📈 Monitoring

### **Health Check:**
- Kiểm tra kết nối định kỳ
- Ping test tự động
- Alert khi mất kết nối

### **Performance:**
- Monitor response time
- Track số lượng kết nối
- Log errors và exceptions

## 🎯 Lưu ý quan trọng

1. **Backup cấu hình:** Luôn backup file cấu hình trước khi thay đổi
2. **Test môi trường:** Test đầy đủ trước khi triển khai production
3. **Documentation:** Cập nhật tài liệu khi có thay đổi
4. **Training:** Đào tạo nhân viên sử dụng hệ thống
5. **Maintenance:** Lên lịch bảo trì định kỳ

## 📞 Hỗ trợ

Nếu gặp vấn đề, liên hệ:
- **Email:** support@tekcom.com
- **Hotline:** 1900-xxxx
- **Documentation:** https://docs.tekcom.com/andon 