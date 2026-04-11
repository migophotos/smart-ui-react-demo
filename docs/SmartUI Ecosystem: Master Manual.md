# SmartUI Ecosystem: Master Manual

Welcome to the SmartUI Ecosystem. This manual explains the architecture of the library, how the different modules interact with each other, and how to integrate them seamlessly into both pure HTML/JS environments and modern React applications.

## 1. Architecture Overview

SmartUI is a high-performance, pure SVG-based data visualization and UI control library. It is built on a robust Object-Oriented architecture wrapped in native Web Components (Custom Elements v1).

The ecosystem consists of three main layers:
1. **The Core Engine (`SmartWidgets`):** The base class that provides common utilities (SVG generation, math, string compression, theming).
2. **Global Managers:** Singletons that manage the ecosystem's state across all widgets.
   * `window.SmartHeap`: The global garbage collector and registry. It keeps track of every widget instance and runs the central event loop (`setInterval`) for realtime data emulation and fetching.
   * `window.StateToColors`: A global map connecting numeric states (e.g., `0`, `1`, `2`) to specific hex colors. 
   * `window.SmartTooltip`: A global, floating SVG container that listens to mouse events from any registered widget and renders highly complex data-driven tooltips (including mini-charts and scales).
3. **The Widgets:** Derived classes (`SmartBar`, `SmartPie`, `SmartPolygon`, `SmartGauge`, `SmartPalette`, `SmartColorSelector`) that handle specific SVG rendering logic.

## 2. Inter-Module Connectivity

The true power of SmartUI lies in how these modules talk to each other without tight coupling:

* **State-to-Color Synchronization:** If you render a `<smart-ui-pie>` and a `<smart-ui-bar>`, both can map their data to a `state` (e.g., `state: "1"`). If you also render a `<smart-ui-palette>` on the same page with `isGlobalColors: 1`, any color adjustment made by the user in the Palette will instantly update the `window.StateToColors` registry. The pie and the bar will immediately change their colors without any additional code.
* **Global Tooltips:** Widgets do not draw their own tooltips. Instead, they format their current payload and pass it to `SmartTooltip.showTooltip(data)`. The tooltip parses the `targets`, draws the necessary mini-diagrams, and calculates its position to avoid clipping off-screen.

## 3. Pure HTML/JS Integration

Because every widget is a Web Component, you can use them in pure HTML simply by including the scripts and writing the corresponding tags. The `opt` configurations can be passed via hyphenated CSS variables or data attributes.

// ==========================================
// code_example_01
// ==========================================
<!-- index.html -->
<html>
<head>
  <!-- Load the core library and widgets -->
  <script src="/js/smartwidgets.js"></script>
  <script src="/js/smartbar.js"></script>
  <script src="/js/smarttooltip.js"></script>
  <style>
    .my-bar {
      --stbar-type: discrete;
      --stbar-length: 200;
      --stbar-thickness: 20;
      --stbar-var-fill-color: #cccccc;
    }
  </style>
</head>
<body>
  <!-- Declarative instantiation -->
  <smart-ui-bar id="server-cpu" class="my-bar"></smart-ui-bar>

  <script>
    // Imperative update via Global Manager
    document.addEventListener("DOMContentLoaded", () => {
      window.SmartHeap.get("server-cpu").update({
        target: { uuid: "server-cpu", value: "75", max: "100", color: "#ff0000" }
      });
    });
  </script>
</body>
</html>


## 4. React Integration (The Universal Wrapper)

To use imperative Web Components inside a declarative framework like React, we use a single Universal Wrapper component and a Custom Hook. You do not need a separate React component for each widget type.

### 4.1. The Hook (`useSmartWidget`)
The hook takes the React state (declarative data) and transforms it into the specific payload structure required by the `SmartWidgets` base class, calling `ctrl.update(payload)` under the hood.

// ==========================================
// code_example_02
// ==========================================
// src/hooks/useSmartWidget.js
import { useEffect } from 'react';

export const useSmartWidget = (ref, id, targetData, options) => {
  const targetStr = JSON.stringify(targetData);
  const optionsStr = JSON.stringify(options);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const payload = { opt: { ...options } };

    // Format payload based on whether widget expects array (Pie/Gauge) or object (Bar/Polygon)
    if (Array.isArray(targetData)) {
      payload.targets = targetData;
    } else if (targetData) {
      payload.target = { uuid: id, ...targetData };
    }

    // Direct update bypassing the heap for maximum performance
    if (typeof el.getCtrl === 'function') {
      const ctrl = el.getCtrl();
      if (ctrl && typeof ctrl.update === 'function') {
        ctrl.update(payload);
        return;
      }
    }
    
    // Fallback to Global Heap Manager
    if (window.SmartHeap) {
      const ctrl = window.SmartHeap.get(id);
      if (ctrl && typeof ctrl.update === 'function') {
        ctrl.update(payload);
      }
    }
  },[id, targetStr, optionsStr]);
};



### 4.2. The Component (`SmartWidget`)
The component accepts an `elementTag` prop (e.g., `"smart-ui-gauge"`) and dynamically renders the correct Custom Element.

// ==========================================
// code_example_03
// ==========================================
// src/components/SmartWidget.jsx
import React, { useRef } from 'react';
import { useSmartWidget } from '../hooks/useSmartWidget';

const SmartWidget = ({ 
  elementTag = "smart-ui-bar", 
  id, 
  className = '', 
  target, 
  opt = {} 
}) => {
  const widgetRef = useRef(null);

  // The hook handles all the heavy lifting
  useSmartWidget(widgetRef, id, target, opt);

  // Render the specific Custom Element tag dynamically
  const CustomTag = elementTag;

  return (
    <CustomTag ref={widgetRef} id={id} class={className}>
      Browser does not support custom elements.
    </CustomTag>
  );
};
export default SmartWidget;



## 5. The Data Payload Structure

When updating widgets dynamically (via React or pure JS), the payload usually contains two main objects:
* `opt`: Dynamic configuration (e.g., changing radius, stroke width, or orientation on the fly).
* `target` (or `targets`): The operational data.

Widgets like `SmartBar` and `SmartPolygon` expect a single `target` object. Widgets like `SmartPie` and `SmartGauge` expect an array of `targets`.

// ==========================================
// code_example_04
// ==========================================
// Example Payload for a Multi-Scale Gauge
const gaugePayload = {
  opt: {
    bT: 3, // Body Type
    bR: 150 // Radius
    // Note: scales configuration is usually passed on init, but can be overridden here
  },
  targets:[
    {
      uuid: "s1", // Binds to Scale 1
      value: 85,
      legend: "Speed",
      color: "#ff0000"
    },
    {
      uuid: "s2", // Binds to Scale 2 (e.g., inner RPM dial)
      value: 4000,
      legend: "RPM"
    }
  ]
};



## 6. Building a Complete Dashboard

By combining the Universal React Wrapper, the state-driven widgets (Bar, Pie, Gauge), and the control widgets (Palette, ColorSelector), you can build a highly interactive dashboard.

When the user interacts with standard HTML inputs (sliders, dropdowns), React updates the `target` data, causing the widgets to animate to their new values. When the user interacts with the SmartUI Palette, the global `StateToColors` updates, recoloring the entire dashboard instantly.

// ==========================================
// code_example_05
// ==========================================
// src/App.jsx (Complete Dashboard Example)
import React, { useState } from 'react';
import SmartWidget from './components/SmartWidget';

export default function Dashboard() {
  const [metric, setMetric] = useState(65);

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      
      {/* Controls */}
      <div style={{ flex: 1 }}>
        <h3>Controls</h3>
        <input 
          type="range" min="0" max="100" value={metric} 
          onChange={(e) => setMetric(Number(e.target.value))} 
        />
        
        {/* SmartPalette automatically updates global StateToColors mapping! */}
        <SmartWidget 
          elementTag="smart-ui-palette" 
          id="global-palette"
          opt={{ isGlobalColors: 1 }}
        />
      </div>

      {/* Visualizations */}
      <div style={{ flex: 2, display: 'flex', gap: '20px' }}>
        
        {/* Bar Widget reacting to state */}
        <SmartWidget 
          elementTag="smart-ui-bar" 
          id="dash-bar"
          target={{ value: metric, state: metric > 80 ? "3" : "1" }}
        />

        {/* Hierarchical Pie Widget reacting to state */}
        <SmartWidget 
          elementTag="smart-ui-pie" 
          id="dash-pie"
          target={[
            { uuid: "main1", value: metric, state: "1" },
            { uuid: "main2", value: 100 - metric, state: "2" },
            { uuid: "sub1", parent: "main1", value: metric * 0.5, state: "3" }
          ]}
          opt={{ type: "rel", isLegend: 1 }}
        />
      </div>
    </div>
  );
}