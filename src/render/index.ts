import { get_client_size } from '../aux';
import Line from '../line';



/**
 * @name render_line_points
 * Renders the normal line points for the z 
 * axis aka how deep the cut will be
 * 
 * @param {Line} line - The line to render to point for
 * 
 * @returns {void} Nothing
 */
const render_line_points = (
    line: Line
): void => {

    // -- Svg path
    let path = 'M ';

    // -- Create the main line with bezier curves
    line.anchors.forEach((anchor, index) => {

        let { x, y } = anchor.shape.position();
        x += anchor.shape.width() / 2;
        y += (anchor.shape.height() / 2);

        path += `${x} ${y} `;
    });

    // -- Close the line
    const points = [
        line._bounding_box.x() + line._bounding_box.width(),
        line.config.cutting_depth + line._bounding_box.y(),

        line._bounding_box.x() + line._bounding_box.width(),
        line._bounding_box.height() + line._bounding_box.y(),

        line._bounding_box.x(),
        line._bounding_box.height() + line._bounding_box.y(),

        line._bounding_box.x(),
        line.config.cutting_depth + line._bounding_box.y(),
    ]

    // -- Set the points
    points.forEach((point, index) => {
        if (index % 2 === 0) path += `L ${point} `;
        else path += `${point} `;
    });


    // -- Set the path
    line.set_path(path + 'Z');
};



/**
 * @name render_y_offset_line
 * This renders the offset line thats used
 * to indicate the side to side movement of 
 * the router.
 * 
 * @param {Line} line - The line to render the offset line for
 * 
 * @returns {void} Nothing
 */
const render_y_offset_line = (
    line: Line
): void => {
    // -- Svg path
    let path = 'M ';
    if (line.anchors.length === 0) return;

    // -- Create the main line with bezier curves
    line.anchors.forEach((anchor, index) => {

        let { x, y } = anchor.shape.position();
        x += anchor.shape.width() / 2;
        y += (anchor.shape.height() / 2);

        path += `${x} ${y} `;
    });

    // -- Set the path
    line.set_path(path);
};



/**
 * @name render_depth_line
 * THis renders the Red line that indicates 
 * the maximum depth of the cut.
 * 
 * @param {Line} line - The line to render the depth line for
 * 
 * @returns {void} Nothing
 */
const render_depth_line = (
    line: Line
) => {
    
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
    {
        const anchor = line.anchors[line.anchors.length - 1],
        { x, y } = anchor.shape.position();

        // -- Last Anchor
        points = [
            ...points,
            (x + anchor.shape.width() / 2) + line.config.depth_buffer,
            anchor.max_y,
        ];
    }

    {
        const anchor = line.anchors[0],
        { x, y } = anchor.shape.position();

        // -- First Anchor
        points = [
            (x + anchor.shape.width() / 2) - line.config.depth_buffer,
            anchor.max_y,
            ...points,
        ];
    };

    // -- Set the points
    line._depth_line.points(points);
};



/**
 * @name render_anchor_guides
 * This renders the anchor guides / the tracks
 * that the anchors move along
 * 
 * @param {Line} line - The line to render
 * 
 * @returns {void} Nothing
 */
const render_anchor_guides = (
    line: Line
) => {
    line.anchors.forEach((anchor) => {
        
        // -- Get the handle position
        const h_pos = anchor.handle.position(),
            h_size = anchor.handle.size(),
            x = h_pos.x + h_size.width / 2;

        // -- Set the line position
        anchor.line.points([
            x, anchor.min_y - line.config.handle_padding,
            x, anchor.max_y + line.config.handle_padding,
        ]);
    });
};



/**
 * @name draw_bounding_rect
 * Draws the bounding rectangle that encloses
 * the line
 * 
 * @param {Line} line - The line to draw the bounding
 * 
 * @returns {void} Nothing
 */
const draw_bounding_rect = (
    line: Line
) => {
    const [c_width, c_height] = get_client_size();

    line._bounding_box.size({
        width: line.width,
        height: line.height,
    });

    line._bounding_box.position({
        x: (c_width / 2) - (line.width / 2),
        y: (c_height / 2) - (line.height / 2) - line.config.y_offset,
    });
};



/**
 * @name render_line
 * Renders everything to do with
 * the line, including the anchors, the depth
 * line, anchor guides etc.
 * 
 * @param {Line} line - The line to render
 * 
 * @returns {void} Nothing
 */
export const render_line = (
    line: Line
) => {
    line.sort_anchors();
    if (!line.config.is_y_line) render_line_points(line);
    else render_y_offset_line(line);
    if (!line.config.is_y_line) render_depth_line(line);
    render_anchor_guides(line);
    draw_bounding_rect(line);
    line._layer.batchDraw();
};