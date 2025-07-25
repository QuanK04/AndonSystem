const net = require('net');
const EventEmitter = require('events');

class PLCConnector extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.connections = new Map();
        this.isConnected = false;
    }

    // Kết nối đến PLC
    async connectToPLC(stationId, plcConfig) {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            
            client.connect(plcConfig.port, plcConfig.ip, () => {
                console.log(`✅ Kết nối PLC thành công - Trạm ${stationId}`);
                this.connections.set(stationId, client);
                this.isConnected = true;
                resolve(client);
            });

            client.on('data', (data) => {
                this.handlePLCData(stationId, data);
            });

            client.on('error', (error) => {
                console.error(`❌ Lỗi kết nối PLC - Trạm ${stationId}:`, error);
                this.emit('plc-error', { stationId, error });
                reject(error);
            });

            client.on('close', () => {
                console.log(`🔌 Ngắt kết nối PLC - Trạm ${stationId}`);
                this.connections.delete(stationId);
                this.isConnected = false;
            });
        });
    }

    // Xử lý dữ liệu từ PLC
    handlePLCData(stationId, data) {
        try {
            // Giả lập dữ liệu từ PLC (trong thực tế sẽ parse theo protocol của PLC)
            const parsedData = this.parsePLCData(data);
            
            // Emit sự kiện trạng thái mới
            this.emit('station-status-change', {
                stationId,
                status: parsedData.status,
                lightStatus: parsedData.lightStatus,
                buttonPressed: parsedData.buttonPressed,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Lỗi xử lý dữ liệu PLC:', error);
        }
    }

    // Parse dữ liệu PLC (tùy theo loại PLC)
    parsePLCData(data) {
        // Giả lập - trong thực tế sẽ parse theo protocol cụ thể
        return {
            status: 'running', // running, stopped, maintenance
            lightStatus: {
                green: true,
                yellow: false,
                red: false
            },
            buttonPressed: {
                alert: false,
                reset: false,
                maintenance: false
            }
        };
    }

    // Điều khiển đèn
    async controlLight(stationId, lightType, state) {
        const client = this.connections.get(stationId);
        if (!client) {
            throw new Error(`Không tìm thấy kết nối PLC cho trạm ${stationId}`);
        }

        // Gửi lệnh điều khiển đèn đến PLC
        const command = this.buildLightCommand(lightType, state);
        client.write(command);
        
        console.log(`💡 Điều khiển đèn ${lightType} - Trạm ${stationId}: ${state}`);
    }

    // Tạo lệnh điều khiển đèn
    buildLightCommand(lightType, state) {
        // Tùy theo protocol của PLC cụ thể
        const commands = {
            green: state ? 'GREEN_ON' : 'GREEN_OFF',
            yellow: state ? 'YELLOW_ON' : 'YELLOW_OFF',
            red: state ? 'RED_ON' : 'RED_OFF'
        };
        return commands[lightType] || '';
    }

    // Đọc trạng thái nút bấm
    async readButtonStatus(stationId) {
        const client = this.connections.get(stationId);
        if (!client) {
            throw new Error(`Không tìm thấy kết nối PLC cho trạm ${stationId}`);
        }

        // Gửi lệnh đọc trạng thái nút
        const command = 'READ_BUTTONS';
        client.write(command);
    }

    // Ngắt kết nối
    disconnect(stationId) {
        const client = this.connections.get(stationId);
        if (client) {
            client.destroy();
            this.connections.delete(stationId);
        }
    }

    // Ngắt tất cả kết nối
    disconnectAll() {
        this.connections.forEach((client, stationId) => {
            client.destroy();
        });
        this.connections.clear();
        this.isConnected = false;
    }
}

module.exports = PLCConnector; 