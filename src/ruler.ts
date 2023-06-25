import konva, {} from 'konva';
import { Line } from './index.d';

const grid_x = (start_x: number, start_y: number) => new konva.Line({
    points: [
        start_x, start_y,
        start_x + window.innerWidth, start_y
    ],
    stroke: '#dddddd15',
    strokeWidth: 1,
});

const grid_y = (start_x: number, start_y: number) => new konva.Line({
    points: [
        start_x, start_y,
        start_x, start_y - window.innerHeight
    ],
    stroke: '#dddddd15',
    strokeWidth: 1,
});



export const draw_grid = (line: Line) => {
    // -- 10px is 1cm
    let grid_size = 10,
        padding = 20,
        color = '#ffffff35';
    
    // -- Get the layer
    const layer = line.get_layer(),
        width = layer.width(),
        height = layer.height();

    // -- Get the starting point
    const start_x = line.bounding_box.x(),
        start_y = line.bounding_box.y() + line.bounding_box.height();

    // -- Draw the grid
    for (let i = 0; i < line.height; i += grid_size) {
        const x = grid_x(start_x - padding, start_y - (i * grid_size)),
            text = new konva.Text({
                x: start_x - padding - 20,
                y: start_y - (i * grid_size),
                fill: color,
                text: `${i}mm`,
            });

        // -- Center the text
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() / 2);

        layer.add(text);
        layer.add(x);
    }

    for (let i = 0; i < line.width; i += grid_size) {
        const y = grid_y(start_x + (i * grid_size), start_y + padding),
            text = new konva.Text({
                x: start_x + (i * grid_size),
                y: start_y + padding + 10,
                fill: color,
                text: `${i}mm`,
            });

        // -- Center the text
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() / 2);

        layer.add(text);
        layer.add(y);
    }

};