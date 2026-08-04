import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, of, Subscription } from 'rxjs';
import { catchError, startWith, switchMap, takeWhile, throttleTime } from 'rxjs/operators';
import { environment, environmentConfig } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AwsService {
    private _http = inject(HttpClient);

    awsUrl: string = environment.aws.api;
    pvServerStarted$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    startEc2Subscription: Subscription;
    monitoringInterval: Subscription;

    constructor() {
        // start up the service immediately on visualizer load
        // this should be the first network call
        this.startUp();
    }

    getParaviewServerStatus(): Observable<HttpResponse<string>> {
        // add a random query parameter to the request, the easiest way to keep the request from being cached in the browser
        return this._http.get( environmentConfig.sessionManagerURL + '?' + Math.random(), { responseType: 'text', observe: 'response' } );
    }

    monitorPvServer() {
        this.monitoringInterval = interval(1000)
        .pipe(
            takeWhile( () => this.pvServerStarted$.value === false ),
            startWith(0),
            // pass through fails—looking specifically for a 500
            switchMap(() => this.getParaviewServerStatus().pipe(
                catchError( (error) => of(error) )
            )),
            switchMap( (pvStatus: {status: number}) => {
                // status is 0 when server is not ready, 400 or 500 when it is ready
                // (depending on the backend version deployed)
                // a network error of 503 for stopping, 502 for starting, but those are passed through as errror='unknown' and status=0
                if ( pvStatus.status === 500 || pvStatus.status === 400 ) {
                    // good to connect!
                    this.pvServerStarted$.next(true);
                    if ( this.startEc2Subscription ) {
                        this.startEc2Subscription.unsubscribe();
                    }
                    return of( false );
                } else {
                    // carry on
                    this.pvServerStarted$.next(false);
                    return of( true );
                }
            })
        ).pipe( throttleTime( 1000 * 20 ) ).subscribe( pvNotReady => {
            if ( pvNotReady === true ) {
                // remove existing subscriptions
                if ( this.startEc2Subscription ) {
                    this.startEc2Subscription.unsubscribe();
                }
                // send the start command every throttled interval until PV server returns a 500 status
                this.startEc2Subscription = this.startEc2().subscribe();
            }
        });
    }

    startEc2(): Observable<string> {
        // StartEC2Instances.py lambda link.
        return this._http.get( this.awsUrl + 'ec2start', { responseType: 'text' });
    }

    startUp() {
        this.pvServerStarted$.next(false);
        // remove any existing monitoring interval
        this.monitoringInterval?.unsubscribe();
        // for prod use monitor function, when using a local server, fake a connection
        if ( environment.production) {
            // Start the instance immediately
            this.startEc2Subscription = this.startEc2().subscribe();
            this.monitorPvServer();
        } else {
            this.pvServerStarted$.next(true);
        }
    }
}
