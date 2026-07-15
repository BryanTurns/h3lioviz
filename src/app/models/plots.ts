import {
    AnalogAxisRangeType,
    AxisFormat,
    DiscreteAxisRangeType,
    IDatasetStrict,
    IMenuOptions,
    IPlotParams,
    IUiFeatures,
    SeriesDisplayMode,
    ToolbarButtonId
} from 'scicharts';
import { environment, localUrls } from 'src/environments/environment';

import { VARIABLE_CONFIG } from './control-panel';

export const DEFAULT_PLOT_OPTIONS: IMenuOptions  = {
    dataDisplay: {
        seriesDisplayMode: SeriesDisplayMode.lines,
        allowGaps: true,
        thresholdRatio: 5,
        maxLegendPrecision: 0
    },
    overrideGlobalSettings: true,
    view: {
        navigator: false,
        yAxes: true
    },
    xAxis: {
        labels: AxisFormat.auto
    },
    yAxis: {
        range: {
            analogType: AnalogAxisRangeType.auto,
            discreteType: DiscreteAxisRangeType.showFullRange,
            low: null,
            high: null
        },
        scaling: 'linear',
        useMultipleAxes: true
    }
};

// set the UI features for H3lioViz
export const H3LIO_PRESET: IUiFeatures = {
    dynamicTimeRange: false,
    dynamicTimeRangeLive: false,
    panning: false,
    toolbarButtons: [
        ToolbarButtonId.remove,
        ToolbarButtonId.displaySettings,
        ToolbarButtonId.toggleVariables,
        ToolbarButtonId.downloadImage
    ],
    menuItems: {
        discreteData: false,
        events: false,
        globalSettings: false,
        limits: false,
        overplotting: true
    }
};

export const SATELLITE_NAMES = {
    earth: 'Earth',
    stereoa: 'Stereo A',
    stereob: 'Stereo B'
};

export const IMAGE_DATASETS = {
    iswa_goesp_suvi_094_files_thinned: {
        id: 'iswa_goesp_suvi_094_files_thinned',
        displayName: 'GOES primary spacecraft SUVI 094'
    },
    iswa_goesp_suvi_131_files_thinned: {
        id: 'iswa_goesp_suvi_131_files_thinned',
        displayName: 'GOES primary spacecraft SUVI 131'
    },
    iswa_goesp_suvi_171_files_thinned: {
        id: 'iswa_goesp_suvi_171_files_thinned',
        displayName: 'GOES primary spacecraft SUVI 171'
    },
    iswa_goesp_suvi_195_files_thinned: {
        id: 'iswa_goesp_suvi_195_files_thinned',
        displayName: 'GOES primary spacecraft SUVI 195'
    },
    iswa_goesp_suvi_284_files_thinned: {
        id: 'iswa_goesp_suvi_284_files_thinned',
        displayName: 'GOES primary spacecraft SUVI 284'
    },
    iswa_goesp_suvi_304_files_thinned: {
        id: 'iswa_goesp_suvi_304_files_thinned',
        displayName: 'GOES primary spacecraft SUVI 304'
    },
    iswa_sdo_aia_094_files: {
        id: 'iswa_sdo_aia_094_files',
        displayName: 'SDO AIA 094 (green)'
    },
    iswa_sdo_aia_131_files: {
        id: 'iswa_sdo_aia_131_files',
        displayName: 'SDO AIA 131 (teal)'
    },
    iswa_sdo_aia_171_files_thinned: {
        id: 'iswa_sdo_aia_171_files_thinned',
        displayName: 'SDO AIA 171 (gold)'
    },
    iswa_sdo_aia_193_files_thinned: {
        id: 'iswa_sdo_aia_193_files_thinned',
        displayName: 'SDO AIA 193 (bronze)'
    },
    iswa_sdo_aia_211_files: {
        id: 'iswa_sdo_aia_211_files',
        displayName: 'SDO AIA 211 (purple)'
    },
    iswa_sdo_aia_211_193_171_files: {
        id: 'iswa_sdo_aia_211_193_171_files',
        displayName: 'SDO AIA 211, 193, 171 composite'
    },
    iswa_sdo_aia_304_files_thinned: {
        id: 'iswa_sdo_aia_304_files_thinned',
        displayName: 'SDO AIA 304 (red)'
    },
    iswa_sdo_aia_304_211_171_files: {
        id: 'iswa_sdo_aia_304_211_171_files',
        displayName: 'SDO AIA 304, 211, 171 composite'
    },
    iswa_sdo_aia_335_files: {
        id: 'iswa_sdo_aia_335_files',
        displayName: 'SDO AIA 335 (blue)'
    },
    iswa_sdo_aia_1600_files: {
        id: 'iswa_sdo_aia_1600_files',
        displayName: 'SDO AIA 1600 (yellow/green)'
    },
    iswa_sdo_aia_1700_files: {
        id: 'iswa_sdo_aia_1700_files',
        displayName: 'SDO AIA 1700 (pink)'
    },
    iswa_sdo_aia_4500_files: {
        id: 'iswa_sdo_aia_4500_files',
        displayName: 'SDO AIA 4500 (white light)'
    },
    iswa_sdo_aia_hmib_files: {
        id: 'iswa_sdo_aia_hmib_files',
        displayName: 'SDO HMI magnetogram'
    },
    iswa_sdo_aia_hmic_files: {
        id: 'iswa_sdo_aia_hmic_files',
        displayName: 'SDO HMI magnetogram colorized'
    },
    iswa_sdo_hmi_files: {
        id: 'iswa_sdo_hmi_files',
        displayName: 'SDO HMI intensitygram'
    },
    iswa_sdo_aia_d193_files_thinned: {
        id: 'iswa_sdo_aia_d193_files_thinned',
        displayName: 'SDO AIA 193 difference image'
    },
    iswa_ccor1_l3_image_files: {
        id: 'iswa_ccor1_l3_image_files',
        displayName: 'GOES CCOR-1'
    },
    iswa_soho_lasco_c2_files: {
        id: 'iswa_soho_lasco_c2_files',
        displayName: 'SOHO LASCO C2'
    },
    iswa_soho_lasco_c3_files: {
        id: 'iswa_soho_lasco_c3_files',
        displayName: 'SOHO LASCO C3'
    },
    iswa_stereo_a_cor2_files: {
        id: 'iswa_stereo_a_cor2_files',
        displayName: 'STEREO A Coronagraph 2'
    }
};

export const imageDatasetCatalog: { [parameter: string]: IDatasetStrict } = Object.keys(IMAGE_DATASETS).reduce( (aggregator, dataset) => {
    const datasetInfo = IMAGE_DATASETS[dataset];
    const scichartsDataset: IDatasetStrict = {
        url: environment.latisUrl + datasetInfo.id + '.jsond',
        name: datasetInfo.displayName,
        rangeVariables: [
            { name: 'url', displayName: 'Image URL' }
        ],
        domainVariables: [ 'time' ]
    };
    // some image datasets are converted to files because they are not standard types
    const needsType = !dataset.includes('image');
    if ( needsType ) {
        scichartsDataset.type = 'STRING_LIST';
    }
    aggregator[dataset] = scichartsDataset;
    return aggregator;
}, {});

export const modelDatasetCatalog: { [parameter: string]: IDatasetStrict } =
    [ 'stereoa', 'earth', 'stereob' ].reduce( ( aggregator, satellite: string) => {
        const urlBase: string = environment.production ? environment.aws.api : localUrls.evolutionData;
        const newDataset: IDatasetStrict = {
            url: urlBase,
            name: 'Model data ' + SATELLITE_NAMES[satellite],
            // for Enlil, we do not plot mag variables Bx, By, Bz
            rangeVariables: [
                { name: 'density', displayName: 'Density' },
                { name: 'velocity', displayName: 'Radial Velocity' },
                { name: 'temperature', displayName: 'Temperature' },
                { name: 'pressure', displayName: 'Pressure' }
            ],
            domainVariables: [ 'time' ]
        };
        aggregator[ satellite ] = newDataset;
        return aggregator;
    }, {});

export const observedDatasetCatalog: { [parameter: string]: IDatasetStrict } = {
    // for Enlil, we do not plot mag variables Bx, By, Bz
    ace_swepam_1m: {
        url: environment.latisUrl + 'ace_swepam_1m.jsond?',
        name: 'Archived real time ACE data',
        rangeVariables: [
            { name: 'density', displayName: 'Density' },
            { name: 'speed', displayName: 'Radial Velocity' },
            { name: 'temperature', displayName: 'Temperature' }
        ],
        domainVariables: [ 'time' ]
    }
};

export const datasetMapById: { [parameter: string]: IDatasetStrict } =
    Object.assign( {}, imageDatasetCatalog, modelDatasetCatalog, observedDatasetCatalog );

export const DEFAULT_PLOT_CONFIG: IPlotParams[] = [
    {
        datasets: [
            {
                datasetId: 'earth',
                rangeVars: [ { name: VARIABLE_CONFIG.density.serverName, displayName: VARIABLE_CONFIG.density.displayName } ]
            }
        ],
        options: DEFAULT_PLOT_OPTIONS
    },
    {
        datasets: [
            {
                datasetId: 'earth',
                rangeVars: [ { name: VARIABLE_CONFIG.velocity.serverName, displayName: VARIABLE_CONFIG.velocity.displayName } ]
            }
        ],
        options: DEFAULT_PLOT_OPTIONS
    }
];
