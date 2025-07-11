@echo off
echo ========================================
echo    Hệ thống Andon TEKCOM - Demo
echo ========================================
echo.

echo [1/4] Cài đặt dependencies cho backend...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Lỗi cài đặt backend dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Cài đặt dependencies cho frontend...
cd ../client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Lỗi cài đặt frontend dependencies
    pause
    exit /b 1
)

echo.
echo [3/4] Khởi động backend server...
cd ../server
start "Andon Backend" cmd /k "npm run dev"

echo.
echo [4/4] Khởi động frontend...
cd ../client
timeout /t 3 /nobreak >nul
start "Andon Frontend" cmd /k "npm start"

echo.
echo ========================================
echo    🎉 Demo đã được khởi động!
echo ========================================
echo.
echo 📊 Dashboard: http://localhost:3000
echo 🔌 Backend API: http://localhost:5000
echo 📚 API Docs: http://localhost:5000/health
echo.
echo 💡 Hướng dẫn sử dụng:
echo   1. Mở trình duyệt và truy cập http://localhost:3000
echo   2. Xem sơ đồ xưởng và trạng thái các trạm
echo   3. Tạo cảnh báo mới bằng nút "Tạo Cảnh Báo"
echo   4. Thay đổi trạng thái trạm bằng menu 3 chấm
echo   5. Xác nhận và giải quyết cảnh báo
echo.
echo ⚠️  Để dừng demo, đóng các cửa sổ terminal
echo.
pause 