import { IVariableInfo } from '.';

export interface IColormapInfo {
    displayName: string;
    imgSrc: string;
    serverName: string;
}

// serverName must match an option on the server
export const COLORMAPS: { [param: string]: IColormapInfo } = {
    wsaEnlil: {
        displayName: 'SWPC-default',
        imgSrc: 'assets/images/wsa_enlil.png',
        serverName: 'WSA-Enlil'
    },
    coolToWarm: {
        displayName: 'Cool to warm',
        imgSrc: 'assets/images/cool_to_warm.png',
        serverName: 'Cool to Warm'
    },
    inferno: {
        displayName: 'Inferno',
        imgSrc: 'assets/images/inferno.png',
        serverName: 'Inferno (matplotlib)'
    },
    plasma: {
        displayName: 'Plasma',
        imgSrc: 'assets/images/plasma.png',
        serverName: 'Plasma (matplotlib)'
    },
    viridis: {
        displayName: 'Viridis',
        imgSrc: 'assets/images/viridis.png',
        serverName: 'Viridis (matplotlib)'
    },
    divergent: {
        displayName: 'Divergent',
        imgSrc: 'assets/images/blue_orange.png',
        serverName: 'Blue Orange (divergent)'
    },
    rainbow: {
        displayName: 'Rainbow',
        imgSrc: 'assets/images/nic_cubicl.png',
        serverName: 'nic_CubicL'
    }
};

// TODO: set these in the server on load
export const VARIABLE_CONFIG: { [param: string]: IVariableInfo } = {
    density: {
        serverName: 'density',
        displayName: 'Density',
        units: 'r<sup>2</sup>N/cm<sup>3</sup>',
        defaultColorRange: [ 0, 60 ],
        defaultColormap: COLORMAPS.wsaEnlil,
        defaultContourValue: 22,
        entireRange: [ 0, 60 ],
        step: 1
    },
    velocity: {
        serverName: 'velocity',
        displayName: 'Radial Velocity',
        units: 'km/s',
        defaultColorRange: [ 200, 1600 ],
        defaultColormap: COLORMAPS.wsaEnlil,
        defaultContourValue: 600,
        entireRange: [ 200, 1600 ],
        step: 50
    },
    pressure: {
        serverName: 'pressure',
        displayName: 'Ram pressure',
        units: 'r<sup>2</sup>N/m<sup>3</sup>&nbsp;*&nbsp;km<sup>2</sup>/s<sup>2</sup>',
        defaultColorRange: [ 0, 10 ],
        defaultColormap: COLORMAPS.wsaEnlil,
        defaultContourValue: 5,
        entireRange: [ 0, 10 ],
        step: 0.1
    },
    temperature: {
        serverName: 'temperature',
        displayName: 'Temperature',
        units: 'K',
        defaultColorRange: [ 10000, 200000 ],
        defaultColormap: COLORMAPS.inferno,
        defaultContourValue: 750000,
        entireRange: [ 10000, 1000000 ],
        step: 3000
    },
    b: {
        serverName: 'b',
        displayName: 'Br',
        units: 'nT',
        defaultColorRange: [ -30, 30 ],
        defaultColormap: COLORMAPS.coolToWarm,
        defaultContourValue: -15,
        entireRange: [ -100, 100 ],
        step: 5
    },
    dp: {
        serverName: 'dp',
        displayName: 'CME tracer',
        units: '—',
        defaultColorRange: [ 0.001, 0.05 ],
        defaultColormap: COLORMAPS.divergent,
        defaultContourValue: 0.0001,
        entireRange: [ 0, 0.01 ],
        step: 0.0001
    }
};

export const MODEL_VARIABLES = [
    VARIABLE_CONFIG.density,
    VARIABLE_CONFIG.velocity,
    VARIABLE_CONFIG.temperature,
    VARIABLE_CONFIG.pressure
];

export const FOCUS_VARIABLES = [ VARIABLE_CONFIG.density, VARIABLE_CONFIG.velocity, VARIABLE_CONFIG.pressure ];
export const ADDITIONAL_VARIABLES = [
    VARIABLE_CONFIG.temperature,
    VARIABLE_CONFIG.b,
    VARIABLE_CONFIG.dp
];

export interface IColorSettings {
    colorVariable: IVariableInfo;
    colormap: IColormapInfo;
    opacity: [ number, number ];
}

export const COLOR_FORM_DEFAULT_VALUES: IColorSettings = {
    colorVariable: VARIABLE_CONFIG.pressure,
    colormap: VARIABLE_CONFIG.pressure.defaultColormap,
    opacity: [ 60, 100 ] as [ number, number ]
};

export const DEFAULT_COLORMAPS: { [parameter: string]: IColormapInfo }  =
    Object.keys(VARIABLE_CONFIG).reduce( (aggregator, variable) => {
        aggregator[variable] = VARIABLE_CONFIG[variable].defaultColormap;
        return aggregator;
    }, {});

export const DEFAULT_COLOR_RANGES: { [parameter: string]: [ number, number ] } =
    Object.keys(VARIABLE_CONFIG).reduce( (aggregator, variable) => {
        aggregator[variable] = VARIABLE_CONFIG[variable].defaultColorRange;
        return aggregator;
    }, {});

export interface IControlPanel {
    colors: boolean;
    contours: boolean;
    features?: boolean;
    slices?: boolean;
    layers?: boolean;
}

export const DEFAULT_CONTROL_PANEL_EXPANSIONS = {
    colors: true,
    contours: true,
    features: false,
    slices: true
};

export const DEFAULT_OPACITIES: { [parameter: string]: [ number, number ] } =
    Object.keys(VARIABLE_CONFIG).reduce( (aggregator, variable) => {
        aggregator[variable] = COLOR_FORM_DEFAULT_VALUES.opacity;
        return aggregator;
    }, {});

export interface IContourSettings {
    contourVariable: IVariableInfo;
    threshold: boolean;
}

export const CONTOUR_FORM_DEFAULT_VALUES: IContourSettings = {
    threshold: false,
    contourVariable: VARIABLE_CONFIG.pressure
};

export const DEFAULT_CONTOUR_RANGES: { [parameter: string]: [ number, number ] } =
    Object.keys(VARIABLE_CONFIG).reduce( (aggregator, variable) => {
        aggregator[variable] = [ VARIABLE_CONFIG[variable].defaultContourValue, VARIABLE_CONFIG[variable].defaultContourValue ];
        return aggregator;
    }, {});

export interface ILayers {
    colorBar: boolean;
    latSlice: boolean;
    lonSlice: boolean;
    lonSliceType: 'solar-equator' | 'ecliptic';
    lonStreamlines: boolean;
    radialSlice: boolean;
    satellites: boolean;
    satFieldlines: boolean;
}

export const SLICES = [
    'cme',
    'latSlice',
    'lonSlice',
    'lonSliceType',
    'radialSlice'
];

export const FEATURES = [
    'lonStreamlines',
    'satellites',
    'satFieldlines',
    'colorBar'
];

export const LAYER_FORM_DEFAULT_VALUES: ILayers = {
    colorBar: true,
    latSlice: true,
    lonSlice: true,
    lonSliceType: 'ecliptic',
    lonStreamlines: false,
    radialSlice: false,
    satellites: false,
    satFieldlines: false
};
