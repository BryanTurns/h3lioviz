import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { ICmeMetadata, IModelMetadata } from 'src/app/models';
import { environment, localUrls } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CatalogService {
    private _http = inject(HttpClient);

    catalog$: BehaviorSubject<IModelMetadata[]> = new BehaviorSubject(undefined);
    runTitles: {};

    constructor() {
        // get catalog on app load
        this.getCatalog().subscribe( catalog => {
            // sort catalog by `creation`, then sort by `run_id`to ensure consistent ordering
            catalog.sort( ( a, b ) =>
                moment(b['creation']).valueOf() - moment(a['creation']).valueOf() || b['run_id'] - (a['run_id'])
            );
            const formattedCatalog = this._formatCatalog(catalog);
            this.catalog$.next(formattedCatalog);
            this.runTitles = Array.from(this.catalog$.value).reduce( (aggregator, run) => {
                const time = moment.utc( run['creation'] ).format('YYYY-MM-DDTHH');
                aggregator[ run['run_id'] ] = `${time} (${run.institute} #${run.run_id})`;
                return aggregator;
            }, {});
        });
    }

    private _formatCatalog(catalog: IModelMetadata[]) {
        catalog.map( (catalogEntry: IModelMetadata) => {
            catalogEntry.resolution = this._getResolution( catalogEntry.code );
            const hasConeMetadata = catalogEntry.cme_time;
            if ( hasConeMetadata ) {
                catalogEntry.cme_time = catalogEntry.cme_time.replace(/'/g, '').split(',').join('\n');
                catalogEntry.cme_cone_half_angle = catalogEntry.cme_cone_half_angle.replace('.,', '.0,').split(',')
                .map(value => {
                    return parseFloat(value).toFixed(0);
                }).join('\n');
                catalogEntry.cme_radial_velocity = catalogEntry.cme_radial_velocity.replace('.,', '.0,').split(',')
                .map(value => {
                    return parseFloat(value).toFixed(0);
                }).join('\n');
                catalogEntry.cme_latitude = catalogEntry.cme_latitude.replace('.,', '.0,').split(',')
                .map(value => {
                    return parseFloat(value).toFixed(0);
                }).join('\n');
                catalogEntry.cme_longitude = catalogEntry.cme_longitude.replace('.,', '.0,').split(',')
                .map(value => {
                    return parseFloat(value).toFixed(0);
                }).join('\n');
            }
            return catalogEntry;
        });
        return catalog;
    }

    formatCmeMetadataForHtml( run: IModelMetadata ): ICmeMetadata {
        if ( !run.cme_time ) {
            return null;
        }
        const cmeTime = run.cme_time.replace(/-/g, '\u2011').split('\n').join(', ');
        const cmeConeHalfAngle = run.cme_cone_half_angle.split('\n').join(', ');
        const cmeRadialVelocity = run.cme_radial_velocity.split('\n').join(', ');
        const cmeLatitude = run.cme_latitude.split('\n').join(', ');
        const cmeLongitude = run.cme_longitude.split('\n').join(', ');
        return {
            time: cmeTime,
            coneHalfAngle: cmeConeHalfAngle,
            radialVelocity: cmeRadialVelocity,
            latitude: cmeLatitude,
            longitude: cmeLongitude
        };
    }

    getCatalog(): Observable<any> {
        const catalogUrl = environment.production ? environment.aws.api + 'availableRuns' : localUrls.catalog;
        return this._http.get( catalogUrl );
    }

    private _getResolution( codeString: string ) {
        if (!codeString) {
            return;
        }

        const resolution = codeString.includes('low') ?
            'low' :
            codeString.includes('med') ?
            'med' :
            undefined;
        return resolution;
    }

}
