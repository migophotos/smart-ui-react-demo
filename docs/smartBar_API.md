# SmartBar API Reference

This document provides a complete specification of the `SmartBar` widget parameters. The widget is controlled via the `update(data)` method, which accepts a payload containing operational data (`target`) and dynamic configuration options (`opt` or `cfg`).

## 1. Payload Structure Concept

When calling `window.SmartBars.update(id, data)` or `ctrl.update(data)`, pass an object containing two main keys:
* `opt` (Optional): Contains dynamic widget settings (Configuration Options). Allows applying appearance changes on-the-fly without element recreation.
* `target` (Required for data updates): Contains chart data values, states, and specific markers.

<code
    const payload = {
        // 1. DYNAMIC WIDGET SETTINGS (Optional)
        opt: {
            orient: "hor",
            aligning: "right",
            type: "discrete",
            // ... any other parameters from the "Configuration Options" section
        },
        // 2. CHART DATA (Required for updating values)
        target: {
            uuid: "widget-01",
            value: "75",
            // ... any other parameters from the "Target Data" section
        }
    };
>

## 2. Target Data (`target` object)

These parameters control the actual values, states, and specific markers on the chart.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| **`uuid`** | `String` | **Required.** Unique identifier of the widget. |
| **`value`** | `String` | **Required.** The current value representing the bar's fill level. |
| **`max`** | `String` | Maximum scale value. Default is `"100"`. |
| **`color`** | `String` | Forces a specific hex color (e.g., `#ff0000`) or named color. Overrides state colors. |
| **`state`** | `String` | Status code (e.g., `"0"`, `"1"`). Maps to a color defined in the `stateColors` configuration. |
| **`name`** | `String` | Display name/title (rendered as `$TITLE$` inside tooltips). |
| **`descr`** | `String` | Detailed description (rendered as `$DESCR$` inside tooltips). |
| **`link`** | `String` | Target URL. Used if the widget has `isLink: 1` or `is-link: 1` enabled. |
| **`trends`** | `String` | Comma-separated pairs of trend lines. Format: `value#color,value#color` (e.g., `"60#ff0000,80#0000ff"`). Requires `isShowTrends: 1`. |
| **`thr`** | `String` | Comma-separated threshold zones. Format: `value#color,value#color` (e.g., `"30#00ff00,70#ffff00,100#ff0000"`). Requires `isShowThr: 1`. Changes rendering mode to zones. |

## 3. Configuration Options (`opt` object)

These are the widget's structural, visual, and behavioral settings. They can be passed during initialization or updated on-the-fly via the `opt` object in the payload.

### 3.1. Layout & Geometry

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`orient`** | `"hor"`, `"ver"` | `"hor"` | Orientation of the widget (Horizontal or Vertical). |
| **`aligning`** | `"right"`, `"left"`, `"up"`, `"down"` | `"right"` | Direction of the value axis. If `hor`: grows to the right or left. If `ver`: grows up or down. |
| **`type`** | `"solid"`, `"discrete"` | `"solid"` | The visual type of the bar body. `solid` is a continuous bar, `discrete` is divided into segmented blocks. |
| **`length`** | `Number` | `50` | The primary size/length of the bar in pixels (or percentage if in specific containers). |
| **`thickness`** | `Number` | `10` | The height (if `hor`) or width (if `ver`) of the element, defined as a percentage of its length. |
| **`gap`** | `Number` | `5` | Gap/padding around the indicator. |

### 3.2. Coloring & Styling Rules

The SmartBar supports a highly flexible coloring engine controlled by "Rules".

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`valueRule`** | `"stroke"`, `"fill"`, `"both"`, `"none"` | `"fill"` | Specifies what part of the active bar is painted by the data color. If `"fill"`, the background is colored based on value. |
| **`colorRule`** | `"stroke"`, `"fill"`, `"both"`, `"none"` | `"stroke"`| Same as `valueRule`, but affects the static outline/body color. |
| **`isFillBkg`** | `1` or `0` | `1` | Enables rendering the background of the inactive part of the bar. |
| **`isFillStroke`** | `1` or `0` | `1` | Enables drawing the stroke/border around the entire bar. |
| **`varFillColor`** | `String` | `"#ffcd88"` | Base fill color of the widget's background. |
| **`varStrokeColor`**| `String` | `"#000000"` | Base stroke color of the widget. |
| **`varStrokeWidth`**| `Number` | `1` | Stroke thickness. |
| **`varOpacity`** | `Number` | `1` | Overall widget transparency (0.0 to 1.0). |
| **`varIsShadow`** | `1` or `0` | `1` | Toggles the SVG drop-shadow filter. |
| **`stateColors`** | `String` | `""` | State-to-color mapping string. Format: `"0#hex,1#hex,2#hex"` (e.g., `"0#0096ff,1#00f900"`). |
| **`isGlobalColors`**| `1` or `0` | `1` | Uses global `window.StateToColors` mapping instead of local `stateColors`. |

### 3.3. Scale & Texts

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`scalePosition`** | `"none"`, `"top"`, `"right"`, `"bottom"`, `"left"` | `"bottom"`| Where to draw the quantitative scale axis. |
| **`scaleOffset`** | `Number` | `7` | The gap between the center axis of the bar and the scale baseline. |
| **`isShowThr`** | `1` or `0` | `0` | Enables threshold rendering. Changes active bar rendering to underlying threshold blocks. |
| **`isShowTrends`** | `1` or `0` | `0` | Enables rendering of the trend lines over the bar. |
| **`varFontFamily`** | `String` | `"Arial..."` | Font family used for scale labels. |
| **`varFontSize`** | `Number`/`String`| `"10px"` | Font size for the scale labels. |
| **`varFontColor`** | `String` | `"#666666"` | Font color. If thresholds are shown, this color is also used for scale ticks. |

### 3.4. Behavior, Tooltips & Networking

| Option | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| **`isRun`** | `1` or `0` | `0` | Starts the internal interval timer. Used for fetching data from the server or running demo mode. |
| **`isEmulate`** | `1` or `0` | `0` | Enables the internal data emulation engine (generates fake data). |
| **`interval`** | `Number` | `3000` | Fetch/Emulate interval. In seconds if `< 2000`, in milliseconds if `> 1999`. |
| **`isAnimate`** | `1` or `0` | `1` | Enables CSS transitions (`transition: all 1.5s`) when updating values. |
| **`isLink`** | `1` or `0` | `1` | Enables the `click` event listener that opens the `target.link` URL. |
| **`isTooltip`** | `1` or `0` | `1` | Enables displaying hover tooltips (`mouseover`, `mouseout`). |
| **`ttipType`** | `"own"`, `"global"`| `"own"` | Determines whether to use built-in or global `SmartTooltip` settings. |
| **`position`** | `String` | `"rt"` | Tooltip position relative to the element (e.g., `"rt"` = right-top). |
| **`server`** | `String` | `""` | URL parameter for fetching data via GET request (used with `isRun: 1`). |
| **`target`** | `String` | `""` | Target endpoint parameter for fetching data via GET request. |