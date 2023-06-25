import konva, {} from 'konva';

const scaleBy = 1.01;

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

        const oldScale = stage.scaleX();
        const { x: pointerX, y: pointerY } = stage.getPointerPosition();
        const mousePointTo = {
            x: (pointerX - stage.x()) / oldScale,
            y: (pointerY - stage.y()) / oldScale,
        };

        const newScale = event.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
        stage.scale({ x: newScale, y: newScale });

        const newPos = {
            x: pointerX - mousePointTo.x * newScale,
            y: pointerY - mousePointTo.y * newScale,
        }

        stage.position(newPos);
        stage.batchDraw();
    }



    const handle_touch = (e) => {
        e.evt.preventDefault();

        let t1 = e.evt.touches[0],
            t2 = e.evt.touches[1];
        if (!t1 || !t2) return;


        if (stage.isDragging())
            stage.stopDrag();
            
        
        let p1 = { x: t1.clientX, y: t1.clientY },
            p2 = { x: t2.clientX, y: t2.clientY };

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