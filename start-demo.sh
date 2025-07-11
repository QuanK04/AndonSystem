#!/bin/bash

echo "========================================"
echo "   Hệ thống Andon TEKCOM - Demo"
echo "========================================"
echo

echo "[1/4] Cài đặt dependencies cho backend..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Lỗi cài đặt backend dependencies"
    exit 1
fi

echo
echo "[2/4] Cài đặt dependencies cho frontend..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Lỗi cài đặt frontend dependencies"
    exit 1
fi

echo
echo "[3/4] Khởi động backend server..."
cd ../server
gnome-terminal --title="Andon Backend" -- npm run dev &
BACKEND_PID=$!

echo
echo "[4/4] Khởi động frontend..."
cd ../client
sleep 3
gnome-terminal --title="Andon Frontend" -- npm start &
FRONTEND_PID=$!

echo
echo "========================================"
echo "   🎉 Demo đã được khởi động!"
echo "========================================"
echo
echo "📊 Dashboard: http://localhost:3000"
echo "🔌 Backend API: http://localhost:5000"
echo "📚 API Docs: http://localhost:5000/health"
echo
echo "💡 Hướng dẫn sử dụng:"
echo "  1. Mở trình duyệt và truy cập http://localhost:3000"
echo "  2. Xem sơ đồ xưởng và trạng thái các trạm"
echo "  3. Tạo cảnh báo mới bằng nút 'Tạo Cảnh Báo'"
echo "  4. Thay đổi trạng thái trạm bằng menu 3 chấm"
echo "  5. Xác nhận và giải quyết cảnh báo"
echo
echo "⚠️  Để dừng demo, nhấn Ctrl+C"
echo

# Wait for user to stop
trap "echo 'Đang dừng demo...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait 