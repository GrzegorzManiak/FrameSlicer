import konva, {} from 'konva';
import Line from '../line';



/**
 * @name grid_x
 * Creates a grid line on the x axis
 * 
 * @param {number} start_x - The start x position
 * @param {number} start_y - The start y position
 * @param {number} length - The length of the line
 * 
 * @returns {konva.Line} The grid line
 */
const grid_x = (
    start_x: number, 
    start_y: number, 
    length: number
) => new konva.Line({
    points: [
        start_x, start_y,
        start_x + length, start_y
    ],
    stroke: '#dddddd15',
    strokeWidth: 1,
});



/**
 * @name grid_y
 * Creates a grid line on the y axis
 * 
 * @param {number} start_x - The start x position
 * @param {number} start_y - The start y position
 * @param {number} length - The length of the line
 * 
 * @returns {konva.Line} The grid line
 */
const grid_y = (
    start_x: number, 
    start_y: number, 
    length: number
) => new konva.Line({
    points: [
        start_x, start_y,
        start_x, start_y - length
    ],
    stroke: '#dddddd15',
    strokeWidth: 1,
});



/**
 * @name draw_grid
 * Draws a grid on the layer
 * 
 * @param {Line} line - The line
 * @param {boolean} [render_x=true] - If the x axis grid should be rendered
 * @param {boolean} [render_y=true] - If the y axis grid should be rendered
 * 
 * @returns {void}
 */
export const draw_grid = (
    line: Line,
    render_x: boolean = true,
    render_y: boolean = true,
) => {

    // -- 10px is 1cm
    let grid_size = 10,
        padding = 20,
        color = '#ffffff35',
        extra = 1;

    
    // -- Get the layer
    const layer = line._layer

    // -- Get the starting point
    const start_x = line._bounding_box.x(),
        start_y = line._bounding_box.y() + line._bounding_box.height(),
        x_lines = (line.height / 100) + extra,
        y_lines = (line.width / 100) + extra,
        x_lenght = x_lines * grid_size * 10,
        y_lenght = y_lines * grid_size * 10;



    if (render_x) for (
        let i = 0; i < x_lines; i++
    ) {
        const x = grid_x(
            start_x - padding, 
            start_y - (i * 10 * grid_size),
            y_lenght
        ),
            text = new konva.Text({
                x: start_x - padding - 20,
                y: start_y - (i * 10 * grid_size),
                fill: color,
                text: `${i * 10}mm`,
            });

        // -- Center the text
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() / 2);

        layer.add(text);
        layer.add(x);
    }



    if (render_y) for (
        let i = 0; i < y_lines; i++
    ) {
        const y = grid_y(
            start_x + (i * 10 * grid_size), 
            start_y + padding, 
            x_lenght
        ),
            text = new konva.Text({
                x: start_x + (i * 10 * grid_size),
                y: start_y + padding + 10,
                fill: color,
                text: `${i * 10}mm`,
            });

        // -- Center the text
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() / 2);

        layer.add(text);
        layer.add(y);
    }

};