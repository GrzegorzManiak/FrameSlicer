import konva, {} from 'konva';

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
        


    const zoom_stage = (event) => {
        event.evt.preventDefault();
        const old_scale = stage.scaleX();

        const { 
            x: pointerX, 
            y: pointerY 
        } = stage.getPointerPosition();

        const mouse_point_to = {
            x: (pointerX - stage.x()) / old_scale,
            y: (pointerY - stage.y()) / old_scale,
        };

        const new_scale = event.evt.deltaY > 0 ? old_scale * scale_by : old_scale / scale_by;
        stage.scale({ x: new_scale, y: new_scale });

        const newPos = {
            x: pointerX - mouse_point_to.x * new_scale,
            y: pointerY - mouse_point_to.y * new_scale,
        }

        stage.position(newPos);
        stage.batchDraw();
    }



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
    stage.draggable(!is_touch_enabled());
    stage.on('wheel', zoom_stage);
    stage.on('touchstart', handle_touch);
    stage.on('touchmove', handle_touch);
    stage.on('touchend', touch_end);
}