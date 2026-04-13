# SmartUI Dashboard Builder Architecture

This document describes the architecture of the fully interactive, React-based Drag-and-Drop Dashboard Builder for the SmartUI Ecosystem.

## 1. Layout & UI Structure

The Builder is divided into four main areas:
1. **Top Toolbar (`TopBar`)**: Contains global actions (Save, Load, Export to HTML) and a "Recent Widgets" quick-access panel (LIFO queue saved in local storage).
2. **Left Panel (`Accordion Library`)**: Displays categories of available widgets. Widgets here are draggable items.
3. **Center Panel (`Canvas`)**: The interactive drop zone. Widgets can be freely dragged around, repositioned, and selected.
4. **Right Panel (`Settings Panel`)**: Context-aware properties editor. When a widget on the Canvas is selected, this panel dynamically generates sliders and inputs to modify its configuration in real-time.

## 2. Global State Management (React)

Instead of relying on heavy DOM queries, the entire dashboard is represented by a single React State array called `canvasWidgets`. 


Each item in this array is a simple object containing:
* The unique widget ID.
* The widget type (e.g., smart-ui-bar).
* The X and Y coordinates on the canvas.
* The `opt` object (visual settings).
* The `target` object (operational data).

When a user drags a widget from the Accordion to the Canvas, a new object is pushed to this array. When the user moves a widget, its X and Y coordinates are updated. When the user uses the Right Panel, the `opt` object of the selected widget is updated.

## 3. Drag and Drop (DnD) Implementation

We use the native HTML5 Drag and Drop API.
* **From Library to Canvas**: The dragged item serializes its preset data into the data transfer object. The Canvas reads this data on drop, calculates the relative drop coordinates, and spawns the widget.
* **Within Canvas**: Widgets on the canvas are wrapped in an absolute positioned container with the draggable property. Dragging them updates their coordinates in real-time.

```javascript
// ==========================================
// code_example_01: Constants & Presets (Library)
// ==========================================
// src/constants/library.js
// We extract the presets from your smartwidgets.types.js and categorize them.
export const WIDGET_LIBRARY = {
  bars:[
    { label: 'Horizontal Bar', tag: 'smart-ui-bar', opt: { orient: 'hor', type: 'discrete', thickness: 24, length: 150, isShadow: 1 } },
    { label: 'Vertical Bar', tag: 'smart-ui-bar', opt: { orient: 'ver', type: 'solid', aligning: 'up', thickness: 20, length: 150 } },
    { label: 'Thresholds Bar', tag: 'smart-ui-bar', opt: { thickness: 16, length: 150, valueRule: 'both', isFillStroke: 0, isShowThr: 1 } }
  ],
  pies:[
    { label: 'Donut Chart', tag: 'smart-ui-pie', opt: { type: 'donut', innerRadius: 25, radius: 50, isAnimate: 1 } },
    { label: 'Relative Pie', tag: 'smart-ui-pie', opt: { type: 'rel', radius: 50, varStrokeWidth: 2, varStrokeColor: '#ffffff' } }
  ],
  polygons:[
    { label: 'Star 5', tag: 'smart-ui-polygon', opt: { anglesNumber: 5, isStar: 1, innerRadius: 50, radius: 50, valueRule: 'none', colorRule: 'fill' } },
    { label: 'Hexagon', tag: 'smart-ui-polygon', opt: { anglesNumber: 6, radius: 50, valueRule: 'fill', colorRule: 'stroke' } }
  ]
};


## 4. Standalone HTML Export (The Magic Trick)

One of the most powerful features is the ability to export the current React Canvas state into a pure Vanilla HTML file. 
Since SmartUI uses Custom Web Components, we do not need to bundle React into the exported file! We simply generate a string containing:
1. A style block converting the widget options into CSS variables.
2. Absolute positioned wrapper elements matching the Canvas coordinates.
3. The custom SmartUI tags inside the wrappers.
4. A small Vanilla JS script utilizing the global SmartHeap manager to inject the target data.

The Builder creates a Blob from this string and triggers an automatic file download as an HTML file.

// ==========================================
// code_example_02: HTML Exporter Generator
// ==========================================
// src/utils/exporter.js
export const exportToHTML = (canvasWidgets) => {
  let cssBlock = '';
  let htmlBlock = '';
  let jsBlock = '';

  canvasWidgets.forEach(w => {
    // 1. Generate CSS Variables
    const alias = w.tag.replace('smart-ui-', 'st').replace('polygon', 'pgn'); // smart-ui-bar -> stbar
    let cssVars = '';
    for (const [key, value] of Object.entries(w.opt)) {
      const cssKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      cssVars += `      --${alias}-${cssKey}: ${value};\n`;
    }
    cssBlock += `    #${w.id} {\n${cssVars}    }\n`;

    // 2. Generate HTML Elements with Absolute Positioning
    htmlBlock += `
    <div style="position: absolute; left: ${w.x}px; top: ${w.y}px;">
      <${w.tag} id="${w.id}" class="${w.id}"></${w.tag}>
    </div>`;

    // 3. Generate JS Initialization data
    jsBlock += `
      window.SmartHeap.get('${w.id}').update({
        target: ${JSON.stringify(w.target)}
      });`;
  });

  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SmartUI Exported Dashboard</title>
  <!-- Link your library scripts here -->
  <script src="js/smartwidgets.js"></script>
  <script src="js/smartbar.js"></script>
  <script src="js/smartpie.js"></script>
  <script src="js/smartpolygon.js"></script>
  <style>
    body { background-color: #2b2b2b; color: white; margin: 0; position: relative; height: 100vh; overflow: hidden; }
${cssBlock}
  </style>
</head>
<body>
${htmlBlock}

  <script>
    document.addEventListener('DOMContentLoaded', () => {
${jsBlock}
    });
  </script>
</body>
</html>`;

  // Create a Blob and trigger download
  const blob = new Blob([fullHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'smartui_dashboard.html';
  a.click();
};


## 5. Full Application Code

The main application integrates all these components. It handles the state, renders the Grid layout, and passes the specific update functions to the Settings Panel and Canvas.

// ==========================================
// code_example_03: The Main Builder Component
// ==========================================
// src/DashboardBuilder.jsx
import React, { useState, useRef, useEffect } from 'react';
import SmartWidget from './components/SmartWidget';
import { WIDGET_LIBRARY } from './constants/library';
import { exportToHTML } from './utils/exporter';

export default function DashboardBuilder() {
  const [widgets, setWidgets] = useState([]);
  const[selectedId, setSelectedId] = useState(null);
  const [recentWidgets, setRecentWidgets] = useState([]);
  
  const canvasRef = useRef(null);

  // --- DRAG AND DROP HANDLERS ---
  
  // Fired when dragging an item FROM THE LIBRARY
  const handleDragStartLibrary = (e, preset) => {
    e.dataTransfer.setData('new_widget', JSON.stringify(preset));
  };

  // Fired when dragging an item that is ALREADY ON CANVAS
  const handleDragStartCanvas = (e, id, currentX, currentY) => {
    e.stopPropagation();
    e.dataTransfer.setData('move_widget', JSON.stringify({ id, offsetX: e.clientX - currentX, offsetY: e.clientY - currentY }));
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const dropX = e.clientX - canvasRect.left;
    const dropY = e.clientY - canvasRect.top;

    // Case 1: Dropping a NEW widget from the library
    const newWidgetData = e.dataTransfer.getData('new_widget');
    if (newWidgetData) {
      const preset = JSON.parse(newWidgetData);
      const newId = `wdg-${Date.now()}`;
      
      const newWidget = {
        id: newId,
        tag: preset.tag,
        x: dropX - 50, // center offset roughly
        y: dropY - 50,
        opt: preset.opt,
        target: { value: 65, max: 100 } // Default mock data
      };

      setWidgets([...widgets, newWidget]);
      setSelectedId(newId);

      // Update Recent Widgets (LIFO, max 5)
      setRecentWidgets(prev =>[preset, ...prev.filter(p => p.label !== preset.label)].slice(0, 5));
    }

    // Case 2: Moving an EXISTING widget on the canvas
    const moveWidgetData = e.dataTransfer.getData('move_widget');
    if (moveWidgetData) {
      const { id, offsetX, offsetY } = JSON.parse(moveWidgetData);
      setWidgets(widgets.map(w => {
        if (w.id === id) {
          return { ...w, x: e.clientX - offsetX, y: e.clientY - offsetY };
        }
        return w;
      }));
    }
  };

  // --- SETTINGS PANEL HANDLER ---
  const updateSelectedWidget = (param, value) => {
    setWidgets(widgets.map(w => {
      if (w.id === selectedId) {
        return { ...w, opt: { ...w.opt, [param]: value } };
      }
      return w;
    }));
  };

  // Find the currently selected widget object
  const selectedWidget = widgets.find(w => w.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      
      {/* 1. TOP BAR */}
      <div style={{ height: '60px', backgroundColor: '#333', display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid #000' }}>
        <h2 style={{ margin: 0, color: '#00ab06', marginRight: '40px' }}>Dashboard IDE</h2>
        
        {/* Recent Widgets Ribbon */}
        <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
          <span style={{ fontSize: '12px', color: '#888', alignSelf: 'center' }}>RECENT:</span>
          {recentWidgets.map((r, i) => (
            <div key={i} draggable onDragStart={(e) => handleDragStartLibrary(e, r)} style={{ padding: '5px 10px', backgroundColor: '#555', borderRadius: '4px', fontSize: '12px', cursor: 'grab' }}>
              {r.label}
            </div>
          ))}
        </div>

        <button onClick={() => exportToHTML(widgets)} style={{ padding: '8px 16px', backgroundColor: '#00ab06', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          ⬇ Export to HTML
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* 2. ACCORDION LIBRARY (LEFT PANEL) */}
        <div style={{ width: '250px', backgroundColor: '#2b2b2b', borderRight: '1px solid #111', overflowY: 'auto', padding: '10px' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Library</h3>
          
          {Object.keys(WIDGET_LIBRARY).map(category => (
            <div key={category} style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '12px', color: '#ccc', textTransform: 'uppercase', margin: '10px 0' }}>{category}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {WIDGET_LIBRARY[category].map((preset, idx) => (
                  <div 
                    key={idx}
                    draggable
                    onDragStart={(e) => handleDragStartLibrary(e, preset)}
                    style={{ padding: '10px', backgroundColor: '#444', borderRadius: '4px', cursor: 'grab', textAlign: 'center', fontSize: '12px' }}
                  >
                    ☰ {preset.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 3. CANVAS DROP ZONE (CENTER) */}
        <div 
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => setSelectedId(null)} // Click on empty canvas clears selection
          style={{ flex: 1, backgroundColor: '#f0f0f0', position: 'relative', overflow: 'hidden', backgroundImage: 'radial-gradient(#ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        >
          {widgets.map(w => (
            <div
              key={w.id}
              draggable
              onDragStart={(e) => handleDragStartCanvas(e, w.id, w.x, w.y)}
              onClick={(e) => { e.stopPropagation(); setSelectedId(w.id); }}
              style={{
                position: 'absolute',
                left: w.x,
                top: w.y,
                cursor: 'grab',
                padding: '10px',
                border: selectedId === w.id ? '2px dashed #00ab06' : '2px dashed transparent',
                borderRadius: '8px'
              }}
            >
              <SmartWidget elementTag={w.tag} id={w.id} target={w.target} opt={{...w.opt, role: 'demoMode'}} />
            </div>
          ))}
        </div>

        {/* 4. SETTINGS PANEL (RIGHT) */}
        <div style={{ width: '300px', backgroundColor: '#2b2b2b', borderLeft: '1px solid #111', padding: '20px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#888', borderBottom: '1px solid #444', paddingBottom: '10px' }}>Properties</h3>
          
          {!selectedWidget ? (
            <div style={{ color: '#666', textAlign: 'center', marginTop: '50px', fontSize: '13px' }}>Select a widget on the canvas to edit</div>
          ) : (
            <div>
              <p style={{ color: '#00ab06', fontSize: '12px', fontWeight: 'bold' }}>ID: {selectedWidget.id}</p>
              
              {/* Common properties */}
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Data Value:</label>
                <input 
                  type="range" min="0" max="100" style={{ width: '100%' }}
                  value={selectedWidget.target.value} 
                  onChange={e => {
                    setWidgets(widgets.map(w => w.id === selectedId ? { ...w, target: { ...w.target, value: Number(e.target.value) } } : w));
                  }} 
                />
              </div>

              {/* Dynamic properties based on widget type */}
              {selectedWidget.tag === 'smart-ui-bar' && (
                <>
                  <div style={{ marginTop: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Thickness:</label>
                    <input type="range" min="5" max="100" style={{ width: '100%' }} value={selectedWidget.opt.thickness || 20} onChange={e => updateSelectedWidget('thickness', Number(e.target.value))} />
                  </div>
                  <div style={{ marginTop: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Fill Color:</label>
                    <input type="color" style={{ width: '100%' }} value={selectedWidget.opt.varFillColor || '#ffffff'} onChange={e => updateSelectedWidget('varFillColor', e.target.value)} />
                  </div>
                </>
              )}

              {/* You can add more property inputs for Pie, Polygon, Gauge here! */}
              {selectedWidget.tag === 'smart-ui-pie' && (
                <div style={{ marginTop: '15px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px' }}>Radius:</label>
                  <input type="range" min="20" max="200" style={{ width: '100%' }} value={selectedWidget.opt.radius || 50} onChange={e => updateSelectedWidget('radius', Number(e.target.value))} />
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

