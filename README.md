# TaskTracer

TaskTracer is a web application designed to monitor the usage of system resources, including CPU and memory utilization for both the entire system and individual processes. The application features a responsive interface that seamlessly adapts to different devices and screen sizes.

## Features

- Monitor system-wide CPU and memory usage.
- Monitor specific processes by PID.
- Toggle between dark and light mode.
- Option to put the computer to sleep or shut it down.

## Technologies Used

- Node.js
- Express
- React
- Bootstrap
- pidusage
- os-utils

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/TaskTracer.git
    ```
2. Navigate to the project directory:
    ```sh
    cd TaskTracer
    ```
3. Install server dependencies:
    ```sh
    npm install
    ```
4. Navigate to the client directory and install dependencies:
    ```sh
    cd client
    npm install
    ```
5. Build the React application:
    ```sh
    npm run build
    ```
6. Start the server:
    ```sh
    cd ..
    npm start
    ```

## Usage

1. Open your web browser and go to `http://localhost:3000`.
2. Enter a PID to monitor a specific process or view system-wide resource usage.
3. Toggle between dark and light mode using the theme button.
4. Use the sleep or shutdown buttons to put the computer to sleep or shut it down.

## Responsiveness

The application uses Bootstrap and custom CSS to ensure responsiveness. It adapts to various screen sizes and devices, providing a seamless user experience across desktops, tablets, and mobile devices.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any features, bug fixes, or improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Authors

- Damian Grubecki [@IVDamianVI](https://github.com/ivdamianvi)
- Maciej Ludwiczak [@Ermac14](https://github.com/ermac14)

## Acknowledgements

Special thanks to all the open-source contributors whose libraries and tools helped build this project.
