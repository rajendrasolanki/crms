import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import {Resolution} from '../vitals/resolution';
import 'rxjs/Rx';

@Injectable()
export class TrendDataService{

     constructor(private _http: Http) { }

     trenddatafn(pid:string, interval:string, time:number, page:number, size:number){

        var headers = new Headers();
        headers.append('Content-Type', 'application/X-www-form-urlencoded');

        var millis = Resolution.toMillis[interval]
      
    // return this._http.post('/webservice2/RMSWebServices/services/v3.1.1/trend_data?page='+page+'&page_size='+size+'&current_time='+time+'&patient_id='+pid+'&interval='+millis, null, { headers: headers })
    //         .map(res => {
    //             if (res.status < 200 || res.status >= 300) {
    //                 throw new Error('This request has failed ' + res.status);
    //             }
    //             // If everything went fine, return the response
    //             else {
    //                 return res.json();
    //             }
    //         }
    //         );


     
        return this._http.post('https://lat-tice.com/webservice2/RMSWebServices/services/v3.1.1/trend_data?page='+page+'&page_size='+size+'&current_time='+time+'&patient_id='+pid+'&interval='+millis, null, { headers: headers })
            .map(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error('This request has failed ' + res.status);
                }
                // If everything went fine, return the response
                else {
                    return res.json();
                }
            }
            );
     }


}