import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
//import { ActivePatient } from '../Vitals/ActivePatient';
import 'rxjs/Rx';


@Injectable()
export class NotesService {

    constructor(private _http: Http) { }

    getAllPatientNotes(pid:string) {

        var headers = new Headers();
        headers.append('Content-Type', 'application/X-www-form-urlencoded');
        
    // return this._http.post('/webservice2/RMSWebServices/services/LatticeWebServices/get_all_patient_notes?api_key=gluconnect&values={"patient_id":'+'"'+pid+'"}', null, { headers: headers })
    //         .map(res => res.json()
    //         );

        return this._http.post('https://lat-tice.com/webservice2/RMSWebServices/services/LatticeWebServices/get_all_patient_notes?api_key=gluconnect&values={"patient_id":'+'"'+pid+'"}', null, { headers: headers })
            .map(res => res.json()
            );
    }

    getPatientNotes(nid: string) {

        var headers = new Headers();
        headers.append('Content-Type', 'application/X-www-form-urlencoded');

        // return this._http.post('/webservice2/RMSWebServices/services/LatticeWebServices/get_patient_note?api_key=gluconnect&values={"note_id":'+'"'+nid+'"}', null, { headers: headers })
        //         .map(res => res.json()
        //         );
      

         return this._http.post('https://lat-tice.com/webservice2/RMSWebServices/services/LatticeWebServices/get_patient_note?api_key=gluconnect&values={"note_id":'+'"'+nid+'"}', null, { headers: headers })
                .map(res => res.json()
                );
    }

}