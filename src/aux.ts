import konva, {} from 'konva';
import { Line } from './index.d';
import Point from './point';
/**
 * @name get_client_size
 * @description Returns the size of the client window
 * @returns {number[]} [width, height]
 */
export const get_client_size = () => {
    const { clientWidth: width, clientHeight: height } = document.documentElement;
    return [width, height];
}



/**
 * @name get_mouse_pos
 * @description Returns the mouse position relative to the canvas
 * @param {konva.Stage} stage The stage
 * @param {konva.Layer} layer The layer
 */
export const get_mouse_pos = (stage: konva.Stage, layer: konva.Layer): number[] => {
    const pos = stage.getPointerPosition();
    return [pos.x, pos.y];
}



/**
 * @name center_line
 * @description Centers the line on the layer
 * @param {konva.Layer} layer The layer
 * @param {Line} line The line
 */
export const center_line = (layer: konva.Layer, line: Line) => {
    const [width, height] = get_client_size();
    const x = (width - line.line.width()) / 2,
        y = (height - line.line.height()) / 2;
    line.line.position({ x, y });
    layer.draw();
}
