# Andon TEKCOM - Real-time Production Monitoring System

## 🏭 Tổng quan

Hệ thống Andon TEKCOM là giải pháp giám sát sản xuất thời gian thực, trực quan hóa trạng thái các trạm, ghi log sự kiện và tích hợp thông báo Microsoft Teams qua Power Automate. Hệ thống phù hợp cho nhà máy sản xuất hiện đại, hỗ trợ chuyển đổi số và nâng cao hiệu quả vận hành.

---

## 🚀 Tính năng nổi bật
- **Giám sát trạng thái 11 trạm sản xuất (S, C, P) theo thời gian thực**
- **Chuyển đổi trạng thái trạm (Bình thường, Cảnh báo, Lỗi, Bảo trì) trực tiếp trên dashboard**
- **Giao diện dashboard trực quan, realtime, tối ưu cho desktop và tablet**
- **Ghi log mọi sự kiện đổi trạng thái, reset, truy vết lịch sử**
- **Tích hợp gửi thông báo Teams qua Power Automate khi có sự kiện quan trọng**
- **Trang thống kê với timeline trạng thái từng trạm, chọn ngày, tooltip chi tiết**
- **Hỗ trợ mô phỏng trạm (Station Simulator) để kiểm thử realtime**
- **Tích hợp phần cứng Arduino/PLC dễ dàng**

---

## 🖥️ Kiến trúc hệ thống
- **Backend:** Node.js, Express, Socket.IO, MySQL
- **Frontend:** React.js, Material-UI, dayjs, Chart.js
- **Realtime:** Socket.IO
- **Thông báo:** Power Automate HTTP POST (Teams)
- **Phần cứng:** Arduino/PLC (Ethernet/WiFi)

---

## 📦 Cài đặt & Khởi động

### 1. Yêu cầu hệ thống
- Node.js >= 16
- MySQL >= 5.7

### 2. Clone & cài đặt
```bash
# Clone project
https://github.com/QuanK04/andon-system-tekcom.git
cd andon-system-tekcom

# Cài đặt backend
cd server
npm install

# Cài đặt frontend
cd ../client
npm install
```

### 3. Cấu hình database MySQL
- Tạo database `andon_db` và user phù hợp.
- Cập nhật thông tin kết nối trong `server/database/mysql.js`:
```js
const pool = mysql.createPool({
  host: 'localhost',
  user: 'andon_user',
  password: 'your_password',
  database: 'andon_db',
  ...
});
```
- Tạo bảng `stations` và `logs` (xem file `server/database/create_log_table.sql`):
```sql
CREATE TABLE logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(32) NOT NULL,
  time DATETIME DEFAULT CURRENT_TIMESTAMP,
  source VARCHAR(16) NOT NULL,
  station_id VARCHAR(16),
  old_status VARCHAR(16),
  new_status VARCHAR(16)
);
```

### 4. Khởi động hệ thống
```bash
# Chạy backend
cd server
npm start

# Chạy frontend
cd ../client
npm start
```
- Truy cập: http://localhost:3000

---

## ⚡ Tính năng UI/UX
- **Đổi trạng thái trạm realtime, tối ưu thao tác**
- **Box "Cảnh báo đang hoạt động" hiển thị các trạm bất thường **
- **Thống kê số lượng trạm theo từng trạng thái (bình thường, cảnh báo, lỗi, bảo trì)**
- **Timeline trạng thái các trạm**

---

## 🔔 Tích hợp Power Automate (Teams)
- Khi đổi trạng thái trạm hoặc reset tất cả, hệ thống gửi thông báo chuẩn hóa lên Teams qua Power Automate HTTP POST URL.
- Cú pháp tin nhắn:
  - `[ANDON] [HH:mm:ss DD/MM/YYYY] Trạm [Tên][Mã số] thay đổi trạng thái từ [Trạng thái cũ] thành [Trạng thái mới]`
  - `[ANDON] Tất cả các trạm được reset về trạng thái bình thường`
- Cấu hình URL và team/channel trong code backend (`server/socket/socketHandlers.js` và `server/index.js`).

---

## 🛠️ Tích hợp phần cứng
- Hỗ trợ kết nối Arduino/PLC qua Ethernet/WiFi.
- Xem hướng dẫn chi tiết tại `docs/hardware-integration-guide.md`.
- Ví dụ cấu hình trạm:
```js
{
  "S1": { name: "Chuyền treo", ip: "192.168.10.1", ... },
  "C1": { name: "Cắt ván", ip: "192.168.20.1", ... },
  ...
}
```
- Code mẫu Arduino: `hardware/arduino-station/station_arduino.ino`

---

## 🗃️ Database Schema
- **stations**: id, name, code, status, last_updated, ...
- **logs**: id, event_type, time, source, station_id, old_status, new_status

---

## 📑 Scripts & Lệnh hữu ích
- Backend: `npm start` / `npm run dev` (nodemon)
- Frontend: `npm start` / `npm run build`
- Reset trạng thái tất cả trạm: Nút trên dashboard
- Xem log: Truy vấn bảng `logs` hoặc qua API

---

## 💡 Gợi ý mở rộng
- Thêm phân quyền người dùng (admin/operator)
- Lịch sử timeline nhiều ngày, lọc theo khu vực
- Tích hợp báo cáo PDF, xuất Excel
- Tích hợp thêm thiết bị IoT khác

---

## 📄 License
MIT. See [LICENSE](LICENSE).

## 👤 Tác giả & Liên hệ
- Quan Nguyen (https://github.com/QuanK04)