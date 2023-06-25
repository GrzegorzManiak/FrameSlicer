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



const sort_anchors = (line: Line) => {
    line.anchors.sort((a, b) => {
        const a_pos = a.shape.position(),
            b_pos = b.shape.position();
        if (a_pos.x < b_pos.x) return -1;
        if (a_pos.x > b_pos.x) return 1;
        return 0;
    });
}



const generate_points = (line: Line): Array<number> => {
    let points: Array<number> = [];

    // -- Main lines
    line.anchors.forEach((anchor) => {
        const { x, y } = anchor.shape.position();
        points.push(
            x + anchor.shape.width() / 2,
            y + anchor.shape.height() / 2,
        );
    });


    // -- First and last Anchors, this is done to close
    //    off the line at the correct height.
    (() => {
        // -- Last Anchor
        const anchor = line.anchors[line.anchors.length - 1],
        { x, y } = anchor.shape.position();

        // -- Last Anchor
        points = [
            ...points,
            x + anchor.shape.width() / 2,
            anchor.min_y + line.height,
        ];
    })();

    (() => {
        // -- First Anchor
        const anchor = line.anchors[0],
        { x, y } = anchor.shape.position();

        // -- First Anchor
        points = [
            ...points,
            x + anchor.shape.width() / 2,
            anchor.min_y + line.height,
        ];
    })();


    // -- Return the points
    return points;
}



const render_depth_line = (line: Line) => {
    
    let points: Array<number> = [];
    line.anchors.forEach((anchor) => {
        const { x, y } = anchor.shape.position();
        points.push(
            x + anchor.shape.width() / 2,
            anchor.max_y,
        );
    });

    // -- First and last Anchors, sets nice buffers
    //    on either side of the line.
    (() => {
        const anchor = line.anchors[line.anchors.length - 1],
        { x, y } = anchor.shape.position();

        // -- Last Anchor
        points = [
            ...points,
            (x + anchor.shape.width() / 2) + line.depth_buffer,
            anchor.max_y,
        ];
    })();

    (() => {
        const anchor = line.anchors[0],
        { x, y } = anchor.shape.position();

        // -- First Anchor
        points = [
            (x + anchor.shape.width() / 2) - line.depth_buffer,
            anchor.max_y,
            ...points,
        ];
    })();

    // -- Set the points
    line.depth_line.points(points);
};



const render_anchor_guides = (line: Line) => {
    line.anchors.forEach((anchor) => {
        
        // -- Get the handle position
        const h_pos = anchor.handle.position(),
            h_size = anchor.handle.size(),
            x = h_pos.x + h_size.width / 2;

        // -- Set the line position
        anchor.line.points([
            x, anchor.min_y,
            x, anchor.max_y + line.handle_padding,
        ]);
    });
};



const handle_listener = (line: Line, anchor: Anchor) => {
    anchor.handle.on('dragmove', () => {
        // -- Get the handle position
        const { x, y } = anchor.handle.position();

        const const_y = anchor.handle_y,
            min_x = 0,
            max_x = width;

        const new_x = Math.max(min_x, Math.min(max_x, x));

        // -- Set the handle position
        anchor.handle.position({
            x: new_x,
            y: const_y,
        });
        
        // -- Move the anchor
        anchor.shape.position({
            x: new_x - (anchor.shape.width() / 2) + (anchor.handle.width() / 2),
            y: anchor.shape.position().y,
        });

        // -- Render the line
        render_line(line);
    });
};



const render_line = (line: Line) => {
    sort_anchors(line);
    const points = generate_points(line);
    line.line.points(points);
    render_depth_line(line);
    render_anchor_guides(line);
    _layer.draw();
};



const anchor_listener = (line: Line, anchor: Anchor) => {
    anchor.shape.on('dragmove', () => {
        // -- Get the anchor position
        const { x, y } = anchor.shape.position();

        // -- Make sure that the anchor is within the line
        const max_y = anchor.max_y,
            min_y = anchor.min_y;

        // -- Get the cnst X from the handle
        const handle_pos = anchor.handle.position(),
            handle_size = anchor.handle.size(),
            const_x = handle_pos.x + handle_size.width / 2;

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