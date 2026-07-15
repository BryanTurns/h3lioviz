import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { cloneDeep, defaultsDeep } from 'lodash';

import {
    IDatasetStrict,
    ImageViewerService,
    IMenuOptions,
    IPlotParams,
    IPlotStrict,
    IRangeVariable,
    MenuOptionsService,
    PlotsService,
    UiOptionsService,
    XRangeService
} from 'scicharts';
import {
    ConfigLabels,
    DEFAULT_PLOT_OPTIONS,
    H3LIO_PRESET,
    IMAGE_DATASETS,
    imageDatasetCatalog,
    ISiteConfig,
    IVariableInfo,
    MODEL_VARIABLES,
    modelDatasetCatalog,
    observedDatasetCatalog
} from 'src/app/models';
import { PlayingService, SiteConfigService } from 'src/app/services';
import { environment, localUrls } from 'src/environments/environment';

import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'swt-plots',
    templateUrl: './plots.component.html',
    styleUrls: [ './plots.component.scss' ],
    standalone: false
})
export class PlotsComponent implements OnChanges {
    confirmationDialog = inject(MatDialog);
    protected _playingService = inject(PlayingService);
    private _imageViewerService = inject(ImageViewerService);
    private _menuOptionsService = inject(MenuOptionsService);
    private _plotsService = inject(PlotsService);
    private _siteConfigService = inject(SiteConfigService);
    private _uiOptionsService = inject(UiOptionsService);
    private _xRangeService = inject(XRangeService);

    @Input() timeRange: number[];
    @Input() runId: string;
    @Input() plotConfig: IPlotParams[];

    modelVariables: IVariableInfo[] = MODEL_VARIABLES;
    observedVariableList: IRangeVariable[] = observedDatasetCatalog['ace_swepam_1m'].rangeVariables;
    imageData = IMAGE_DATASETS;
    legendCardToggle = new FormControl();
    siteConfig: ISiteConfig;

    constructor() {
        this._menuOptionsService.setGlobalMenuOptions( cloneDeep(DEFAULT_PLOT_OPTIONS) );
        // use methods to set uiOptions
        const uiOptions = this._uiOptionsService.getUiOptions();
        uiOptions.minimumPlotHeight = 50;
        uiOptions.gridHeightCorrection = 200;
        uiOptions.stackedMode = true;
        this._uiOptionsService.setUiOptions( uiOptions );
        this._uiOptionsService.updateFeatures( H3LIO_PRESET );
        this._uiOptionsService.setPlotGrid( 3, 1 );
        this._plotsService.enableCrosshairSync();
        this._xRangeService.enableZoomSyncByVariable( true, 'time' );
        this._imageViewerService.setImageViewerSync( true );

        this.legendCardToggle.valueChanges.pipe(
            takeUntilDestroyed()
        ).subscribe( showCards => {
            if ( showCards ) {
                this._uiOptionsService.setUiOptions({ legend: 'left' });
                this._siteConfigService.updateSiteConfig({ [ConfigLabels.legendCards]: true });
            } else {
                this._uiOptionsService.setUiOptions({ legend: 'minimal' });
                this._siteConfigService.updateSiteConfig({ [ConfigLabels.legendCards]: false });
            }
        });
    }

    ngOnChanges( changes: SimpleChanges ) {
        // once, on init, set the legend toggle based on the site config
        const legendConfig = this._siteConfigService.getSiteConfig().legendCards;
        this.legendCardToggle.setValue( legendConfig );
        // once, on load, set the plots based on the config or the default
        if ( changes.plotConfig.firstChange ) {
            const plots: IPlotStrict[] = [];
            // parse plots from the config
            this.plotConfig.forEach( plotParams => {
                const datasetList = plotParams.datasets.map( dataset => {
                    const isModelDataset = modelDatasetCatalog[ dataset.datasetId ] != null;
                    const isObservedDataset = observedDatasetCatalog[ dataset.datasetId ] != null;
                    const isImageDataset = imageDatasetCatalog[ dataset.datasetId ] != null;
                    const rangeVariableNames = dataset.rangeVars.map( ( rangeVariable: IRangeVariable ) => rangeVariable.name );
                    // create IDatasetStrict datasets
                    if ( isModelDataset ) {
                        return this.createModelDataset( rangeVariableNames );
                    } else if ( isObservedDataset ) {
                        return this.createObservedDataset( rangeVariableNames );
                    } else if ( isImageDataset ) {
                        return this.createImageDataset( dataset.datasetId );
                    }
                }).filter( ds => !!ds );
                const imageDatasetType = imageDatasetCatalog[ plotParams.datasets[0].datasetId ] != null;
                const plotType = imageDatasetType ? 'IMAGE' : 'LINE';
                const plotOptions = plotParams.options ? plotParams.options : cloneDeep(DEFAULT_PLOT_OPTIONS);
                // create IPlotStrict plots
                const plotToSet = this.getPlot( plotType, datasetList, plotOptions );
                plots.push( plotToSet );
            });
            this._plotsService.setPlots( plots );
        }
    }

    addPlot( type: 'image' | 'model' | 'observed', datasetName: string ) {
        const datasets = [];
        if ( type === 'image' ) {
            const imageDataset = this.createImageDataset( datasetName );
            if ( imageDataset != null ) {
                datasets.push(imageDataset);
            }
        }
        if ( type === 'model' ) {
            const modelDataset = this.createModelDataset( [ datasetName ] );
            if ( modelDataset != null ) {
                datasets.push( modelDataset );
            }
        }
        if ( type === 'observed' ) {
            const observedDataset = this.createObservedDataset( [ datasetName ] );
            if ( observedDataset != null ) {
                datasets.push(observedDataset);
            }
        }
        const plotType = type === 'image' ? 'IMAGE' : 'LINE';
        const newPlot: IPlotStrict = this.getPlot( plotType, datasets, cloneDeep(DEFAULT_PLOT_OPTIONS) );
        this._plotsService.addPlot( newPlot );
    }

    clearAllPlots() {
        const dialogRef = this.confirmationDialog.open(
            ConfirmationDialogComponent, {
                width: '350px',
                data: { title: 'Confirm clear all plots?', confirmButtonText: 'Clear all plots' }
            });
        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result === true) {
                this._plotsService.removeAllPlots();
                // explicitly update site config to clear plots
                this._siteConfigService.updateSiteConfig({ plots: [] });
            }
        });
    }

    createImageDataset( imageDatasetId: string )  {
        const catalogDataset = imageDatasetCatalog[imageDatasetId];
        if ( catalogDataset != null ) {
            const imageDataset: IDatasetStrict = {
                uid: imageDatasetId,
                url: environment.latisUrl + imageDatasetId + '.jsond',
                name: catalogDataset.name,
                rangeVariables: catalogDataset.rangeVariables,
                selectedRangeVariables: catalogDataset.rangeVariables,
                domainVariables: catalogDataset.domainVariables
            };
            // some image datasets are converted to files because they are not standard types
            const needsType = !imageDatasetId.includes('image');
            if ( needsType ) {
                imageDataset.type = 'STRING_LIST';
            }
            return imageDataset;
        } else {
            return null;
        }
    }

    createModelDataset( variables: string[] )  {
        // Only plot earth for now, but could be extended to other satellites in the future
        const satellite = 'earth';
        const catalogDataset = modelDatasetCatalog[satellite];
        const urlBase: string = environment.production ? environment.aws.api : localUrls.evolutionData;
        const urlSuffix: string = environment.production ? `getTimeSeries/${this.runId}/${satellite}.jsond` : `evo.${satellite}.json`;
        const selectedVariables = variables
            .map( variable => catalogDataset.rangeVariables.find( rv => rv.name === variable ) )
            .filter( rv => !!rv );
        if ( selectedVariables.length > 0 ) {
            const modelDataset: IDatasetStrict = {
                uid: satellite,
                url: urlBase + urlSuffix,
                name: catalogDataset.name,
                rangeVariables: selectedVariables,
                selectedRangeVariables: selectedVariables,
                domainVariables: catalogDataset.domainVariables
            };
            return modelDataset;
        } else {
            return null;
        }
    }

    createObservedDataset( variables: string[] ) {
        const instrument = 'ace_swepam_1m';
        const catalogDataset = observedDatasetCatalog[instrument];
        const selectedRangeVariables = variables
            .map( variable => catalogDataset.rangeVariables.find( rv => rv.name === variable ) )
            .filter( rv => !!rv );
        if ( selectedRangeVariables.length > 0 ) {
            const archivedSwepamDataset: IDatasetStrict = {
                uid: instrument,
                url: environment.latisUrl + instrument + '.jsond?',
                name: catalogDataset.name,
                rangeVariables: catalogDataset.rangeVariables,
                selectedRangeVariables: selectedRangeVariables,
                domainVariables: catalogDataset.domainVariables
            };
            return archivedSwepamDataset;
        } else {
            return null;
        }
    }

    getPlot( plotType: 'IMAGE' | 'LINE', datasets: IDatasetStrict[], options: IMenuOptions ): IPlotStrict {
        const optionsWithDefaults = defaultsDeep( options, DEFAULT_PLOT_OPTIONS );
        return {
            datasets: datasets,
            initialOptions: optionsWithDefaults,
            range: {
                start: this.timeRange[0] * 1000,
                end: this.timeRange[1] * 1000
            },
            type: plotType
        };
    }
}
