@echo off
echo ========================================
echo    Andon System - Frontend Demo Only
echo ========================================
echo.

echo [1/2] Cài đặt dependencies cho frontend...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Lỗi cài đặt frontend dependencies
    pause
    exit /b 1
)

echo.
echo [2/2] Khởi động frontend với mock data...
echo.
echo ========================================
echo    🎉 Frontend Demo đã được khởi động!
echo ========================================
echo.
echo 📊 Dashboard: http://localhost:3000
echo 🔌 Mock Data: Đang sử dụng dữ liệu mẫu
echo.
echo 💡 Hướng dẫn sử dụng:
echo   1. Mở trình duyệt và truy cập http://localhost:3000
echo   2. Xem sơ đồ xưởng và trạng thái các trạm
echo   3. Tạo cảnh báo mới bằng nút "Tạo Cảnh Báo"
echo   4. Thay đổi trạng thái trạm bằng menu 3 chấm
echo   5. Xác nhận và giải quyết cảnh báo
echo   6. Tất cả dữ liệu đều là mock data
echo.
echo ⚠️  Để dừng demo, nhấn Ctrl+C trong terminal
echo.

npm start 