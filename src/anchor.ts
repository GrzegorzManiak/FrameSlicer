import { render_line } from './render';
import { get_client_size } from './aux';
import { Anchor, Line } from './index.d';

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



/**
 * @name handle_listener
 * @description Handles the listener for the handle of an anchor
 * allowing it to move left and right
 * @param {Line} line The line
 * @param {Anchor} anchor The anchor
 * @returns {void} Nothing
 */
export const handle_listener = (line: Line, anchor: Anchor) => {
    anchor.handle.on('dragmove', () => {
        // -- Get the handle position
        const [width, height] = get_client_size(),
            { x, y } = anchor.handle.position();

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



/**
 * @name anchor_listener
 * @description Handles the listener for the anchor of a line
 * allowing it to move up and down
 * @param {Line} line The line
 * @param {Anchor} anchor The anchor
 * @returns {void} Nothing
 */
export const anchor_listener = (line: Line, anchor: Anchor) => {
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