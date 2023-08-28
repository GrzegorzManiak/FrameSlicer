import konva, {} from 'konva';
import { append_listener, get_active_tool } from '../tools/loader';

const scale_by = 1.015;

const is_touch_enabled = () => ('ontouchstart' in window) || 
(navigator.maxTouchPoints > 0) || (navigator.maxTouchPoints > 0);

const get_center = (p1, p2) => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
});

const get_distance = (p1, p2) => Math.sqrt(
    Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
);

export function handle_controlls(stage: konva.Stage) {
    let last_center = null;
    let last_dist = 0;


    const handle_touch = (e) => {
        e.evt.preventDefault();

        let t1 = e.evt.touches[0],
            t2 = e.evt.touches[1];

        // -- if there are no two touches, do nothing
        if (!t1 || !t2) return;

        // -- If were dragging, stop dragging
        if (stage.isDragging()) stage.stopDrag();

        
        // -- Get the two touch points
        let p1 = { x: t1.clientX, y: t1.clientY },
            p2 = { x: t2.clientX, y: t2.clientY };


        // -- If there is no last center, set it to the center of the two points
        //    and return
        if (!last_center) return last_center = get_center(p1, p2);
    

        let new_center = get_center(p1, p2),
            dist = get_distance(p1, p2);

        if (!last_dist) last_dist = dist;
        

        // -- local coordinates of center point
        const point_to = {
            x: (new_center.x - stage.x()) / stage.scaleX(),
            y: (new_center.y - stage.y()) / stage.scaleX()
        };

        const scale = stage.scaleX() * (dist / last_dist);
        stage.scaleX(scale);
        stage.scaleY(scale);


        // -- calculate new position of the stage
        const dx = new_center.x - last_center.x,
            dy = new_center.y - last_center.y;

        const new_pos = {
            x: new_center.x - point_to.x * scale + dx,
            y: new_center.y - point_to.y * scale + dy
        };


        // -- Set changes and draw 
        stage.position(new_pos);
        stage.batchDraw();
        last_dist = dist;
        last_center = new_center;
    }

    const touch_end = () => {
        last_center = null;
        last_dist = 0;
    }


    // -- Event listeners --
    append_listener((tool) => {
        if (tool.tool === 'move') stage.draggable(true && !is_touch_enabled());
        else stage.draggable(false);
    });

    if (get_active_tool().tool === 'move') stage.draggable(true && !is_touch_enabled());
    else stage.draggable(false);

    stage.on('touchstart', handle_touch);
    stage.on('touchmove', handle_touch);
    stage.on('touchend', touch_end);
}