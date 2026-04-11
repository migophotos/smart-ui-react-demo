# SmartColorSelector API Reference

This document provides a complete specification for the `SmartColorSelector` widget (`<smart-ui-colorsel>`). This widget is a highly interactive, pure SVG-based UI control for selecting and adjusting colors. It supports editing both "Fill" and "Stroke" properties, adjusting opacity, generating color schemes (Triadic, Analogous, Complementary, Monochromatic), and even accepts keyboard input for HEX/RGB color codes.

## 1. Core Concept & Functionality

Unlike data-visualization widgets, the `SmartColorSelector` acts as an input/control element. It does not consume real-time `target` data. Instead:
* It is initialized with an `opt` object to define its physical appearance (background, borders, shadows).
* It communicates via the `setData(colorData)` API method to set initial color states.
* It emits a native `dataChanged` CustomEvent whenever the user modifies a color, allowing parent applications to react immediately.

## 2. Configuration Options (`opt` object)

These properties define the visual layout and styling of the selector's outer frame and background.

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`alias`** | `"stcrs"` | `"stcrs"` | Internal alias for the widget. |
| **`role`** | `String` | `""` | Defines the operating mode. Set to `"demoMode"` for restricted interactions. |
| **`bkgColor`** | `String` | `"#404040"` | The background color of the widget's main frame. |
| **`borderColor`** | `String` | `"none"` | The stroke/border color of the main frame. |
| **`borderWidth`** | `Number` | `0` | The width of the frame's border. |
| **`borderRadius`**| `Number` | `2` | The rounding radius of the widget's corners. |
| **`bodyOpacity`** | `Number` | `1` | Overall opacity of the widget's main body. |
| **`isShadow`** | `1` or `0` | `0` | Enables or disables the SVG drop-shadow filter. |

## 3. Communication API (Methods & Events)

To integrate this widget into a dynamic dashboard, use the following methods and events attached to the controller instance or DOM node.

### 3.1. `setData(colorData)`
Programmatically sets the current colors for the Fill and Stroke tools. The `colorData` payload requires the following structure:
* `fillColor` (Object): Contains `active` (1/0), `isnone` (1/0), `color` (Hex/RGB string), and `opacity` (0.0 to 1.0).
* `strokeColor` (Object): Same structure as `fillColor`.

### 3.2. `getData()`
Returns the current active state and color values of the widget in the exact same format expected by `setData`.

### 3.3. `dataChanged` Event
Fired natively on the widget's SVG root element whenever the user modifies a color or opacity. The `event.detail` property contains the payload returned by `getData()`.

## 4. User Interactions & UI Features

The widget packs a massive amount of functionality into a compact SVG frame:

### 4.1. Tool Switching
* **Fill/Stroke Selectors:** Click the icons on the top left to switch the active parameter being edited.
* **No Color:** Click the crossed-out circle to set the active parameter to "transparent/none".
* **Swap Colors:** Click the bi-directional arrow icon to swap the Fill and Stroke colors.

### 4.2. Sliders & Wheels
* **Opacity Slider:** Located at the bottom. Drag or click to change alpha transparency.
* **Menu Selector:** Click the top-right button to open a menu of color tools (Hue Boxes, RGB Sliders, Analogous, Complementary, Monochromatic, Triadic).
* **Mouse Wheel:** Scroll over RGB/Hue sliders for fine-grained adjustments. Use `Ctrl+Wheel` or `Shift+Wheel` for specific component modifications.

### 4.3. Direct Keyboard Input
The widget natively captures keyboard input for precise color coding:
* Set focus to the widget (click on the current tool title).
* Type `#` to begin entering a Hex code (e.g., `#ff00aa`).
* Type `r`, `g`, or `b` to begin entering a specific decimal or hex component (e.g., `r255` or `r#ff`).
* Press `Enter` to apply, `Backspace` to delete, or `Escape` to cancel. If the entered code is invalid, the text turns red.

## 5. Excluded/Ignored Methods

Because this is a control widget, the standard SmartWidget runtime data methods are disabled:
* `isRun()`, `run()`
* `isEmulate()`, `emulate()`
* `update(data)` (Standard payload updates are ignored; use `setData` instead).