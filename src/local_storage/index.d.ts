import { LineConfiguration } from '../index.d';

export interface FSMarker {
    type: FSType;
    name: string;
    created: number;
    updated: number;
}

export type FSProject = {
    preview: string;
    x_meta?: LineConfiguration;
    y_meta?: LineConfiguration;
} & FSMarker;

export type FSSettings = {
} & FSMarker;

export type AData = {
    x: number;
    y: number;
}[];

export type ProjectData = {
    x: AData;
    y: AData;
};

export type FSType = 'project' | 'x_pattern' | 'y_pattern';

export type PaginateSort = 'asc' | 'desc';
export type PaginateOrder = 'created' | 'updated' | 'name';
