import Point from './point';
import konva from 'konva';

export type Points = Array<Point>;

export type Line = {
    width: number,
    height: number,
    line: konva.Line,
    points: Points,
    anchor: konva.Shape,
    anchors: Array<Anchor>,
    spread: number,
    def_points: Array<number>,
    get_layer: () => konva.Layer,
    get_index: () => number,
    add_anchor: (x: number | void, y: number | void) => Anchor,
}

export type Anchor = {
    shape: konva.Shape,
    line: konva.Line,
    x: number,
    y: number,
    max_y: number,
    min_y: number,
}

export type Lines = Array<Line>;