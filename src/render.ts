import { get_client_size } from './aux';
import { Line } from './index.d';


/**
 * @name sort_anchors
 * @description Sorts the anchors by x position
 * used for rendering the line correctly
 * @param {Line} line The line
 * @returns {void} Nothing
 */
export const sort_anchors = (line: Line) => {
    line.anchors.sort((a, b) => {
        const a_pos = a.shape.position(),
            b_pos = b.shape.position();
        if (a_pos.x < b_pos.x) return -1;
        if (a_pos.x > b_pos.x) return 1;
        return 0;
    });
}



const render_line_points = (line: Line): void => {
    let points: Array<number> = [];

    // -- Main lines
    line.anchors.forEach((anchor) => {
        const { x, y } = anchor.shape.position();
        points.push(
            x + anchor.shape.width() / 2,
            y + anchor.shape.height() / 2,
        );
    });


    // -- Close the line
    points = [
        ...points,
        line.bounding_box.x() + line.bounding_box.width(),
        line.bounding_box.height() + line.bounding_box.y(),
        line.bounding_box.x(),
        line.bounding_box.height() + line.bounding_box.y(),
    ]

    // -- Set the points
    line.line.points(points);
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



const draw_bounding_rect = (line: Line) => {
    const [c_width, c_height] = get_client_size();

    line.bounding_box.size({
        width: line.width,
        height: line.height,
    });

    line.bounding_box.position({
        x: (c_width / 2) - (line.width / 2),
        y: (c_height / 2) - (line.height / 2),
    });
}


/**
 * @name render_line
 * @description Renders everything to do with
 * the line, including the anchors, the depth
 * line, anchor guides etc.
 * @param {Line} line The line to render
 */
export const render_line = (line: Line) => {
    sort_anchors(line);
    render_line_points(line);
    render_depth_line(line);
    render_anchor_guides(line);
    draw_bounding_rect(line);
    line.get_layer().draw();
};