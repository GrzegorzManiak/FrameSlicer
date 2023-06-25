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
        height = line.height,
        layer = line.get_layer();

    // -- Set the spread
    const _spread = width / spread;
    line.spread = _spread;

    // -- Calculate the center of the screen
    const offset_left = (layer.width() - width) / 2,
        offset_top = (layer.height() - height) / 2;

    // -- Create the anchors
    for (let i = 0; i < spread; i++) {

        // -- Create the anchor
        const anchor = line.add_anchor(),
            a_size = anchor.shape.size();

        // -- Center the anchor
        anchor.shape.position({ 
            x: offset_left + _spread * i - a_size.width / 2,
            y: offset_top - a_size.height / 2,
        });


        // -- Line
        const x = _spread * i + offset_left;
        const points = [
            x, offset_top,
            x, offset_top + height,
        ];

        // -- Set the bounds
        anchor.max_y = offset_top + height;
        anchor.min_y = offset_top;

        // -- Set the points
        anchor.line.points(points);
    }
};