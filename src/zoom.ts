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
 * @param value - The value to set the zoom to
 */
export const set_zoom = (value: number) => {
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


// -- Zoom constants
const change_ammount = 0.05;
const min_zoom = 0.25;
const max_zoom = 2;


// -- Buttons
const get_cur = () => parseFloat(zoom_level.value);

// -- Zoom in
si.assign_action('view-zoom-in', () => set_zoom(get_cur() + change_ammount));
zoom_plus.addEventListener('click', () => set_zoom(get_cur() + change_ammount));

// -- Zoom out
si.assign_action('view-zoom-out', () => set_zoom(get_cur() - change_ammount));
zoom_minus.addEventListener('click', () => set_zoom(get_cur() - change_ammount));

// -- Zoom level
zoom_level.addEventListener('change', () => set_zoom(get_cur()));


// -- Scroll
_stage.on('wheel', (e) => {
    // -- Get the zoom level
    const current = parseFloat(_stage.scaleX().toFixed(2));

    // -- Calculate the new zoom level
    let new_zoom = current;
    if (e.evt.deltaY < 0) new_zoom = Math.min(max_zoom, current + change_ammount);
    else new_zoom = Math.max(min_zoom, current - change_ammount);

    // -- Set the new zoom level
    set_zoom(new_zoom);
});


// -- Zoom to fit
set_zoom(1);