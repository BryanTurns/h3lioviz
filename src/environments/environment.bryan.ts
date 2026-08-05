import packageInfo from '../../package.json';

let siteRootUrl = window.location.origin;

// ensure that the root URL ends with a slash
if ( siteRootUrl.slice(-1, 1) !== '/' ) {
    siteRootUrl += '/';
}

// if not on localhost, ensure that the root URL in ends with the name of the app
if ( !siteRootUrl.includes('localhost') && siteRootUrl.split('/').filter( pathString => pathString.length ).pop() !== packageInfo.name ) {
    siteRootUrl += name + '/';
}

export const environment = {
    aws: {
        api: 'https://h3lioviz.homelab.bryanturns.com/h3lioviz/metadata/'
    },
    dev: true,
    googleAnalyticsId: '', // intentionally empty; don't try to track usage during development
    isDeployedDev: true, // set to true if this is a deployed dev site
    latisUrl: 'https://lasp.colorado.edu/space-weather-portal/latis/dap/',
    production: true,
    siteRootUrl: siteRootUrl,
    version: packageInfo.version
};

export const environmentConfig = {
    application: 'visualizer',
    sessionManagerURL: 'https://h3lioviz.homelab.bryanturns.com/h3lioviz/paraview/'
};

// these need to be in file, but are not used for 'production' builds
export const localUrls = {
    catalog: '',
    evolutionData: ''
}
