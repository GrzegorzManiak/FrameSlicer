import Shortcuts from './shortcuts';
import { _stage } from './index';

// -- Load the shortcuts
const si = Shortcuts.get_instance();

// -- Zoom 
const zoom_plus = document.querySelector('.zoom-in') as HTMLElement,
    zoom_minus = document.querySelector('.zoom-out') as HTMLElement,
    zoom_level = document.querySelector('#zoom-level') as HTMLInputElement;

if (!zoom_plus || !zoom_minus || !zoom_level
) throw new Error('Missing zoom elements');



/**
 * @name set_zoom
 * Set the zoom level
 * 
 * @param {number} value - The value to set the zoom to
 * @param {number} [min_zoom=0.25] - The minimum zoom level
 * @param {number} [max_zoom=2] - The maximum zoom level
 * 
 * @param value - The value to set the zoom to
 */
export const set_zoom = (
    value: number,
    min_zoom: number = 0.25,
    max_zoom: number = 2,
) => {
    // -- Clamp zoom value
    if (value < min_zoom) value = min_zoom;
    if (value > max_zoom) value = max_zoom;
    
    // -- Round to 2 decimals
    value = Math.round(value * 100) / 100;
    zoom_level.value = `${value}`;

    const old_scale = _stage.scaleX();
    const new_scale = value;

    // -- Calculate the zoom origin (center of the stage)
    const center_x = _stage.width() / 2;
    const center_y = _stage.height() / 2;

    // -- Apply new scale and position
    _stage.scale({ x: new_scale, y: new_scale });
    _stage.position({ 
        x: center_x - (center_x - _stage.x()) * (new_scale / old_scale),
        y: center_y - (center_y - _stage.y()) * (new_scale / old_scale),
    });

    _stage.batchDraw();

}



/**
 * @name init_zoom
 * Initialize the zoom functionality
 * 
 * @param {number} [change_ammount=0.05] - The ammount to change the zoom by
 * @param {number} [min_zoom=0.25] - The minimum zoom level
 * @param {number} [max_zoom=2] - The maximum zoom level
 * 
 * @returns {void} Nothing
 */
export const init_zoom = (
    change_ammount: number = 0.05,
    min_zoom: number = 0.25,
    max_zoom: number = 2,
) => {


    // -- Buttons
    const get_cur = () => {
        // -- Ensure the zoom level is a number
        let zoom = parseFloat(zoom_level.value);
        if (isNaN(zoom)) zoom = 1;
        return zoom;
    }

    // -- Zoom in
    si.assign_action('view-zoom-in', () => 
        set_zoom(get_cur() + change_ammount, min_zoom, max_zoom));
    zoom_plus.addEventListener('click', () => 
        set_zoom(get_cur() + change_ammount, min_zoom, max_zoom));

    // -- Zoom out
    si.assign_action('view-zoom-out', () => 
        set_zoom(get_cur() - change_ammount, min_zoom, max_zoom));
    zoom_minus.addEventListener('click', () => 
        set_zoom(get_cur() - change_ammount, min_zoom, max_zoom));

    // -- Zoom level
    zoom_level.addEventListener('change', () => 
        set_zoom(get_cur(), min_zoom, max_zoom));


    // -- Scroll
    _stage.on('wheel', (e) => {
        // -- Get the zoom level
        const current = parseFloat(_stage.scaleX().toFixed(2));

        // -- Calculate the new zoom level
        let new_zoom = current;
        if (e.evt.deltaY < 0) new_zoom = Math.min(max_zoom, current + change_ammount);
        else new_zoom = Math.max(min_zoom, current - change_ammount);

        // -- Set the new zoom level
        set_zoom(new_zoom, min_zoom, max_zoom);
    });


    // -- Zoom to fit
    set_zoom(1);
};