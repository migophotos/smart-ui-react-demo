# SmartGauge API Reference

This document provides a complete specification for the `SmartGauge` widget (`<smart-ui-gauge>`). This is one of the most advanced widgets in the SmartUI ecosystem. It supports multiple independent scales within a single dial, highly customizable pointers (needles), complex ticking systems (major/minor), threshold zones, and dynamic multi-target data binding.

## 1. Payload Structure Concept

When updating the widget via the `update(data)` method or globally through `window.SmartGauges.update(id, data)`, you pass a configuration object containing:

* **`opt`** (Optional): Dynamic widget settings, body styling, and scale definitions.
* **`targets`** (Required for data): An Array of objects representing the data for each scale.

Unlike simple widgets, `SmartGauge` can have multiple rotating pointers on the same dial. Each object in the `targets` array uses its `uuid` to map its value to a specific scale defined in the `opt.scales` array.

## 2. Target Data (`targets` array items)

Each object in the `targets` array controls a specific scale's pointer.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| **`uuid`** | `String` | **Required.** Must match the `uuid` of one of the defined scales in `opt.scales` (e.g., `"s1"`). |
| **`value`** | `String`/`Number`| **Required.** The current value. Determines the angle of the pointer. |
| **`color`** | `String` | Hex color. Overrides the default pointer/center/dial active color. |
| **`legend`** | `String` | Display name (rendered in the scale's legend area). |
| **`thresholds`**| `String` | Overrides the scale's default threshold zones dynamically (Format: `value#color,value#color`). |
| **`link`** | `String` | URL. Accessed when clicking the widget if `isLink: 1` is enabled. |

## 3. Configuration Options (`opt` object)

These settings control the main body of the gauge, global sizing, and hold the array of scales.

### 3.1. Main Body & Geometry

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`width`**, **`height`**| `Number` | `150` | The outer dimensions of the gauge SVG viewport. |
| **`bT`** | `Number` | `3` | Body Type (0 = None, 1 = Solid, 2 = Solid with border, 3 = Double contoured, 4 = Double contured with active perimeter). |
| **`bR`** | `Number` | `150` | Absolute base radius of the gauge body. |
| **`bBColor`**, **`bFColor`**| `String` | `"#fff"`, `"#1313.."`| Body Border Color and Body Fill Color. |
| **`bBWidth`** | `Number` | `2` | Border width of the main body (percentage of radius). |
| **`bRColor`**, **`bRBorder`**| `String` | Mixed | Rim Fill Color and Rim Border Color (used for body types 3 and 4). |
| **`bROffset`**, **`bRWidth`**| `Number` | `0`, `2` | Rim offset and width (percentage of radius). |
| **`bOpacity`**, **`bROpacity`**| `Number` | `1.0` | Opacity of the main body and rim. |
| **`bShadow`** | `1` or `0` | `1` | Enables drop-shadow filter on the main body. |

### 3.2. Interaction & Emulation

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`isAnimate`** | `1` or `0` | `1` | Smoothly animates pointers using CSS transitions. |
| **`isTooltip`** | `1` or `0` | `1` | Shows tooltips on hover. |
| **`isRun`** | `1` or `0` | `0` | Activates internal interval timer for realtime data fetching. |
| **`isEmulate`** | `1`, `0`, `-1` | `0` | Activates random data generation across all defined scales. |
| **`interval`** | `Number` | `3000` | Timer interval in milliseconds. |

## 4. Scale Definitions (`opt.scales` array)

This is the most powerful feature of the `SmartGauge`. The `scales` array contains objects that define individual axes, ticks, and pointers.

### 4.1. Scale Base Parameters

| Parameter | Description |
| :--- | :--- |
| **`uuid`** | Unique ID for this scale (e.g., `"s1"`). Data targets bind to this ID. |
| **`min`**, **`max`** | Minimum and maximum values for this specific scale (e.g., `0` to `100`, or `-50` to `50`). |
| **`angs`**, **`ange`** | Angle Start and Angle End. Degrees mapping the scale's arc. |
| **`way`**, **`offset`**| Offset direction (degrees) and distance (%) from the main gauge center. Allows placing sub-dials. |
| **`radius`** | The radius of the scale, as a percentage of the main gauge radius. |
| **`inv`** | Boolean. If true, the pointer moves counter-clockwise. |

### 4.2. Scale Sub-Components

Each scale contains several sub-objects defining its visual parts:

* **`dial`**: The background track of the scale. Properties: `type`, `radius`, `bWidth`, `bColor`, `fColor`, `opacity`.
* **`major`** & **`minor`**: The ticking lines (divisions). Properties: `type`, `weight` (step value, e.g., every 10 units), `radius`, `length`, `bWidth`, `bColor`.
* **`sign`**: The text numbers drawn near the major ticks. Properties: `type` (1 = absolute value, 2 = percentage), `radius`, `color`, `fSize`, `fFamily`.
* **`center`**: The hub/cap in the middle of the pointer. Properties: `type` (0=None, 1=Static, 2=Active colored), `radius`, `bColor`, `fColor`.
* **`pointer`**: The needle/arrow. Properties: `type` (0 to 12, defines geometry like triangle, wide needle, circle, or progress-arc), `radius` (length), `width`, `bColor`, `fColor`.
* **`legend`**: The text label showing the current value. Properties: `type`, `way` (angle pos), `offset` (radius pos), `color`, `template` (e.g., `"{0} km/h"`).
* **`thrs`**: Threshold zones (colored arcs). Properties: `type`, `radius`, `length`, `values` (Format: `50#ffff15,100#ff0000`).