import konva, {} from 'konva';
import { get_client_size } from './aux';
import { Line, Lines } from './index.d';
import { anchor_listener, handle_listener, init_anchors } from './anchor';
import { render_line } from './render';


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

    line_stroke: string = '#ebebeb',
    line_fill: string = '#ebebeb30',

    anchor_stroke: string = '#4a4a4a',
    anchor_fill: string = '#47ffbc',
    anchor_guide: string = '#108258',
): Line => {

    // -- Create the line
    const _line = new konva.Line({
        points: [],
        stroke: line_stroke,
        strokeWidth: 2,
        lineCap: 'round',
        lineJoin: 'round',
        draggable: false,
        fill: line_fill,
        closed: true,
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

    // -- Add the depth line to the layer
    _layer.add(depth_line);

    const anchor_handle = new konva.Rect({
        x: 0,
        y: 0,
        width: 15,
        height: 5,
        stroke: anchor_stroke,
        strokeWidth: 1,
        fill: anchor_fill,
        draggable: true,
    });

    // -- Return the line
    return {
        line: _line,
        points: [],
        width, height,
        anchor: _anchor,
        spread: 0,
        anchors: _anchors,
        depth_buffer: 20,
        depth_line,
        cutting_depth,
        anchor_handle,
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



const main_line = create_line(1000, 90, 60);
_lines.push(main_line);
init_anchors(main_line, 10);
render_line(main_line);