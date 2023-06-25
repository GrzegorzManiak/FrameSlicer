import { Line } from './index.d';

/**
 * @name init_anchors
 * @description Initializes the anchors for a line
 * @param {Line} line The line
 * @param {number} spread The spread of the anchors 
 * @returns {void} Nothing
 */
export const init_anchors = (line: Line, spread: number) => {
    // -- Some calculations
    const width = line.width,
        height = line.cutting_depth,
        layer = line.get_layer();

    // -- Set the spread
    const _spread = width / spread;
    line.spread = _spread;

    // -- Calculate the center of the screen
    const offset_left = (layer.width() - width) / 2,
        offset_top = (layer.height() - height) / 2;

    // -- Create the anchors
    for (let i = 0; i < spread; i++) {
        add_anchor(
            line,
            offset_left + _spread * i,
            offset_top,
        )
   }
};



/**
 * @name add_anchor
 * @description Adds an anchor to the line
 * @param {number} x The x position of the anchor
 * @param {number} y The y position of the anchor
 * @returns {Anchor} The anchor
 */
export const add_anchor = (line: Line, x?: number, y?: number) => {
    // -- Create the anchor
    const anchor = line.add_anchor(),
    a_size = anchor.shape.size();

    // -- Center the anchor
    anchor.shape.position({ 
        x: x - a_size.width / 2,
        y: y - a_size.height / 2,
    });


    // -- Line
    const points = [
        x, y,
        x, y + line.cutting_depth + line.handle_padding,
    ];

    // -- Set the bounds
    anchor.max_y = y + line.cutting_depth;
    anchor.min_y = y;

    // -- Set the points
    anchor.line.points(points);


    // -- Handle
    const handle = anchor.handle;
    handle.position({
        x: x - handle.width() / 2,
        y: anchor.max_y - handle.height() / 2 + line.handle_padding,
    });
    anchor.handle_y = handle.position().y;
};