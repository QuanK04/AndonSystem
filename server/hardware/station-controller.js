const net = require('net');
const EventEmitter = require('events');

class StationController extends EventEmitter {
    constructor() {
        super();
        this.stations = new Map(); // Lưu trữ thông tin các trạm
        this.connections = new Map(); // Kết nối đến các trạm
        this.stationStatus = new Map(); // Trạng thái hiện tại của các trạm
    }

    // Thêm trạm mới
    addStation(stationId, config) {
        const station = {
            id: stationId,
            name: config.name,
            location: config.location,
            ip: config.ip,
            port: config.port || 8080,
            status: 'green', // green, yellow, red
            lastUpdate: new Date()
        };

        this.stations.set(stationId, station);
        this.stationStatus.set(stationId, {
            lightStatus: 'green',
            buttonPressed: null,
            lastButtonPress: null
        });

        console.log(`🏭 Thêm trạm mới: ${station.name} (${stationId})`);
        return station;
    }

    // Kết nối đến trạm
    async connectToStation(stationId) {
        const station = this.stations.get(stationId);
        if (!station) {
            throw new Error(`Không tìm thấy trạm ${stationId}`);
        }

        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            
            client.connect(station.port, station.ip, () => {
                console.log(`✅ Kết nối thành công đến trạm ${station.name} (${stationId})`);
                this.connections.set(stationId, client);
                resolve(client);
            });

            client.on('data', (data) => {
                this.handleStationData(stationId, data);
            });

            client.on('error', (error) => {
                console.error(`❌ Lỗi kết nối trạm ${stationId}:`, error);
                this.emit('station-error', { stationId, error });
                reject(error);
            });

            client.on('close', () => {
                console.log(`🔌 Ngắt kết nối trạm ${stationId}`);
                this.connections.delete(stationId);
                this.updateStationStatus(stationId, 'disconnected');
            });
        });
    }

    // Xử lý dữ liệu từ trạm
    handleStationData(stationId, data) {
        try {
            const message = data.toString().trim();
            console.log(`📨 Dữ liệu từ trạm ${stationId}: ${message}`);
            
            // Parse dữ liệu từ trạm
            const parsedData = this.parseStationMessage(message);
            
            if (parsedData) {
                this.updateStationStatus(stationId, parsedData);
            }
        } catch (error) {
            console.error('Lỗi xử lý dữ liệu trạm:', error);
        }
    }

    // Parse tin nhắn từ trạm
    parseStationMessage(message) {
        // Format tin nhắn: STATUS:color|BUTTON:button_type
        // Ví dụ: "STATUS:red|BUTTON:alert" hoặc "STATUS:green"
        
        const parts = message.split('|');
        const result = {};

        parts.forEach(part => {
            const [key, value] = part.split(':');
            if (key === 'STATUS') {
                result.lightStatus = value; // green, yellow, red
            } else if (key === 'BUTTON') {
                result.buttonPressed = value; // alert, reset, maintenance
                result.lastButtonPress = new Date();
            }
        });

        return result;
    }

    // Cập nhật trạng thái trạm
    updateStationStatus(stationId, data) {
        const currentStatus = this.stationStatus.get(stationId) || {};
        const station = this.stations.get(stationId);
        
        // Cập nhật trạng thái
        const newStatus = {
            ...currentStatus,
            ...data,
            lastUpdate: new Date()
        };

        this.stationStatus.set(stationId, newStatus);
        
        // Cập nhật trạng thái trong database
        station.status = newStatus.lightStatus;
        station.lastUpdate = newStatus.lastUpdate;

        // Emit sự kiện thay đổi trạng thái
        this.emit('station-status-change', {
            stationId,
            stationName: station.name,
            status: newStatus.lightStatus,
            buttonPressed: newStatus.buttonPressed,
            lastButtonPress: newStatus.lastButtonPress,
            timestamp: newStatus.lastUpdate
        });

        console.log(`🔄 Cập nhật trạng thái trạm ${stationId}: ${newStatus.lightStatus}`);
    }

    // Điều khiển đèn từ server
    async controlLight(stationId, color) {
        const client = this.connections.get(stationId);
        if (!client) {
            throw new Error(`Không tìm thấy kết nối trạm ${stationId}`);
        }

        if (!['green', 'yellow', 'red'].includes(color)) {
            throw new Error('Màu đèn không hợp lệ. Chỉ chấp nhận: green, yellow, red');
        }

        // Gửi lệnh điều khiển đèn
        const command = `SET_LIGHT:${color}`;
        client.write(command + '\n');
        
        console.log(`💡 Điều khiển đèn ${color} - Trạm ${stationId}`);
        
        // Cập nhật trạng thái
        this.updateStationStatus(stationId, { lightStatus: color });
    }

    // Reset nút bấm
    async resetButton(stationId) {
        const client = this.connections.get(stationId);
        if (!client) {
            throw new Error(`Không tìm thấy kết nối trạm ${stationId}`);
        }

        const command = 'RESET_BUTTON';
        client.write(command + '\n');
        
        console.log(`🔄 Reset nút bấm - Trạm ${stationId}`);
        
        // Cập nhật trạng thái
        this.updateStationStatus(stationId, { 
            buttonPressed: null,
            lastButtonPress: null 
        });
    }

    // Lấy trạng thái hiện tại của trạm
    getStationStatus(stationId) {
        return this.stationStatus.get(stationId);
    }

    // Lấy trạng thái tất cả trạm
    getAllStationsStatus() {
        const status = {};
        this.stations.forEach((station, stationId) => {
            status[stationId] = {
                ...station,
                ...this.stationStatus.get(stationId)
            };
        });
        return status;
    }

    // Ngắt kết nối trạm
    disconnectStation(stationId) {
        const client = this.connections.get(stationId);
        if (client) {
            client.destroy();
            this.connections.delete(stationId);
            console.log(`🔌 Ngắt kết nối trạm ${stationId}`);
        }
    }

    // Ngắt tất cả kết nối
    disconnectAll() {
        this.connections.forEach((client, stationId) => {
            client.destroy();
        });
        this.connections.clear();
        console.log('🔌 Ngắt tất cả kết nối trạm');
    }

    // Kiểm tra kết nối trạm
    isStationConnected(stationId) {
        return this.connections.has(stationId);
    }
}

module.exports = StationController; 