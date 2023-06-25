import konva, {} from 'konva';
import { center_line, get_client_size } from './aux';
import Point from './point';
import { Points, Line, Lines, Anchor } from './index.d';
import { init_anchors } from './anchor';


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



const generate_points = (anchors: Array<Anchor>): Array<number> => {
    let points: Array<number> = [];

    // -- Main lines
    anchors.forEach((anchor) => {
        const { x, y } = anchor.shape.position();
        points.push(
            x + anchor.shape.width() / 2,
            y + anchor.shape.height() / 2,
        );
    });

    // -- First and last Anchors
    (() => {
        // -- Last Anchor
        const anchor = anchors[anchors.length - 1],
        { x, y } = anchor.shape.position();

        // -- Last Anchor
        points = [
            ...points,
            x + anchor.shape.width() / 2,
            anchor.max_y,
        ];
    })();

    (() => {
        // -- First Anchor
        const anchor = anchors[0],
        { x, y } = anchor.shape.position();

        // -- First Anchor
        points = [
            ...points,
            x + anchor.shape.width() / 2,
            anchor.max_y,
        ];
    })();

    return points;
}



const render_line = (line: Line) => {
    const anchors = line.anchors;
    const points = generate_points(anchors);
    line.line.points(points);
    _layer.draw();
};



const anchor_listener = (line: Line, anchor: Anchor) => {
    anchor.shape.on('dragmove', () => {
        // -- Get the anchor position
        const { x, y } = anchor.shape.position();

        // -- Make sure that the anchor is within the line
        const const_x = anchor.line.points()[0],
            max_y = anchor.max_y,
            min_y = anchor.min_y;

        // -- Set the anchor position
        const width = anchor.shape.width(),
            height = anchor.shape.height();

        // -- Set the anchor position
        anchor.shape.position({
            x: const_x - width / 2,
            y: Math.max(
                min_y - height / 2, 
                Math.min(max_y - height / 2, y)
            ),
        });

        // -- Render the line
        render_line(line);
    });

    // -- Render the line
    render_line(line);
};


/**
 * @name create_line
 * @description Creates a line (box) and adds it to the layer
 * @param {number} width The width of the box
 * @param {number} height The height of the box
 * @param {string} line_stroke The line stroke color
 * @param {string} line_fill The line fill color
 * @param {string} anchor_stroke The anchor stroke color
 * @param {string} anchor_fill The anchor fill color
 * @returns {Line} The line
 */
const create_line = (
    width: number, 
    height: number,

    line_stroke: string = '#e0e0e0',
    line_fill: string = '#e0e0e030',

    anchor_stroke: string = 'black',
    anchor_fill: string = 'white',
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

    // -- Return the line
    return {
        line: _line,
        points: [],
        width, height,
        anchor: _anchor,
        spread: 0,
        anchors: _anchors,
        def_points: _line.points(),
        get_layer: () => _layer,
        get_index,
        add_anchor: (x: number = 0, y: number = 0) => {
            const anchor = _anchor.clone({x, y});
            const obj = { 
                shape: anchor, 
                line: new konva.Line({
                    points: [],
                    stroke: '#e0e0e0',
                    strokeWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round',
                    draggable: false,
                    fill: 'blue',
                    closed: false,
                }),

                max_y: 0,
                min_y: 0,
            };

            _layer.add(obj.line);
            _layer.add(obj.shape);
            _layer.draw();
            _anchors.push(obj);

            anchor_listener(_lines[get_index()], obj);
            return obj;
        }
    };
}



const main_line = create_line(1000, 90);
_lines.push(main_line);
init_anchors(main_line, 10);
render_line(main_line);