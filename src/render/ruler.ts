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
    const layer = line._layer;

    let x_shapes: Array<konva.Line> = [],
        y_shapes: Array<konva.Line> = [],
        x_texts: Array<konva.Text> = [],
        y_texts: Array<konva.Text> = [];

    // -- Get the starting point
    let start_x = line.position.x,
        start_y = line.position.y + line.config.size.height,
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
        );

        const text = new konva.Text({
            x: start_x - padding - 20,
            y: start_y - (i * 10 * grid_size),
            fill: color,
            text: `${i * 10}mm`,
        });

        x_shapes.push(x);
        x_texts.push(text);

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
        )
        const text = new konva.Text({
            x: start_x + (i * 10 * grid_size),
            y: start_y + padding + 10,
            fill: color,
            text: `${i * 10}mm`,
        });

        y_texts.push(text);
        y_shapes.push(y);

        // -- Center the text
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() / 2);

        layer.add(text);
        layer.add(y);
    }


    // -- This is a way to reduce the amount of resize events
    //    that we have to process, it will wait for the user
    //    to stop resizing the window before executing the function
    let resize_timeout;
    window.addEventListener('resize', () => {
        if (resize_timeout) clearTimeout(resize_timeout);
        resize_timeout = setTimeout(() => resize(), 100);
    });


    // -- Resize listener
    const resize = () => {
        
        start_x = line.position.x;
        start_y = line.position.y + line.config.size.height;
        x_lines = (line.height / 100) + extra;
        y_lines = (line.width / 100) + extra;
        x_lenght = x_lines * grid_size * 10;
        y_lenght = y_lines * grid_size * 10;


        if (render_x) for ( 
            let i = 0; i < x_lines; i++
        ) {
            const x = x_shapes[i],
                text = x_texts[i];

            const sx = start_x + (i * 10 * grid_size), 
                sy = start_y + padding;
                
            x.points([
                sx, sy,
                sx + y_lenght, sy
            ]);

            text.position({
                x: start_x - padding - 20,
                y: start_y - (i * 10 * grid_size),
            });

            // -- Center the text
            text.offsetX(text.width() / 2);
            text.offsetY(text.height() / 2);
        }


        if (render_y) for (
            let i = 0; i < y_lines; i++
        ) {
            const y = y_shapes[i],
                text = y_texts[i];

            const sx = start_x - padding,
                sy = start_y - (i * 10 * grid_size);

            y.points([
                sx, sy,
                sx, sy - x_lenght
            ]);

            text.position({
                x: start_x + (i * 10 * grid_size),
                y: start_y + padding + 10,
            });

            // -- Center the text
            text.offsetX(text.width() / 2);
            text.offsetY(text.height() / 2);
        }
    };
};