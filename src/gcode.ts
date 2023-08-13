import { Line } from './index.d';
import Point from './point';
import konva from 'konva';
import SVGPathCommander from 'svg-path-commander';

let offset_x = 0,
    offset_y = 6,
    offset_z = 23;

export const turn_line_to_points = (
    line: Line,
    resolution: number = 0.5
): Array<Point> => {

    // -- Load the path
    const path = new SVGPathCommander(line.raw_path);

    // -- Get the path length
    const path_length = path.getTotalLength(),
        line_lenght = line.bounding_box.width(),
        raw_points = [],
        points = [];

    // -- Get the number of points
    const number_of_raw_points = Math.floor(path_length / resolution);
    for (let i = 0; i < number_of_raw_points; i++) {
        const point = path.getPointAtLength(i * resolution);
        raw_points.push(new Point(point.x, point.y));
    }

    // -- Now, get the points every resolution and normalize them
    const number_of_points = Math.floor(line_lenght / resolution),
        x_abs = line.bounding_box.x(),
        y_abs = line.bounding_box.y();
    
    for (let i = 0; i < number_of_points; i++) {
        const point = path.getPointAtLength(i * resolution);

        // -- Normalize the points to MM
        points.push(new Point(
            ((point.x - x_abs) / 10) + offset_x,
            offset_y,
            ((point.y - y_abs) / 10) + offset_z
        ));
    }

    // -- Return the points
    return points;
};



/**
 * @name step_points
 * @description This function will take an array of points and will 
 * return an array of layers, where every layer the tool removes x
 * ammount on the Z axis to prevent the tool from breaking.
 * 
 * @param {Line} line 
 * @param {Array<Point>} points - The final line in points
 * @param {number} step - The ammount of mm to remove on the Z axis each pass
 * @returns {Array<Point>}
 */
export const step_points = (
    line: Line,
    points: Array<Point>,
    step: number = 0.25
): Array<Point> => {

    // -- Find the lowest point
    let lowest_point = line.bounding_box.height();
    points.forEach((point, index) => {
        if (point.z > points[lowest_point].z) lowest_point = index;
    });

    lowest_point -= offset_z;

    // -- Calculate the number of steps
    const number_of_steps = Math.floor(points[lowest_point].z / step);

    // -- Create the steps
    let steps = [];
    let skipped = 0;
    for (let i = 0; i < number_of_steps + 1; i++) {
        const cur_step = i * step;
        if (cur_step < offset_z) {
            skipped++;
            continue;
        };
        

        // -- Main path
        points.forEach((point, index) => {
            // -- Calculate the New Z position
            let new_z = point.z;
            if (new_z > cur_step) new_z = cur_step;

            // -- Calculate the new point
            const new_point = new Point(
                point.x,
                point.y,
                new_z
            );

            // -- Add the point to the steps
            steps.push(new_point);
        });

        // -- Return to the start
        const lp = points[points.length - 1],
            fp = points[0],
            y_up = Math.max(cur_step - 5, 0);

        // -- Move up
        const home_points = [
            new Point(
                lp.x,
                lp.y,
                y_up
            ),

            new Point(
                fp.x,
                fp.y,
                y_up
            ),

            new Point(
                fp.x,
                fp.y,
                cur_step
            )
        ];
        
        home_points[0].comment = `UP: [${i-skipped}] of [${number_of_steps}]`;
        home_points[1].comment = `BACK`;
        home_points[2].comment = `DOWN`;

        home_points.forEach((point, index) => 
            steps.push(point));
    }

    // -- Return the steps
    return steps;
};



export const clean_gcode = (gcode: string): string => {
    let new_gcode = '';

    // -- Split the gcode into lines
    const lines = gcode.split('\n');
    lines.forEach((line, index) => {
        if (line.trim() === '') return;
        
        // -- Every 50th line, add an $X command
        if (index % 50 === 0) new_gcode += '$X\n';

        // -- Add the line
        new_gcode += line + '\n';
        
    });

    // -- Return the new gcode
    return new_gcode;
};


export const round = (value: number, decimals: number = 2) => 
    Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);


export const points_to_gcode = (
    line: Line,
    points: Array<Point>,
    resolution: number = 0.005
) => {
    const start_gcode = `
$21=1 ; Enable hard limits
$22=1 ; Enable homing cycle
$20=0 ; Disable soft limits
$H    ; Home all axis

S0       ; Set spindle speed to 0
G90      ; Set absolute coordinates
G21      ; Set units to mm

; Move 1cm in X, Y and Z
G1 X-5 F500
G1 Y-5 F500
G1 Z-5 F500

; Set current position to 0
G92 X0.0 
G92 Y0.0
G92 Z0.0

$20=1        ; Enable soft limits
$130=330.000 ; Set max travel for X axis
$131=330.000 ; Set max travel for Y axis
$132=30.000  ; Set max travel for Z axis

; CODE HERE

M2 ; End program
    `

    const feed = 500;
    let gcode = '';

    // -- Set the feed
    points.forEach((point, index) => {
        let cur_gcode = point.has_comment ? `; ${point.comment}\n` : '';
        cur_gcode += 'G1 ';

        cur_gcode += `X-${round(point.x, 3)} `;

        if (point.y > 0
        ) cur_gcode += `Y-${round(point.y, 3)} `;

        if (point.z > 0
        ) cur_gcode += `Z-${round(point.z, 3)} `;

        cur_gcode += `F${feed}\n`;
        gcode += cur_gcode;
    });

    return start_gcode.replace('; CODE HERE', clean_gcode(gcode));
};



export const download_gcode = (
    line: Line,
    name: string = 'gcode',
    gcode: string
) => {
    const element = document.createElement('a');
    element.setAttribute(
        'href', 
        'data:text/plain;charset=utf-8,' + encodeURIComponent(gcode)
    );
    element.setAttribute('download', `${name}.gcode.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};