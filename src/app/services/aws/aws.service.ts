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
        // No leading slash: awsUrl already ends with "/", so '/ec2start' gave a
        // double-slash path. API Gateway normalized that; the ALB path routing
        // that replaced it may not.
        return this._http.get( this.awsUrl + 'ec2start', { responseType: 'text' });
    }

    startUp() {
        this.pvServerStarted$.next(false);
        // remove any existing monitoring interval
        this.monitoringInterval?.unsubscribe();
        // for prod use monitor function, when using a local server, fake a connection
        if ( environment.production) {
            // Start the instance immediately rather than from monitorPvServer()'s
            // subscriber, which only fires once a readiness poll completes. Those
            // polls abort each other (interval(1000) + switchMap) while a poll
            // against a stopped box takes ~3s, so the start was waiting on a race:
            // observed at +3.2s and +43.1s from page load. Starting is safe to do
            // blind: the lambda is a no-op if the box is already running.
            // Not stored in startEc2Subscription: monitorPvServer unsubscribes that
            // field before re-issuing, which would cancel this request in flight.
            this.startEc2().subscribe();
            this.monitorPvServer();
        } else {
            this.pvServerStarted$.next(true);
        }
    }
}
