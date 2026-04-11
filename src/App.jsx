/**
 * Main Dashboard Application Component.
 * 
 * Demonstrates the usage of the Universal SmartWidget wrapper to control 
 * different Web Components (SmartBar and SmartPie) from a single React state.
 * 
 * It showcases real-time data binding, where moving the slider dynamically
 * updates both the discrete bar and the complex hierarchical pie chart.
 */

import { useState } from 'react';
import SmartWidget from './components/SmartWidget';
import './App.css';

function App() {
  // Shared React state to control the widgets. 
  // 'val' represents the main metric (from 0 to 100).
  const [val, setVal] = useState(60);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* 
        CSS Variables initialization for the widgets.
        NOTE: '--stbar-is-run: 0' disables the internal emulation timer 
        so React has full control over the data rendering.
      */}
      <style>{`
        .hor-dots {
          --stbar-type: discrete;
          --stbar-thickness: 18;
          --stbar-length: 300;
          --stbar-is-run: 0; 
          --stbar-value-rule: both;
          --stbar-var-stroke-color: #008000;
          --stbar-state-colors: 0#0096ff,1#00f900,2#fffc79,3#ff2600;
        }
        .pie-style {
          /* You can add default CSS variables for pie here if needed */
          --stpie-var-stroke-color: #ffffff;
        }
      `}</style>

      <h1>SmartUI React Dashboard</h1>
      
      {/* --- CONTROL PANEL --- */}
      <div style={{ marginBottom: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h3>Global Data Control</h3>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          Adjust Metric Value: <strong>{val}</strong>
        </label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={val} 
          onChange={(e) => setVal(Number(e.target.value))} 
          style={{ width: '100%' }}
        />
      </div>

      {/* --- WIDGETS DISPLAY AREA --- */}
      <div style={{ display: 'flex', gap: '50px', justifyContent: 'center', flexWrap: 'wrap' }}>
        
        {/* 1. SMART BAR WIDGET */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3>SmartBar Widget</h3>
          <SmartWidget 
            elementTag="smart-ui-bar"
            id="dash-bar-01"
            className="hor-dots"
            target={{
              value: String(val),
              max: "100",
              state: val > 80 ? "3" : "0", // Turns red (state 3) if value exceeds 80
              trends: "80#ff0000",
              thr: "25#0096ff,50#00f900,75#fffc79,100#ff2600"
            }}
            opt={{
              orient: "hor",
              isShowThr: 1,
              isShowTrends: 1
            }}
          />
        </div>

        {/* 2. SMART PIE WIDGET */}
        <div style={{ flex: 1, minWidth: '400px' }}>
          <h3>SmartPie (Hierarchical)</h3>
          <SmartWidget 
            elementTag="smart-u i-pie" 
            id="dash-pie-01"
            className="pie-style"
            target={[
              // Main targets (dynamically recalculating based on the slider)
              { uuid: "main-1", legend: "Active", value: val, color: "#0096ff" },
              { uuid: "main-2", legend: "Inactive", value: 100 - val, color: "#fffc79" },
              
              // Sub-targets attached to 'main-1' (relational link via 'parent')
              { uuid: "sub-1", parent: "main-1", legend: "Process A", value: val * 0.6, color: "#00f900" },
              { uuid: "sub-2", parent: "main-1", legend: "Process B", value: val * 0.4, color: "#00cc00" },
              
              // Sub-targets attached to 'main-2'
              { uuid: "sub-3", parent: "main-2", legend: "Idle", value: (100 - val) * 0.8, color: "#ff9900" },
              { uuid: "sub-4", parent: "main-2", legend: "Offline", value: (100 - val) * 0.2, color: "#ff3300" }
            ]}
            opt={{
              type: "rel",             // 'rel' enables multi-level hierarchical pie mode
              radius: 120,             // Primary radius
              varStrokeColor: "#fff",  // White borders between slices
              varStrokeWidth: 2,
              isAnimate: 1,            // Smooth CSS transitions expanding from center
              isLegend: 1              // Displays the interactive sidebar legend
            }}
          />
        </div>

      </div>
    </div>
  );
}

export default App;