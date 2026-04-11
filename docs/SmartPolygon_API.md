# SmartPolygon API Reference

This document provides a complete specification for the `SmartPolygon` widget (`<smart-ui-polygon>`). This widget dynamically renders regular polygons (triangles, squares, pentagons, hexagons, etc.) or star shapes. It acts as a data-driven progress indicator by partially filling the shape based on the current value.

## 1. Payload Structure Concept

When updating the widget via the `update(data)` method or globally through `window.SmartPolygons.update(id, data)`, you pass a configuration object containing:

* **`opt`** (Optional): Dynamic widget settings, geometry, and styling configuration.
* **`target`** (Required for data): A single object representing the metric being visualized.

## 2. Target Data (`target` object)

This object defines the current state and value of the polygon.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| **`uuid`** | `String` | **Required.** Unique identifier of the widget. |
| **`value`** | `String`/`Number`| **Required.** The current value. Determines how much of the polygon is filled. |
| **`max`** | `String` | Maximum scale value. Default is `100`. |
| **`color`** | `String` | Hex color (e.g., `#ff0000`). Paints the active filled area. |
| **`state`** | `String` | Status code (e.g., `"0"`, `"1"`). Maps to a color from `stateColors` or global `window.StateToColors`. |
| **`name`** | `String` | Display name (rendered as `$TITLE$` inside tooltips). |
| **`descr`** | `String` | Detailed description (rendered as `$DESCR$` inside tooltips). |
| **`link`** | `String` | URL. Accessed when clicking the widget if `isLink: 1` is enabled. |

## 3. Configuration Options (`opt` object)

These settings control the shape, fill direction, and behavior of the polygon.

### 3.1. Geometry & Shape

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`anglesNumber`**| `Number` | `0` | **Crucial parameter.** Determines the shape. (e.g., `3` = triangle, `4` = square/diamond, `5` = pentagon, `6` = hexagon). Must be specified. |
| **`isStar`** | `1` or `0` | `0` | If `1`, renders a star instead of a regular polygon. |
| **`innerRadius`** | `Number` | `50` | Inner radius for star shapes, defined as a percentage of the main radius. |
| **`radius`** | `Number` | `50` | Radius of the inscribed circle bounding the shape. |
| **`startAngle`** | `Number` | `0` | Starting angle (in degrees) to draw the shape. |
| **`rotation`** | `Number` | `0` | Rotates the entire shape clockwise (in degrees). |

### 3.2. Fill Direction & Coloring Rules

The polygon fills up based on the data value. The direction of this fill is controlled here.

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`orient`** | `"hor"`, `"ver"` | `"hor"` | Fill orientation. `hor` = fills horizontally, `ver` = fills vertically. |
| **`aligning`** | `"right"`, `"left"`, `"up"`, `"down"` | `"right"` | Direction of the fill. For example, `orient: "ver"` and `aligning: "up"` makes the shape fill from bottom to top (like a glass of water). |
| **`valueRule`** | `"stroke"`, `"fill"`, `"both"`, `"none"` | `"fill"` | Defines how the active (value) part is painted. |
| **`colorRule`** | `"stroke"`, `"fill"`, `"both"`, `"none"` | `"stroke"`| Defines how the background/inactive part of the shape is painted. |
| **`isFillBkg`** | `1` or `0` | `0` | Fills the background of the inactive part. |
| **`isFillStroke`**| `1` or `0` | `0` | Draws a stroke around the entire polygon. |
| **`varFillColor`**| `String` | `"#ffcd88"` | Base fill color of the inactive background. |
| **`varStrokeColor`**| `String`| `"#000000"` | Base stroke color. |
| **`varStrokeWidth`**| `Number`| `3` | Stroke thickness. |
| **`varOpacity`** | `Number` | `1` | Transparency level (0.0 to 1.0). |
| **`varIsShadow`** | `1` or `0` | `1` | Enables SVG drop-shadow filter. |

### 3.3. Interaction & Emulation

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`isAnimate`** | `1` or `0` | `1` | Smoothly animates the filling process. |
| **`isTooltip`** | `1` or `0` | `1` | Shows tooltips on hover. |
| **`isLink`** | `1` or `0` | `1` | Makes the widget clickable if `target.link` exists. |
| **`isRun`** | `1` or `0` | `1` | Activates internal interval timer. |
| **`isEmulate`** | `1`, `0`, `-1` | `0` | Activates random data generation using `generateExData()`. |
| **`interval`** | `Number` | `3000` | Timer interval in milliseconds. |