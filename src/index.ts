import konva, {} from 'konva';
import { get_client_size } from './aux';
import { Line, Lines } from './index.d';
import { anchor_listener, handle_listener, init_anchors } from './anchor';
import { render_line } from './render';
import { draw_grid } from './render/ruler';
import { handle_controlls } from './view_controlls';
import { download_gcode, points_to_gcode, step_points, turn_line_to_points } from './gcode';


// -- Stage
let [width, height] = get_client_size();
const _stage = new konva.Stage({
    container: 'container',
    width, height,
});

// -- Main Layer
const _layer = new konva.Layer();
_stage.add(_layer);


let _lines: Lines = [];





/**
 * @name create_line
 * @description Creates a line (box) and adds it to the layer
 * @param {number} width The width of the box
 * @param {number} height The height of the box
 * @param {number} cutting_depth The cutting depth of the tool
 * @param {number} y_offset The y offset of the line
 * @param {boolean} y_line If the line is a y line 
 * 
 * @param {string} line_stroke The line stroke color
 * @param {string} line_fill The line fill color
 * @param {string} anchor_stroke The anchor stroke color
 * @param {string} anchor_fill The anchor fill color
 * @param {string} anchor_guide The anchor guide color
 * @returns {Line} The line
 */
const create_line = (
    width: number, 
    height: number,
    cutting_depth: number,
    y_offset: number = 0,
    y_line: boolean = false,

    line_stroke: string = '#ebebeb',
    line_fill: string = '#ebebeb30',

    anchor_stroke: string = '#4a4a4a',
    anchor_fill: string = '#47ffbc',
    anchor_guide: string = '#108258',

): Line => {
    let [c_width, c_height] = get_client_size();

    const bounding_box = new konva.Rect({
        x: c_width / 2 - width / 2,
        y: c_height / 2 - height / 2,
        width, height,
        fill: '#ffffff10',
        stroke: '#ffffff15',
        strokeWidth: 1,
        draggable: false,
    });

    // -- Add the bounding box to the layer
    _layer.add(bounding_box);

    // -- Create the line
    const _line = new konva.Line({
        points: [],
        stroke: line_stroke,
        strokeWidth: 2,
        lineCap: 'round',
        lineJoin: 'round',
        draggable: false,
        fill: line_fill,
        closed: y_line,
    });

    // -- Create the anchor
    const _anchor = new konva.Rect({
        x: 0,
        y: 0,
        width: 10,
        height: 10,

        stroke: anchor_stroke,
        strokeWidth: 1,
        fill: anchor_fill,
        draggable: true,
    });

    // -- Add the line and anchor to the layer
    _layer.add(_line);

    // -- Returns the index of the line in the lines array
    const get_index = () => _lines.findIndex(l => l.line === _line);
    let _anchors = [];

    // -- Depth line
    const depth_line = new konva.Line({
        points: [],
        stroke: '#eb4034',
        strokeWidth: 2,
        lineCap: 'round',
        lineJoin: 'round',
        draggable: false,
        fill: '#ff3049',
        closed: false,
    });

    if (y_line) depth_line.hide();

    // -- Add the depth line to the layer
    _layer.add(depth_line);

    const anchor_handle = new konva.Rect({
        x: 0,
        y: 0,
        width: 10,
        height: 25,
        stroke: anchor_stroke,
        strokeWidth: 1,
        fill: anchor_fill,
        draggable: true,
    });

    // -- Path
    const _path = new konva.Path({
        data: '',
        stroke: line_stroke,
        strokeWidth: 2,
        lineCap: 'round',
        lineJoin: 'round',
        draggable: false,
        fill: y_line ? 'transparent' : line_fill,
        closed: false,
    });

    // -- Add the path to the layer
    _layer.add(_path);

    // -- Return the line
    return {
        line: _line,
        points: [],
        width, height,
        anchor: _anchor,
        spread: 0,
        anchors: _anchors,
        depth_buffer: 20,
        bounding_box,
        depth_line,
        snap_range: 5,
        path: _path,
        cutting_depth,
        y_line,
        raw_path: '',
        anchor_handle,
        y_offset,
        handle_padding: 10,
        def_points: _line.points(),
        get_layer: () => _layer,
        get_index,
        add_anchor: (x: number = 0, y: number = 0) => {
            const anchor = _anchor.clone({x, y});
            const obj = { 
                shape: anchor, 
                line: new konva.Line({
                    points: [],
                    stroke: anchor_guide,
                    strokeWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round',
                    draggable: false,
                    fill: anchor_guide,
                    closed: false,
                    zIndex: 100,
                }),
                handle: anchor_handle.clone({x, y}),
                max_y: 0,
                min_y: 0,
                handle_y: 0,
            };

            _layer.add(obj.line);
            _layer.add(obj.shape);
            _layer.add(obj.handle);
            _layer.draw();
            _anchors.push(obj);

            anchor_listener(_lines[get_index()], obj);
            handle_listener(_lines[get_index()], obj);
            return obj;
        }
    };
}


const line_width = 500;
const line_height = 100;
const line_depth = 60;
const line_gap = 150 + line_height;


const x_line = create_line(
    line_width, 
    line_height, 
    line_depth,
    0,
    false
);
_lines.push(x_line);
init_anchors(x_line, 10);
render_line(x_line);
handle_controlls(_stage);
draw_grid(x_line, true, true);


const y_line = create_line(
    line_width, 
    line_height, 
    line_height,
    line_gap,
    true
);
_lines.push(y_line);
init_anchors(y_line, 10);
render_line(y_line);
handle_controlls(_stage);
draw_grid(y_line, true, false);


// -- Handle when user preses 'f' key
document.addEventListener('keydown', (e) => {
    if (e.key !== 'f') return;

    console.log('Generating gcode...');
    const points = turn_line_to_points(x_line),
        stepped = step_points(x_line, points, 0.10),
        gcode = points_to_gcode(x_line, stepped);

    download_gcode(x_line, 'test', gcode);
    console.log('Done!');
});