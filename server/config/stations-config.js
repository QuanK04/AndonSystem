// Cấu hình các trạm sản xuất theo khu vực mới
const stationsConfig = {
    // Khu sơn (S)
    "S1": {
        name: "Chuyền treo",
        location: "Khu Sơn",
        ip: "192.168.10.1",
        port: 8080,
        description: "Chuyền treo sơn",
        equipment: "",
        operator: ""
    },
    "S2": {
        name: "UV ván",
        location: "Khu Sơn",
        ip: "192.168.10.2",
        port: 8080,
        description: "Sơn UV cho ván",
        equipment: "",
        operator: ""
    },
    "S3": {
        name: "Chuyền Cefla",
        location: "Khu Sơn",
        ip: "192.168.10.3",
        port: 8080,
        description: "Chuyền sơn Cefla",
        equipment: "",
        operator: ""
    },
    "S4": {
        name: "Chà nhám bề mặt",
        location: "Khu Sơn",
        ip: "192.168.10.4",
        port: 8080,
        description: "Chà nhám bề mặt sản phẩm",
        equipment: "",
        operator: ""
    },

    // Khu Carcass (C)
    "C1": {
        name: "Cắt ván",
        location: "Khu Carcass",
        ip: "192.168.20.1",
        port: 8080,
        description: "Cắt ván theo kích thước",
        equipment: "",
        operator: ""
    },
    "C2": {
        name: "Tạo rãnh",
        location: "Khu Carcass",
        ip: "192.168.20.2",
        port: 8080,
        description: "Tạo rãnh trên ván",
        equipment: "",
        operator: ""
    },
    "C3": {
        name: "Khoan lỗ",
        location: "Khu Carcass",
        ip: "192.168.20.3",
        port: 8080,
        description: "Khoan lỗ trên ván",
        equipment: "",
        operator: ""
    },
    "C4": {
        name: "Dán biên",
        location: "Khu Carcass",
        ip: "192.168.20.4",
        port: 8080,
        description: "Dán biên ván",
        equipment: "",
        operator: ""
    },

    // Khu đóng gói (P)
    "P1": {
        name: "Line 1",
        location: "Khu Đóng Gói",
        ip: "192.168.30.1",
        port: 8080,
        description: "Dây chuyền đóng gói Line 1",
        equipment: "",
        operator: ""
    },
    "P2": {
        name: "Line 2",
        location: "Khu Đóng Gói",
        ip: "192.168.30.2",
        port: 8080,
        description: "Dây chuyền đóng gói Line 2",
        equipment: "",
        operator: ""
    },
    "P3": {
        name: "Lắp ráp",
        location: "Khu Đóng Gói",
        ip: "192.168.30.3",
        port: 8080,
        description: "Khu vực lắp ráp sản phẩm",
        equipment: "",
        operator: ""
    }
};

// Cấu hình mạng
const networkConfig = {
    serverIP: "192.168.1.100",
    serverPort: 5000,
    socketPort: 3001,
    timeout: 5000, // 5 giây timeout
    retryInterval: 3000, // 3 giây retry
    maxRetries: 3
};

// Cấu hình đèn và nút bấm
const hardwareConfig = {
    lights: {
        green: {
            pin: 13, // GPIO pin cho đèn xanh
            description: "Trạng thái bình thường"
        },
        yellow: {
            pin: 12, // GPIO pin cho đèn vàng  
            description: "Trạng thái cảnh báo"
        },
        red: {
            pin: 11, // GPIO pin cho đèn đỏ
            description: "Trạng thái dừng máy"
        }
    },
    buttons: {
        alert: {
            pin: 7, // GPIO pin cho nút cảnh báo
            description: "Báo cáo vấn đề"
        },
        reset: {
            pin: 6, // GPIO pin cho nút reset
            description: "Reset trạng thái"
        },
        maintenance: {
            pin: 5, // GPIO pin cho nút bảo trì
            description: "Báo bảo trì"
        }
    }
};

// Cấu hình thông báo
const notificationConfig = {
    alertThresholds: {
        yellow: 30, // 30 giây - chuyển sang vàng
        red: 60     // 60 giây - chuyển sang đỏ
    },
    autoReset: {
        enabled: true,
        delay: 300000 // 5 phút tự động reset
    },
    soundAlerts: {
        enabled: true,
        volume: 80
    }
};

module.exports = {
    stationsConfig,
    networkConfig, 
    hardwareConfig,
    notificationConfig
}; 