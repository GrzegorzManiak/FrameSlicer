import { Colors, LineConfiguration } from './index.d';

export const validate_line_config = (
    obj: unknown
): boolean => {
    // -- Validate the object
    if (typeof obj !== 'object' || obj === null) return false;
    const config = obj as LineConfiguration;

    // -- Validate properties one by one
    if (!config.colors || typeof config.colors !== 'object') 
        return false;
    
    // -- All color properties must be present
    const color_props: Array<keyof Colors> = [
        'line',
        'path',
        'anchor',
        'anchor_handle',
        'anchor_guide',
        'ghost_anchor_handle',
        'ghost_anchor_guide',
        'depth_line',
        'bounding_box'
    ];

    // -- Validate each color property
    for (const prop of color_props) {
        if (
            !config.colors[prop] || 
            typeof config.colors[prop] !== 'object'
        ) return false;
        
        if (
            typeof config.colors[prop].stroke !== 'string' || 
            typeof config.colors[prop].fill !== 'string'
        ) return false;

    }

    // -- Validate size
    if (
        !config.size ||
        typeof config.size !== 'object' ||
        typeof config.size.width !== 'number' ||
        typeof config.size.height !== 'number'
    ) return false;
    
    // -- Validate the rest of the properties
    if (
        typeof config.cutting_depth !== 'number' ||
        typeof config.is_y_line !== 'boolean' ||
        typeof config.y_offset !== 'number' ||
        typeof config.anchor_spread !== 'number' ||
        typeof config.handle_padding !== 'number' ||
        typeof config.depth_buffer !== 'number' ||
        (
            config.achor_position !== 'top' && 
            config.achor_position !== 'bottom'
        )
    ) return false;

    // -- If we made it this far, we're good
    return true;
}