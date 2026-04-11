# SmartUI React Interactive Builder ⚛️ + 📊

Welcome to the **SmartUI React Builder** – an interactive showcase and wrapper for the **SmartUI Ecosystem**. 

SmartUI is a high-performance, pure SVG-based data visualization and UI control library originally built on vanilla JavaScript and Custom Web Components (v1). This repository demonstrates how to seamlessly bridge a highly optimized imperative graphic engine with modern declarative React using a Universal Custom Hook.

## ✨ Key Features

* **Universal React Wrapper:** A single `<SmartWidget />` component that dynamically renders any SmartUI widget, drastically reducing boilerplate.
* **Pure SVG Rendering:** Complex trigonometry, arcs, polygons, and gauges are drawn natively in SVG. Zero dependencies on heavy canvas libraries.
* **Positional Compression Engine:** Themes and presets are stored using a highly optimized positional encoding system (e.g., `stbar-.-.-discrete-ver-up-65...`), saving memory and network traffic.
* **Global State Managers:** Built-in `SmartHeap` garbage collector and `StateToColors` map that sync color themes across multiple widgets instantly.
* **Real-time Interactive Builder:** A React-powered GUI that uses `MutationObserver` to watch custom UI elements and dynamically regenerate React/JSON code snippets on the fly.

## 🧩 Included Widgets

The ecosystem includes a rich set of highly customizable widgets:

1. **SmartBar (`<smart-ui-bar>`)**: Advanced discrete/solid progress bars with threshold zones and trend lines.
2. **SmartPie (`<smart-ui-pie>`)**: Multi-level hierarchical pie and donut charts supporting complex relational data.
3. **SmartPolygon (`<smart-ui-polygon>`)**: Dynamic regular polygons and star shapes acting as filling progress indicators.
4. **SmartGauge (`<smart-ui-gauge>`)**: Complex multi-scale speedometers with customizable pointers, ticks, and dials.
5. **SmartPalette (`<smart-ui-palette>`)**: An interactive, pure SVG color theme manager.
6. **SmartColorSelector (`<smart-ui-colorsel>`)**: A native SVG HSL/RGB color picker with keyboard input support.
7. **SmartTooltip (`<smart-ui-tooltip>`)**: A global, draggable, floating SVG tooltip system that can render mini-diagrams, scales, and iframes inside itself.

## 🚀 Getting Started (Local Development)

To run the Interactive Builder locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/migophotos/smart-ui-react-demo.git
   cd smart-ui-react-demo
2. **Install dependencies:**
    ```bash
    npm install
3. **Start the development server:**
    ```bash
    npm run dev
4. Open your browser and navigate to http://localhost:5173/ to explore the Interactive Builder.


# 🏗 Architecture Overview
Instead of creating a separate React component for each widget, this project uses a powerful Universal Hook Pattern:
useSmartWidget.js: Analyzes the incoming React state (Props) and transforms it into the specific payload structure (opt and targets) expected by the SmartWidgets base class. It bypasses React's virtual DOM to update the SVG nodes directly via the controller's update() method for maximum performance.
SmartWidget.jsx: The UI wrapper that renders the required Custom HTML Element (e.g., <smart-ui-pie>) and binds the hook to its ref.
📜 License
This project and the underlying SmartUI library are licensed under the MIT License.
Copyright © 2018-2026 Michael Goyberg. All rights reserved.

