
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { ActivePatientService } from '../services/activepatientservice';

@Injectable()
export class AuthService {
    isLoggedin: boolean;
    constructor(private _http: Http, private _activeservice: ActivePatientService) {
    }

    loginfn(usercreds:any) {
        this.isLoggedin = false;

        var headers = new Headers();
        var creds = 'username=' + usercreds.username + '&password=' + usercreds.password;
        headers.append('Content-Type', 'application/X-www-form-urlencoded');

        return new Promise((resolve) => {
            console.log("inside loginfn")

            this._http.post('https://lat-tice.com/auth', creds, { headers: headers }).subscribe((data) => {
      
                console.log(data._body)
                window.localStorage.setItem('auth_key', data._body)
                this.isLoggedin = true;

                resolve(this.isLoggedin)
            },(err: any) => {
                if(err.status ==401){
                    alert("Invalid Username/Password")
                }
            
        }
            )
            this._activeservice.activePatientfn();
        })


    }


}


