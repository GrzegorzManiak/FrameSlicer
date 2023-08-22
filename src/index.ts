import konva, {} from 'konva';
import { get_client_size } from './aux';
import { Colors, LineConfiguration, Lines } from './index.d';
import { render_line } from './render';
import { draw_grid } from './render/ruler';
import { handle_controlls } from './view_controlls';
import { download_gcode, points_to_gcode, step_points, turn_line_to_points } from './gcode';

import Line from './line';
import Shortcuts from './shortcuts';

// -- Stage
let [width, height] = get_client_size();
const _stage = new konva.Stage({
    container: 'canvas-container',
    width, height,
});

// -- Main Layer
const _layer = new konva.Layer();
_stage.add(_layer);



const line_width = 500;
const line_height = 100;
const line_depth = 60;

const colors: Colors = {
    anchor: { fill: '#47ffbc', stroke: '#4a4a4a' },
    anchor_guide: { fill: '#108258', stroke: '#108258' },
    anchor_handle: { fill: '#47ffbc', stroke: '#4a4a4a' },

    bounding_box: { fill: '#ffffff10', stroke: '#ffffff15' },
    depth_line: { fill: '#ff3049', stroke: '#eb4034' },
    line: { fill: '#ebebeb30', stroke: '#ebebeb' },
    path: { fill: '#ebebeb30', stroke: '#ebebeb' },
};

const config: LineConfiguration = {
    colors,
    anchor_spread: 10,
    handle_padding: 5,
    size: {
        width: line_width,
        height: line_height,
    },
    cutting_depth: line_depth,
    is_y_line: false,
    y_offset: 0,
    depth_buffer: 20,
    achor_position: 'bottom'
}


// -- Load the shortcuts
const si = Shortcuts.get_instance();

const x_line = new Line(_layer, config);
const y_line = new Line(_layer, {
    ...config,
    is_y_line: true,
    y_offset: 150 + line_height,
    cutting_depth: config.size.height,
    achor_position: 'top',
});

render_line(x_line);
draw_grid(x_line, true, true);
render_line(y_line);
draw_grid(y_line, true, false);
handle_controlls(_stage);



// -- Zoom 
const zoom_plus = document.querySelector('.zoom-in') as HTMLElement,
    zoom_minus = document.querySelector('.zoom-out') as HTMLElement,
    zoom_level = document.querySelector('#zoom-level') as HTMLInputElement;

if (!zoom_plus || !zoom_minus || !zoom_level
) throw new Error('Missing zoom elements');

const set_zoom = (value: number) => {
    // -- Clamp zoom value
    if (value < min_zoom) value = min_zoom;
    if (value > max_zoom) value = max_zoom;
    
    // -- Round to 2 decimals
    value = Math.round(value * 100) / 100;
    zoom_level.value = `${value}`;

    const old_scale = _stage.scaleX();
    const new_scale = value;

    // -- Calculate the zoom origin (center of the stage)
    const center_x = _stage.width() / 2;
    const center_y = _stage.height() / 2;

    // -- Apply new scale and position
    _stage.scale({ x: new_scale, y: new_scale });
    _stage.position({ 
        x: center_x - (center_x - _stage.x()) * (new_scale / old_scale),
        y: center_y - (center_y - _stage.y()) * (new_scale / old_scale),
    });

    _stage.batchDraw();

}

const change_ammount = 0.05;
const min_zoom = 0.25;
const max_zoom = 2;
set_zoom(1);


// -- Buttons
si.assign_action('view-zoom-in', () =>  {
    const current = parseFloat(zoom_level.value);
    set_zoom(current + change_ammount);
});

zoom_plus.addEventListener('click', () => {
    const current = parseFloat(zoom_level.value);
    set_zoom(current + change_ammount);
});


si.assign_action('view-zoom-out', () =>  {
    const current = parseFloat(zoom_level.value);
    set_zoom(current - change_ammount);
});

zoom_minus.addEventListener('click', () => {
    const current = parseFloat(zoom_level.value);
    set_zoom(current - change_ammount);
});


zoom_level.addEventListener('change', () => {
    const current = parseFloat(zoom_level.value);
    set_zoom(current);
});


// -- Scroll
_stage.on('wheel', (e) => {
    // -- Get the zoom level
    const current = parseFloat(_stage.scaleX().toFixed(2));

    // -- Calculate the new zoom level
    let new_zoom = current;
    if (e.evt.deltaY < 0) new_zoom = Math.min(max_zoom, current + change_ammount);
    else new_zoom = Math.max(min_zoom, current - change_ammount);

    // -- Set the new zoom level
    set_zoom(new_zoom);
});
