import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
//import { ActivePatient } from '../Vitals/ActivePatient';
import 'rxjs/Rx';


@Injectable()
export class AlarmHistoryService{

     constructor(private _http: Http) { }

     alarmhistoryfn(pid:string, time:number, page:number, size:number){

      var headers = new Headers();
        headers.append('Content-Type', 'application/X-www-form-urlencoded');

var values = {"is_show_all_alarm":false,"user_id":"","patient_id":pid}
//   return this._http.post('/webservice2/RMSWebServices/services/v3.1.1/alarm_history?api_key=gluconnect&values='+JSON.stringify(values)+'&page='+page+'&page_size='+size+'&current_time='+time, null, { headers: headers })
//             .map(res => {
//                 if (res.status < 200 || res.status >= 300) {
//                     throw new Error('This request has failed ' + res.status);
//                 }
//                 // If everything went fine, return the response
//                 else {
//                     return res.json();
//                 }
//             }
//             );

 return this._http.post('https://lat-tice.com/webservice2/RMSWebServices/services/v3.1.1/alarm_history?api_key=gluconnect&values='+JSON.stringify(values)+'&page='+page+'&page_size='+size+'&current_time='+time, null, { headers: headers })
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