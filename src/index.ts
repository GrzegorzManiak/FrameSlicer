import konva from 'konva';
import { get_client_size } from './aux';
import { Colors, LineConfiguration } from './index.d';
import { render_line } from './render';
import { draw_grid } from './render/ruler';
import { handle_controlls } from './view_controlls';

import Line from './line';
import { init_zoom } from './zoom';
import { assign_actions, init_menu } from './menu';
import Shortcuts from './shortcuts';
import { load_tools } from './tools';


// -- Stage
const si = Shortcuts.get_instance();

let [width, height] = get_client_size();
export const _stage = new konva.Stage({
    container: 'canvas-container',
    width, height,
});

// -- Main Layer
export const _layer = new konva.Layer();
_stage.add(_layer);
init_zoom();
si.reset_shortcuts();
assign_actions();
load_tools();
init_menu();


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