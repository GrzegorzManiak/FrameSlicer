import Point from './point';
import konva from 'konva';

export type Points = Array<Point>;

export type Line = {
    width: number,
    height: number,
    cutting_depth: number,
    depth_line: konva.Line,
    depth_buffer: number,
    line: konva.Line,
    points: Points,
    anchor: konva.Shape,
    anchors: Array<Anchor>,
    anchor_handle: konva.Shape,
    handle_padding: number,
    spread: number,
    bounding_box: konva.Rect,
    def_points: Array<number>,
    get_layer: () => konva.Layer,
    get_index: () => number,
    add_anchor: (x: number | void, y: number | void) => Anchor,
}

export type Anchor = {
    shape: konva.Shape,
    line: konva.Line,
    handle: konva.Shape,
    max_y: number,
    min_y: number,
    handle_y: number,
}

export type Lines = Array<Line>;