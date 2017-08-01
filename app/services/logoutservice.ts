import { Injectable, Inject } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import {AuthService} from '../services/authservice';
//import { ActivePatient } from '../Vitals/ActivePatient';
import 'rxjs/Rx';


@Injectable()
export class LogoutService{

     constructor(private _http: Http , private _auth:AuthService) { }

     logoutfn(){

        var headers = new Headers();
        headers.append('Content-Type', 'application/X-www-form-urlencoded');

        return new Promise((resolve) => {
         this._http.delete('https://lat-tice.com/auth', {headers:headers})
            .subscribe((data) => {
                console.log(data)

                this._auth.isLoggedin = false;

                resolve(this._auth.isLoggedin)
            }
            )
            })
     }



}