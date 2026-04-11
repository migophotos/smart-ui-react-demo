# SmartTooltip API Reference

This document provides a complete specification for the `SmartTooltip` module (`<smart-ui-tooltip>`). It is an advanced, globally managed, SVG-based floating tooltip system. It supports rich content, including embedded mini-diagrams, dynamic scales, iframes, images, and drag-and-drop "pinning" to the screen.

## 1. Core Concept & Functionality

Unlike standard HTML tooltips, `SmartTooltip` injects a global absolute SVG container (`<div id="SmartTooltip">`) into the document body. 
It listens to mouse events (`mouseover`, `mousemove`, `mouseout`) from target elements and dynamically renders SVG templates based on the element's data.

The tooltip is controlled via the global `window.SmartTooltip` object using three main methods:
* `SmartTooltip.showTooltip(data, event)`
* `SmartTooltip.moveTooltip(event)`
* `SmartTooltip.hideTooltip(event)`

## 2. Payload Structure Concept

When triggering `showTooltip(data, evt)`, the `data` object must contain the following structure:

* **`id`** (String): The ID of the hovered element.
* **`x`**, **`y`** (Number): Current mouse coordinates (`event.clientX`, `event.clientY`).
* **`options`** (Object): Dynamic tooltip settings (delays, templates, position, cssVars).
* **`title`** (Object): The main metric/target data to be displayed in the header.
* **`targets`** (Array): An array of sub-targets. If the `pie` template is used, these are rendered as a mini-donut chart and a legend table inside the tooltip.

## 3. Data Objects (`title` and `targets`)

The `title` object and each item in the `targets` array support the following parameters:

| Parameter | Description |
| :--- | :--- |
| **`uuid`** | Unique identifier of the element. |
| **`name`** / **`legend`** | Display name (rendered via `$TITLE$` or `$NAME$` macros). |
| **`descr`** | Detailed description (rendered via `$DESCR$` macro). |
| **`value`** | Quantitative value. Plotted on the tooltip's scale gauge. |
| **`max`** | Maximum value for the scale. If not provided, it defaults to 100 or acts dynamically. |
| **`color`** | Hex color used for the scale bar or mini-diagram slice. |
| **`link`** | URL. If provided, the value bar or slice becomes clickable. |

## 4. Configuration Options (`options` / Custom Properties)

These parameters control the tooltip's behavior, positioning, and visual template. They can be passed in the `options` object or defined via CSS variables (`--sttip-var-...`).

### 4.1. Templates & Modes

| Option | Default | Description |
| :--- | :--- | :--- |
| **`template`** | `"pie"` | The visual layout. Built-in options: `"pie"`, `"simple"`, `"iframe"`, `"image"`. External SVGs can be loaded by passing a URL ending in `.svg`. |
| **`startFrom`** | `"float"` | Initial state. `"float"` (follows mouse), `"pinned"` (stays open), `"fixed"` (pinned and remembers drag position). |
| **`showMode`** | `"inherit"`| Overrides `startFrom` for specific elements (e.g., forcing `"pinned"`). |
| **`position`** | `"rt"` | Default pinned position relative to the element (`rt` = right-top, `cd` = center-down, etc.). |

### 4.2. Delays & Timers

| Option | Default | Description |
| :--- | :--- | :--- |
| **`delayIn`** | `300` | Time (ms) to wait while hovering before the tooltip appears. |
| **`delayOut`** | `200` | Time (ms) to wait after mouse leaves before the tooltip hides. |
| **`isRun`** | `0` | If `1`, a small "run indicator" dot in the tooltip turns green (useful for real-time streaming status). |

### 4.3. Formatting & Visuals

| Option | Default | Description |
| :--- | :--- | :--- |
| **`titleFormat`** | `"$TITLE$"`| Macro-string to format the title text. |
| **`descrFormat`** | `"$DESCR$"`| Macro-string to format the description text. |
| **`titleTextWrap`** | `0` | Max width for title text before it wraps to a new line. |
| **`varFrameFill`** | `"#fffcde"`| Tooltip background color. |
| **`varFrameOpacity`**| `0.90` | Tooltip background transparency. |
| **`frameScale`** | `0.8` | Overall zoom/scale of the tooltip SVG container. |
| **`isShadow`** | `1` | Enables drop-shadow filter. |

## 5. UI Features & Interactions

* **Pinning:** Clicking the "Pin" icon keeps the tooltip visible even after the mouse moves away.
* **Dragging:** Pinned tooltips can be dragged across the screen. If `enableStorage: 1`, the position is saved in `localStorage`.
* **Smart Links:** If a target has a `link`, the corresponding element in the tooltip (legend or diagram slice) becomes a clickable hyperlink.
* **Responsive Scale:** The scale line (`0 - 50% - 100%`) automatically adjusts if `max` is provided, scaling the active value bar proportionally.