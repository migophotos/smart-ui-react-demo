# SmartPalette API Reference

This document provides a complete specification for the `SmartPalette` widget (`<smart-ui-palette>`). Unlike data-driven widgets (like SmartBar or SmartPie), the SmartPalette is a UI control component. It serves as an interactive color picker and theme manager that allows users to define and adjust colors mapped to specific states.

## 1. Core Concept & Functionality

The SmartPalette widget renders an interactive SVG-based interface containing:
* A grid of selectable state color swatches (State 0 to State 8).
* Interactive sliders for Hue (H), Saturation (S), and Luminance (L) that respond to clicks and mouse wheel events.
* A scrollable list of pre-defined color themes.

When a user modifies a color, the widget updates its internal `stateColors` string. If `isGlobalColors` is enabled, it automatically updates the global `window.StateToColors` mapping, causing all other SmartWidgets on the page that rely on state colors to dynamically update their appearance.

## 2. Payload Structure Concept

Because SmartPalette is a configuration widget, it does not use the `target` or `targets` data arrays. It only requires the `opt` object to define its initial settings.

When updating the widget via API, pass an object containing the `opt` key.

## 3. Configuration Options (`opt` object)

The following properties control the palette's behavior and initialization.

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`alias`** | `"stpal"` | `"stpal"` | Internal alias for the widget. |
| **`role`** | `String` | `""` | Defines the operating mode. If set to `"demoMode"`, the interactive HSL sliders and the scrollable themes container are hidden, displaying only the static color blocks. |
| **`isGlobalColors`**| `1` or `0` | `1` | **Crucial parameter.** If set to `1`, any color modifications made in this widget are directly injected into the global `window.StateToColors` Map. This immediately affects all other widgets using state-based coloring. |
| **`stateColors`** | `String` | `"0#0080c0,1#008000..."` | The initial color mapping string. Format: `state#hexcolor,state#hexcolor`. Supports states from `0` up to `8`. |

## 4. User Interactions & Shortcuts

The widget is highly interactive and supports various mouse inputs directly on the SVG elements:

### 4.1. Color Swatches (State Grid)
* **Click:** Selects the state to be edited. The selected state gets a black outline.
* **Wheel over swatch:** Adjusts the color properties directly.
  * `Scroll`: Modifies Hue (H).
  * `Ctrl + Scroll`: Modifies Saturation (S).
  * `Shift + Scroll`: Modifies Luminance/Lightness (L).
  * `Alt + Scroll`: Triples the adjustment speed (Multiplier x3).

### 4.2. HSL Sliders (If not in demoMode)
* **Click:** Jumps to the clicked value on the Hue, Saturation, or Luminance scale.
* **Wheel:** Finely increments or decrements the selected color's properties.

### 4.3. Themes Container
* **Scroll:** Uses the mouse wheel to scroll through pre-defined SmartWidget color themes.
* **Click:** Applies the selected theme to the current `stateColors` palette.

## 5. Excluded/Ignored Methods

Because this is a control widget rather than a data visualization widget, the following standard SmartWidget runtime methods are explicitly disabled and will log a "not applicable" message:
* `isRun()`, `run()`
* `isEmulate()`, `emulate()`
* `intervalCounter`
* `generateExData()`
* `update(data)` (Real-time data streaming is ignored)