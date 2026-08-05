import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, exhaustMap, startWith, switchMap, takeWhile, throttleTime } from 'rxjs/operators';
import { environment, environmentConfig } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AwsService {
    private _http = inject(HttpClient);

    awsUrl: string = environment.aws.api;
    pvServerStarted$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    monitoringInterval: Subscription;

    // Every request to start the instance goes through here. exhaustMap ignores
    // new emissions while one request is still in flight, so there is never more
    // than one concurrent /ec2start and none is ever cancelled part way through.
    // That replaces the old startEc2Subscription field, which had to serve as both
    // "the retry in flight" and a cleanup handle, and cancelled the initial request.
    private _startEc2Requests: Subject<void> = new Subject<void>();

    constructor() {
        // One subscription for the life of the service. catchError keeps a failed
        // request from completing the stream and silencing every later retry.
        this._startEc2Requests.pipe(
            exhaustMap( () => this.startEc2().pipe( catchError( () => of(null) ) ) )
        ).subscribe();

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
                    // good to connect! Any /ec2start still in flight is left to
                    // finish; the lambda is a no-op once the instance is running.
                    this.pvServerStarted$.next(true);
                    return of( false );
                } else {
                    // carry on
                    this.pvServerStarted$.next(false);
                    return of( true );
                }
            })
        ).pipe( throttleTime( 1000 * 20 ) ).subscribe( pvNotReady => {
            if ( pvNotReady === true ) {
                // ask for a start every throttled interval until the PV server answers.
                // If one is already in flight this emission is dropped rather than
                // stacking up a second request.
                this._startEc2Requests.next();
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
            // Start the instance immediately, before any polling.
            this._startEc2Requests.next();
            this.monitorPvServer();
        } else {
            this.pvServerStarted$.next(true);
        }
    }
}
