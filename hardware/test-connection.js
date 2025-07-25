#!/usr/bin/env node

/**
 * Script test kết nối với các trạm sản xuất
 * Sử dụng: node hardware/test-connection.js
 */

const net = require('net');
const { stationsConfig } = require('../server/config/stations-config');

// Màu cho console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test kết nối TCP đến một trạm
function testStationConnection(stationId, config) {
    return new Promise((resolve) => {
        const client = new net.Socket();
        const timeout = 5000; // 5 giây timeout
        
        const timer = setTimeout(() => {
            client.destroy();
            resolve({ stationId, connected: false, error: 'Timeout' });
        }, timeout);

        client.connect(config.port, config.ip, () => {
            clearTimeout(timer);
            client.destroy();
            resolve({ stationId, connected: true, error: null });
        });

        client.on('error', (error) => {
            clearTimeout(timer);
            client.destroy();
            resolve({ stationId, connected: false, error: error.message });
        });
    });
}

// Test điều khiển đèn
async function testLightControl(stationId, config) {
    return new Promise((resolve) => {
        const client = new net.Socket();
        const timeout = 5000;
        
        const timer = setTimeout(() => {
            client.destroy();
            resolve({ stationId, success: false, error: 'Timeout' });
        }, timeout);

        client.connect(config.port, config.ip, () => {
            // Gửi lệnh điều khiển đèn đỏ
            const command = 'SET_LIGHT:red\n';
            client.write(command);
            
            setTimeout(() => {
                clearTimeout(timer);
                client.destroy();
                resolve({ stationId, success: true, error: null });
            }, 1000);
        });

        client.on('error', (error) => {
            clearTimeout(timer);
            client.destroy();
            resolve({ stationId, success: false, error: error.message });
        });
    });
}

// Test API server
async function testAPIServer() {
    try {
        const response = await fetch('http://localhost:5000/health');
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Main test function
async function runTests() {
    log('\n🔍 BẮT ĐẦU KIỂM TRA KẾT NỐI HỆ THỐNG ANDON TEKCOM', 'cyan');
    log('=' .repeat(60), 'cyan');
    
    // Test 1: Kiểm tra API Server
    log('\n📡 Test 1: Kiểm tra API Server', 'yellow');
    const apiTest = await testAPIServer();
    if (apiTest.success) {
        log(`✅ API Server hoạt động: ${apiTest.data.service}`, 'green');
    } else {
        log(`❌ API Server không khả dụng: ${apiTest.error}`, 'red');
        log('💡 Hãy khởi động server trước: npm run server', 'yellow');
    }
    
    // Test 2: Kiểm tra kết nối các trạm
    log('\n🏭 Test 2: Kiểm tra kết nối các trạm sản xuất', 'yellow');
    
    const connectionTests = [];
    for (const [stationId, config] of Object.entries(stationsConfig)) {
        log(`\n🔗 Đang kiểm tra ${config.name} (${config.ip}:${config.port})...`, 'blue');
        const result = await testStationConnection(stationId, config);
        connectionTests.push(result);
        
        if (result.connected) {
            log(`✅ Kết nối thành công: ${config.name}`, 'green');
        } else {
            log(`❌ Kết nối thất bại: ${config.name} - ${result.error}`, 'red');
        }
    }
    
    // Test 3: Test điều khiển đèn
    log('\n💡 Test 3: Kiểm tra điều khiển đèn', 'yellow');
    
    const connectedStations = connectionTests.filter(test => test.connected);
    if (connectedStations.length > 0) {
        log(`\n🎯 Test điều khiển đèn cho ${connectedStations.length} trạm đã kết nối...`, 'blue');
        
        for (const test of connectedStations) {
            const config = stationsConfig[test.stationId];
            log(`\n💡 Đang test đèn đỏ tại ${config.name}...`, 'blue');
            
            const lightTest = await testLightControl(test.stationId, config);
            if (lightTest.success) {
                log(`✅ Điều khiển đèn thành công: ${config.name}`, 'green');
            } else {
                log(`❌ Điều khiển đèn thất bại: ${config.name} - ${lightTest.error}`, 'red');
            }
        }
    } else {
        log('⚠️ Không có trạm nào kết nối để test điều khiển đèn', 'yellow');
    }
    
    // Tổng kết
    log('\n📊 TỔNG KẾT KẾT QUẢ TEST', 'cyan');
    log('=' .repeat(40), 'cyan');
    
    const totalStations = Object.keys(stationsConfig).length;
    const connectedCount = connectionTests.filter(test => test.connected).length;
    
    log(`\n🏭 Tổng số trạm: ${totalStations}`, 'bright');
    log(`✅ Kết nối thành công: ${connectedCount}`, 'green');
    log(`❌ Kết nối thất bại: ${totalStations - connectedCount}`, 'red');
    log(`📊 Tỷ lệ thành công: ${((connectedCount / totalStations) * 100).toFixed(1)}%`, 'bright');
    
    if (apiTest.success) {
        log(`\n📡 API Server: ✅ Hoạt động`, 'green');
    } else {
        log(`\n📡 API Server: ❌ Không khả dụng`, 'red');
    }
    
    // Khuyến nghị
    log('\n💡 KHUYẾN NGHỊ', 'yellow');
    log('=' .repeat(20), 'yellow');
    
    if (connectedCount === 0) {
        log('🔧 Cần kiểm tra:', 'red');
        log('  1. Cấu hình IP và port của các trạm', 'bright');
        log('  2. Kết nối mạng giữa server và trạm', 'bright');
        log('  3. Arduino đã được upload code chưa', 'bright');
        log('  4. Firewall có chặn kết nối không', 'bright');
    } else if (connectedCount < totalStations) {
        log('🔧 Cần kiểm tra các trạm chưa kết nối:', 'yellow');
        connectionTests
            .filter(test => !test.connected)
            .forEach(test => {
                const config = stationsConfig[test.stationId];
                log(`  - ${config.name}: ${test.error}`, 'bright');
            });
    } else {
        log('🎉 Tất cả trạm đã kết nối thành công!', 'green');
        log('🚀 Hệ thống sẵn sàng hoạt động', 'green');
    }
    
    log('\n📖 Để biết thêm chi tiết, xem: docs/hardware-integration-guide.md', 'cyan');
    log('\n' + '=' .repeat(60), 'cyan');
}

// Chạy test nếu được gọi trực tiếp
if (require.main === module) {
    runTests().catch(error => {
        log(`\n❌ Lỗi khi chạy test: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { runTests, testStationConnection, testLightControl }; 