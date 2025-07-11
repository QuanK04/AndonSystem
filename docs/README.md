# Smart Andon System - Technical Documentation

## Overview

The Smart Andon System is a real-time monitoring and alert management solution designed specifically for TEKCOM kitchen cabinet manufacturing. It provides comprehensive oversight of production stations with intelligent alerting capabilities.

## Architecture

### Backend Architecture
- **Node.js** with Express.js framework
- **Socket.IO** for real-time bidirectional communication
- **SQLite** database for data persistence
- **RESTful API** endpoints for CRUD operations

### Frontend Architecture
- **React.js** with functional components and hooks
- **Material-UI** for consistent and modern UI components
- **Chart.js** for data visualization
- **Socket.IO Client** for real-time updates

## Database Schema

### Stations Table
```sql
CREATE TABLE stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'green',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);
```

### Alerts Table
```sql
CREATE TABLE alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at DATETIME,
    resolved_at DATETIME,
    FOREIGN KEY (station_id) REFERENCES stations (id)
);
```

## API Reference

### Stations API

#### GET /api/stations
Returns all production stations with their current status.

**Response:**
```json
[
  {
    "id": 1,
    "name": "CNC",
    "status": "green",
    "last_updated": "2025-01-11T10:30:00Z",
    "description": "Wood cutting station"
  }
]
```

#### PUT /api/stations/:id/status
Updates the status of a specific station.

**Request Body:**
```json
{
  "status": "yellow",
  "message": "Maintenance required"
}
```

### Alerts API

#### GET /api/alerts
Returns all alerts with optional filtering.

**Query Parameters:**
- `status`: Filter by alert status (active, acknowledged, resolved)
- `station_id`: Filter by station ID
- `type`: Filter by alert type

#### POST /api/alerts
Creates a new alert.

**Request Body:**
```json
{
  "station_id": 1,
  "type": "warning",
  "message": "Machine temperature high"
}
```

#### PUT /api/alerts/:id
Updates an alert status.

**Request Body:**
```json
{
  "status": "acknowledged",
  "message": "Technician notified"
}
```

### Statistics API

#### GET /api/statistics
Returns production statistics and metrics.

**Response:**
```json
{
  "total_stations": 6,
  "active_alerts": 2,
  "uptime_percentage": 95.5,
  "daily_production": 150,
  "station_status": {
    "green": 4,
    "yellow": 1,
    "red": 1
  }
}
```

## Real-time Events

### Socket.IO Events

#### Client to Server
- `join_station`: Join a specific station's updates
- `leave_station`: Leave a station's updates
- `create_alert`: Create a new alert
- `update_alert`: Update an alert status
- `update_station`: Update station status

#### Server to Client
- `station_update`: Station status changed
- `alert_created`: New alert created
- `alert_updated`: Alert status updated
- `statistics_update`: Statistics updated

## Alert System

### Alert Types
1. **Green** - Normal operation
2. **Yellow** - Warning (attention needed)
3. **Red** - Critical (immediate intervention)
4. **Blue** - Maintenance (scheduled)

### Alert Lifecycle
1. **Created** - Alert is generated
2. **Active** - Alert is pending acknowledgment
3. **Acknowledged** - Alert has been seen by operator
4. **Resolved** - Issue has been fixed

## Production Stations

### Station Details

#### 1. CNC Station
- **Function**: Wood cutting according to design specifications
- **Equipment**: CNC router, cutting tools
- **Common Issues**: Tool wear, material jams, calibration errors

#### 2. Edge Banding Station
- **Function**: Applying edge banding to wood panels
- **Equipment**: Edge banding machine, adhesive system
- **Common Issues**: Adhesive failure, banding misalignment

#### 3. Drilling Station
- **Function**: Hole drilling for hinges and accessories
- **Equipment**: Multi-spindle drilling machine
- **Common Issues**: Drill bit breakage, positioning errors

#### 4. Assembly Station
- **Function**: Component assembly and joining
- **Equipment**: Assembly jigs, fastening tools
- **Common Issues**: Missing parts, assembly errors

#### 5. QC Station
- **Function**: Quality control inspection
- **Equipment**: Measuring tools, inspection equipment
- **Common Issues**: Quality defects, measurement errors

#### 6. Packaging Station
- **Function**: Final product packaging
- **Equipment**: Packaging materials, labeling system
- **Common Issues**: Packaging material shortage, labeling errors

## Frontend Components

### Core Components

#### Dashboard
- Real-time station status display
- Factory layout visualization
- Quick alert overview
- Performance metrics

#### Alert Management
- Alert creation interface
- Alert status updates
- Alert history and filtering
- Bulk operations

#### Statistics
- Production performance charts
- Uptime analysis
- Trend visualization
- Export capabilities

#### Settings
- System configuration
- User preferences
- Alert thresholds
- Notification settings

## Deployment

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

### Production Deployment
1. Build the frontend: `npm run build`
2. Set up environment variables
3. Configure database
4. Deploy to production server

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Security Considerations

- Input validation on all API endpoints
- SQL injection prevention with parameterized queries
- CORS configuration for frontend-backend communication
- Rate limiting for API endpoints
- Secure Socket.IO configuration

## Performance Optimization

- Database indexing on frequently queried columns
- Socket.IO room management for efficient updates
- React component optimization with memoization
- Lazy loading for large datasets
- Caching strategies for static data

## Troubleshooting

### Common Issues

#### Database Connection
- Check SQLite file permissions
- Verify database path configuration
- Ensure proper file locking

#### Socket.IO Connection
- Check CORS configuration
- Verify client-server URL matching
- Monitor network connectivity

#### Frontend Build Issues
- Clear node_modules and reinstall
- Check React version compatibility
- Verify Material-UI dependencies

## Contributing

Please read the main README.md file for contribution guidelines and development setup instructions.

## Support

For technical support or questions, please create an issue on the GitHub repository or contact the development team. 