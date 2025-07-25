const express = require('express');
const router = express.Router();

// Middleware để inject stationController
let stationController;

function setStationController(controller) {
    stationController = controller;
}

// Lấy trạng thái tất cả trạm
router.get('/stations/status', (req, res) => {
    try {
        if (!stationController) {
            return res.status(500).json({ error: 'StationController chưa được khởi tạo' });
        }

        const status = stationController.getAllStationsStatus();
        res.json({
            success: true,
            data: status,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Lỗi lấy trạng thái trạm:', error);
        res.status(500).json({ error: 'Lỗi lấy trạng thái trạm' });
    }
});

// Lấy trạng thái một trạm cụ thể
router.get('/stations/:stationId/status', (req, res) => {
    try {
        if (!stationController) {
            return res.status(500).json({ error: 'StationController chưa được khởi tạo' });
        }

        const { stationId } = req.params;
        const status = stationController.getStationStatus(stationId);
        
        if (!status) {
            return res.status(404).json({ error: 'Không tìm thấy trạm' });
        }

        res.json({
            success: true,
            data: status,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Lỗi lấy trạng thái trạm:', error);
        res.status(500).json({ error: 'Lỗi lấy trạng thái trạm' });
    }
});

// Điều khiển đèn tại trạm
router.post('/stations/:stationId/light', (req, res) => {
    try {
        if (!stationController) {
            return res.status(500).json({ error: 'StationController chưa được khởi tạo' });
        }

        const { stationId } = req.params;
        const { color } = req.body;

        if (!color || !['green', 'yellow', 'red'].includes(color)) {
            return res.status(400).json({ 
                error: 'Màu đèn không hợp lệ. Chỉ chấp nhận: green, yellow, red' 
            });
        }

        stationController.controlLight(stationId, color)
            .then(() => {
                res.json({
                    success: true,
                    message: `Đã điều khiển đèn ${color} tại trạm ${stationId}`,
                    timestamp: new Date()
                });
            })
            .catch(error => {
                console.error('Lỗi điều khiển đèn:', error);
                res.status(500).json({ error: error.message });
            });

    } catch (error) {
        console.error('Lỗi điều khiển đèn:', error);
        res.status(500).json({ error: 'Lỗi điều khiển đèn' });
    }
});

// Reset nút bấm tại trạm
router.post('/stations/:stationId/reset-button', (req, res) => {
    try {
        if (!stationController) {
            return res.status(500).json({ error: 'StationController chưa được khởi tạo' });
        }

        const { stationId } = req.params;

        stationController.resetButton(stationId)
            .then(() => {
                res.json({
                    success: true,
                    message: `Đã reset nút bấm tại trạm ${stationId}`,
                    timestamp: new Date()
                });
            })
            .catch(error => {
                console.error('Lỗi reset nút bấm:', error);
                res.status(500).json({ error: error.message });
            });

    } catch (error) {
        console.error('Lỗi reset nút bấm:', error);
        res.status(500).json({ error: 'Lỗi reset nút bấm' });
    }
});

// Kết nối lại đến trạm
router.post('/stations/:stationId/connect', (req, res) => {
    try {
        if (!stationController) {
            return res.status(500).json({ error: 'StationController chưa được khởi tạo' });
        }

        const { stationId } = req.params;

        stationController.connectToStation(stationId)
            .then(() => {
                res.json({
                    success: true,
                    message: `Đã kết nối lại đến trạm ${stationId}`,
                    timestamp: new Date()
                });
            })
            .catch(error => {
                console.error('Lỗi kết nối trạm:', error);
                res.status(500).json({ error: error.message });
            });

    } catch (error) {
        console.error('Lỗi kết nối trạm:', error);
        res.status(500).json({ error: 'Lỗi kết nối trạm' });
    }
});

// Ngắt kết nối trạm
router.post('/stations/:stationId/disconnect', (req, res) => {
    try {
        if (!stationController) {
            return res.status(500).json({ error: 'StationController chưa được khởi tạo' });
        }

        const { stationId } = req.params;

        stationController.disconnectStation(stationId);
        
        res.json({
            success: true,
            message: `Đã ngắt kết nối trạm ${stationId}`,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Lỗi ngắt kết nối trạm:', error);
        res.status(500).json({ error: 'Lỗi ngắt kết nối trạm' });
    }
});

// Kiểm tra kết nối trạm
router.get('/stations/:stationId/connection', (req, res) => {
    try {
        if (!stationController) {
            return res.status(500).json({ error: 'StationController chưa được khởi tạo' });
        }

        const { stationId } = req.params;
        const isConnected = stationController.isStationConnected(stationId);

        res.json({
            success: true,
            data: {
                stationId,
                connected: isConnected,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Lỗi kiểm tra kết nối:', error);
        res.status(500).json({ error: 'Lỗi kiểm tra kết nối' });
    }
});

// Điều khiển tất cả đèn cùng lúc
router.post('/stations/lights/bulk', (req, res) => {
    try {
        if (!stationController) {
            return res.status(500).json({ error: 'StationController chưa được khởi tạo' });
        }

        const { color, stationIds } = req.body;

        if (!color || !['green', 'yellow', 'red'].includes(color)) {
            return res.status(400).json({ 
                error: 'Màu đèn không hợp lệ. Chỉ chấp nhận: green, yellow, red' 
            });
        }

        if (!stationIds || !Array.isArray(stationIds)) {
            return res.status(400).json({ error: 'Danh sách trạm không hợp lệ' });
        }

        const promises = stationIds.map(stationId => 
            stationController.controlLight(stationId, color)
        );

        Promise.all(promises)
            .then(() => {
                res.json({
                    success: true,
                    message: `Đã điều khiển đèn ${color} tại ${stationIds.length} trạm`,
                    affectedStations: stationIds,
                    timestamp: new Date()
                });
            })
            .catch(error => {
                console.error('Lỗi điều khiển đèn hàng loạt:', error);
                res.status(500).json({ error: 'Lỗi điều khiển đèn hàng loạt' });
            });

    } catch (error) {
        console.error('Lỗi điều khiển đèn hàng loạt:', error);
        res.status(500).json({ error: 'Lỗi điều khiển đèn hàng loạt' });
    }
});

module.exports = { router, setStationController }; 