import konva, {} from 'konva';
import { Line } from './index.d';

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



export const draw_grid = (line: Line) => {
    // -- 10px is 1cm
    let grid_size = 10,
        padding = 20,
        color = '#ffffff35',
        extra = 2;
    
    // -- Get the layer
    const layer = line.get_layer();

    // -- Get the starting point
    const start_x = line.bounding_box.x(),
        start_y = line.bounding_box.y() + line.bounding_box.height();

    const x_lines = (line.height / 100) + extra,
        y_lines = (line.width / 100) + extra,
        x_lenght = x_lines * grid_size * 10,
        y_lenght = y_lines * grid_size * 10;

    // -- Draw the grid
    for (let i = 0; i < x_lines; i++) {
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

    for (let i = 0; i < y_lines; i++) {
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