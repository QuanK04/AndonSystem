# Smart Andon System for TEKCOM Kitchen Cabinet Manufacturing

A real-time monitoring and alert system for TEKCOM kitchen cabinet manufacturing plant with intelligent Andon capabilities.

## Key Features

- 🏭 **Real-time monitoring** of production stations (CNC, Edge Banding, Drilling, Assembly, QC, Packaging)
- 🚨 **4-level alert system**: Green, Yellow, Red, Blue
- 📊 **Visual dashboard** with factory layout and statistics
- ⚡ **Real-time communication** via Socket.IO
- 📱 **Responsive interface** for all devices
- 📈 **Reports and analytics** for production performance

## Project Structure

```
andon-system-tekcom/
├── server/          # Backend Node.js + Express + Socket.IO
├── client/          # Frontend React.js
├── database/        # SQLite database
└── docs/           # Technical documentation
```

## Installation and Setup

### System Requirements
- Node.js 16+
- npm or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/QuanK04/andon-system-tekcom.git
cd andon-system-tekcom

# Install all dependencies
npm run install-all
```

### Running the Application
```bash
# Run both backend and frontend
npm run dev

# Or run separately
npm run server    # Backend on port 5000
npm run client    # Frontend on port 3000
```

### Frontend Only Demo
```bash
# Run frontend with mock data (no backend required)
npm run frontend-only
```

## Monitored Production Stations

1. **CNC** - Wood cutting according to design
2. **Edge Banding** - Edge banding for wood panels
3. **Drilling** - Hole drilling for hinges and accessories
4. **Assembly** - Component assembly
5. **QC** - Quality control inspection
6. **Packaging** - Final product packaging

## Alert System

- 🟢 **Green**: Normal operation
- 🟡 **Yellow**: Minor warning (attention needed)
- 🔴 **Red**: Critical issue (immediate intervention required)
- 🔵 **Blue**: Scheduled maintenance

## API Endpoints

- `GET /api/stations` - Get station list
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert status
- `GET /api/statistics` - Production statistics

## Technologies Used

- **Backend**: Node.js, Express, Socket.IO, SQLite
- **Frontend**: React.js, Material-UI, Chart.js
- **Database**: SQLite
- **Real-time**: Socket.IO

## Demo Features

### Full System Demo
- Complete backend and frontend integration
- Real-time data updates via Socket.IO
- SQLite database with sample data
- All production stations monitored

### Frontend Only Demo
- Standalone React application
- Mock data and simulated real-time updates
- No backend required
- Perfect for quick testing and demonstrations

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/QuanK04/andon-system-tekcom.git
   cd andon-system-tekcom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the demo**
   ```bash
   # Full system demo
   npm run dev
   
   # Frontend only demo
   npm run frontend-only
   ```

4. **Access the application**
   - Full demo: http://localhost:3000
   - Frontend only: http://localhost:3000

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Quan Nguyen - [GitHub Profile](https://github.com/QuanK04)

## Acknowledgments

- TEKCOM Manufacturing for the use case
- Material-UI for the beautiful components
- Socket.IO for real-time communication