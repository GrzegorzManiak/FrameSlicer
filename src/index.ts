import konva, {} from 'konva';
import { get_client_size } from './aux';
import { Colors, LineConfiguration, Lines } from './index.d';
import { render_line } from './render';
import { draw_grid } from './render/ruler';
import { handle_controlls } from './view_controlls';
import { download_gcode, points_to_gcode, step_points, turn_line_to_points } from './gcode';

import Line from './line';

// -- Stage
let [width, height] = get_client_size();
const _stage = new konva.Stage({
    container: 'container',
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


// -- Handle when user preses 'f' key
document.addEventListener('keydown', (e) => {
    if (e.key !== 'f') return;

    // console.log('Generating gcode...');
    // const points = turn_line_to_points(x_line),
    //     stepped = step_points(x_line, points, 0.10),
    //     gcode = points_to_gcode(x_line, stepped);

    // download_gcode(x_line, 'test', gcode);
    // console.log('Done!');
});