# Smart TV Deployer

A modern web application for deploying Tizen applications to Samsung Smart TVs. This tool provides a user-friendly interface for connecting to Samsung TVs and deploying `.wgt` applications.

## Features

- 🔌 **Easy TV Connection**: Connect to Samsung Smart TVs using their IP address
- 🛠️ **Configurable Paths**: Set custom paths for SDB and Tizen executables
- 📦 **App Deployment**: Deploy `.wgt` applications to connected TVs
- 📝 **Detailed Logging**: Real-time logs for connection, installation, and launch processes
- 💾 **Configuration Persistence**: Saves TV IP address and tool paths for future use
- 🎨 **Modern UI**: Clean and responsive interface built with Next.js and Tailwind CSS

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download) installed
- A Samsung Smart TV with Developer Mode enabled
- The TV and your computer must be on the same network

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart-tv-deployer.git
   cd smart-tv-deployer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### TV Setup

1. Enable Developer Mode on your Samsung TV:
   - Go to Settings > System > Developer options
   - Enable Developer mode
   - Note down the TV's IP address

2. Install Tizen Studio:
   - Download and install [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download)
   - The default installation paths are:
     - macOS: `/Users/<username>/tizen-studio/tools/sdb` and `/Users/<username>/tizen-studio/tools/ide/bin/tizen`
     - Windows: `C:\tizen-studio\tools\sdb.exe` and `C:\tizen-studio\tools\ide\bin\tizen.bat`

### Application Setup

1. Configure the paths:
   - Enter the full path to your `sdb` executable
   - Enter the full path to your `tizen` executable
   - These paths will be saved in your browser's localStorage

2. Enter your TV's IP address:
   - The IP address will be saved for future use
   - You can test the connection using the "Test Connection" button

## Usage

1. **Connect to TV**:
   - Enter your TV's IP address
   - Click "Test Connection" to verify connectivity
   - A successful connection will be indicated in the logs

2. **Deploy Application**:
   - Click "Choose File" to select your `.wgt` file
   - Click "Deploy to TV" to start the deployment process
   - Monitor the progress in the logs section

3. **View Logs**:
   - All operations are logged in real-time
   - Logs include connection status, installation progress, and launch information
   - Use the "Clear logs" button to reset the log display

## Development

### Project Structure

```
smart-tv-deployer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deploy/
│   │   │   │   └── route.ts
│   │   │   └── test-connection/
│   │   │       └── route.ts
│   │   ├── config.ts
│   │   └── page.tsx
│   └── ...
├── public/
└── ...
```

### Key Components

- `page.tsx`: Main application UI and logic
- `config.ts`: Configuration management
- `api/deploy/route.ts`: Deployment API endpoint
- `api/test-connection/route.ts`: Connection testing API endpoint

### Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Verify the TV's IP address
   - Ensure the TV and computer are on the same network
   - Check if Developer Mode is enabled on the TV

2. **Deployment Failed**:
   - Verify the `.wgt` file is valid
   - Check if the TV has enough storage space
   - Ensure the application is compatible with your TV's Tizen version

3. **Path Issues**:
   - Verify the paths to `sdb` and `tizen` executables
   - Use absolute paths
   - Check file permissions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download)
