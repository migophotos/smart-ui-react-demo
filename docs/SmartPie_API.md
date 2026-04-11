# SmartPie API Reference

This document provides a complete specification for the `SmartPie` widget. The widget supports complex hierarchical data (multi-level donuts and pies), dynamic scaling, and advanced SVG path generation.

## 1. Payload Structure Concept

The `update(data)` method or global `window.SmartPies.update(id, data)` accepts a configuration object containing:
* `opt` (Optional): Dynamic widget settings and layout configuration.
* `targets` (Required for data): An **Array of objects**, representing the slices of the pie/donut.

```javascript
const payload = {
  opt: {
    type: "rel",         // 'flat', 'rel', 'donut', 'zWhatch' or specific numeric formats like '1.2'
    radius: 120,
    varStrokeColor: "#ffffff",
    isAnimate: 1
  },
  targets:[
    // Main target
    { uuid: "t1", legend: "Servers", value: "40", color: "#0096ff", link: "http..." },
    // Sub-targets mapped to the main target via 'parent'
    { uuid: "t1-1", parent: "t1", legend: "Database", value: "25", color: "#00f900" },
    { uuid: "t1-2", parent: "t1", legend: "Frontend", value: "15", color: "#fffc79" }
  ]
};

# SmartPie API Reference

This document provides a complete specification for the `SmartPie` widget. The widget supports complex hierarchical data (multi-level donuts and pies), dynamic scaling, and advanced SVG path generation.

## 1. Payload Structure Concept

The `update(data)` method or global `window.SmartPies.update(id, data)` accepts a configuration object containing two main keys:

* **`opt`** (Optional): Dynamic widget settings and layout configuration.
* **`targets`** (Required for data): An Array of objects, representing the slices of the pie/donut.

To update the widget, pass an object where `opt` defines the visual properties (e.g., radius, type) and `targets` is a list of slice definitions. Each slice definition must have a unique `uuid` and a `value`. To create multi-level pies, use the `parent` property in sub-targets to link them to a main target's `uuid`.


const payload = {
  opt: {
    type: "rel",         // 'flat', 'rel', 'donut', 'zWhatch' or specific numeric formats like '1.2'
    radius: 120,
    varStrokeColor: "#ffffff",
    isAnimate: 1
  },
  targets:[
    // Main target
    { uuid: "t1", legend: "Servers", value: "40", color: "#0096ff", link: "http..." },
    // Sub-targets mapped to the main target via 'parent'
    { uuid: "t1-1", parent: "t1", legend: "Database", value: "25", color: "#00f900" },
    { uuid: "t1-2", parent: "t1", legend: "Frontend", value: "15", color: "#fffc79" }
  ]
};

## 2. Target Data Array (`targets` array items)

Each object in the `targets` array represents a slice.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| **`uuid`** | `String` | **Required.** Unique identifier of the slice. |
| **`value`** | `String`/`Number`| **Required.** The quantitative weight of the slice. |
| **`color`** | `String` | Hex color (e.g., `#ff0000`) or named color. |
| **`legend`** / **`name`**| `String` | Display name (rendered as `$TARGET_NAME$` in tooltips and used in the legend). |
| **`parent`** | `String` | **Crucial for multi-level pies.** Matches the `uuid` of a parent slice. Defines hierarchical relationships for `type: "rel"`. |
| **`state`** | `String` | Status code for global/local color mapping. |
| **`link`** | `String` | URL. Accessed when clicking the slice if `isLink: 1` is enabled. |

## 3. Configuration Options (`opt` object)

### 3.1. Topology & Layout

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`type`** | `"flat"`, `"rel"`, `"donut"`, `"zWhatch"`, `"m.s"` | `"flat"` | Core rendering topology. `flat`: standard pie. `rel`: Multi-level hierarchical pie based on `parent` keys. `donut`: requires `innerRadius` > 0. `m.s` (e.g., `1.3`): 1 main target and 3 sub targets pattern. |
| **`radius`** | `Number` | `50` | Primary radius of the widget. |
| **`innerRadius`**| `Number` | `0` | Inner hole radius. If > 0, automatically forces "donut" topology. |
| **`startAngle`** | `Number` | `0` | Angle where the first slice starts rendering. |
| **`endAngle`** | `Number` | `0` | Angle where rendering stops. If `start == end`, a full 360 degree pie is drawn. |
| **`rotation`** | `Number` | `-90` | Rotates the entire SVG (0 degrees is 3 o'clock; -90 is 12 o'clock). |

### 3.2. Visual Styling

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`varStrokeColor`**| `String` | `"red"` | Slice outline color. |
| **`varStrokeWidth`**| `Number` | `2` | Slice outline thickness. |
| **`varOpacity`** | `Number` | `1` | Overall transparency level. |
| **`varIsShadow`** | `1` or `0` | `1` | Enables SVG drop-shadow filter. |

### 3.3. Interaction & Tools

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`isLegend`** | `1` or `0` | `0` | Renders an interactive sidebar legend with target names and values. |
| **`isAnimate`** | `1` or `0` | `1` | Smoothly animates slices using CSS transitions expanding from center. |
| **`isTooltip`** | `1` or `0` | `1` | Shows tooltips on hover over slices. |
| **`isLink`** | `1` or `0` | `1` | Enables clicking slices to navigate to their `link` attribute. |
| **`sortBy`** | `"asis"`, `"name"`, `"value"`, `"color"`, `"state"` | `"asis"` | Built-in algorithm to sort slices before rendering. |

### 3.4. Emulation & Realtime Update

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`isRun`** | `1` or `0` | `0` | Activates internal interval to fetch remote JSON or emulate data. |
| **`isEmulate`** | `1`, `0`, `-1` | `0` | Activates random data generation using `generateExData()`. |
| **`interval`** | `Number` | `3500` | Fetch/Emulate interval. Automatically clamped to `3000ms` if animation is enabled. |