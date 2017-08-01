import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import 'rxjs/Rx';


@Injectable()
export class ActivePatientService {


    constructor(private _http: Http) { }

    activePatientfn() {
        console.log('inside activePatientfn')


        var headers2 = new Headers();

        headers2.append('Content-Type', 'application/X-www-form-urlencoded');

    //    return this._http.post('/webservice2/RMSWebServices/services/LatticeWebServices/getActivePatients?api_key=gluconnect&values={"user_id":"44"}', null, { headers: headers2 })
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

        return this._http.post('https://lat-tice.com/webservice2/RMSWebServices/services/LatticeWebServices/getActivePatients?api_key=gluconnect&values={"user_id":"44"}', null, { headers: headers2 })
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


