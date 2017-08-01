"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
//import { ActivePatient } from '../Vitals/ActivePatient';
require('rxjs/Rx');
var NotesService = (function () {
    function NotesService(_http) {
        this._http = _http;
    }
    NotesService.prototype.getAllPatientNotes = function (pid) {
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/X-www-form-urlencoded');
        // return this._http.post('/webservice2/RMSWebServices/services/LatticeWebServices/get_all_patient_notes?api_key=gluconnect&values={"patient_id":'+'"'+pid+'"}', null, { headers: headers })
        //         .map(res => res.json()
        //         );
        return this._http.post('https://lat-tice.com/webservice2/RMSWebServices/services/LatticeWebServices/get_all_patient_notes?api_key=gluconnect&values={"patient_id":' + '"' + pid + '"}', null, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    NotesService.prototype.getPatientNotes = function (nid) {
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/X-www-form-urlencoded');
        // return this._http.post('/webservice2/RMSWebServices/services/LatticeWebServices/get_patient_note?api_key=gluconnect&values={"note_id":'+'"'+nid+'"}', null, { headers: headers })
        //         .map(res => res.json()
        //         );
        return this._http.post('https://lat-tice.com/webservice2/RMSWebServices/services/LatticeWebServices/get_patient_note?api_key=gluconnect&values={"note_id":' + '"' + nid + '"}', null, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    NotesService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], NotesService);
    return NotesService;
}());
exports.NotesService = NotesService;
//# sourceMappingURL=notesservice.js.map