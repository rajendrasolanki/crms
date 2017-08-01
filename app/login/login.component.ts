import { Component, DoCheck} from '@angular/core';
import { Router } from '@angular/router';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { AuthService } from '../services/authservice';
import { ActivePatientService } from '../services/activepatientservice';
import { WebsocketService } from '../sockets/WebsocketService';

@Component({
    templateUrl: '../app/login/login.html',
    styles:['.login-submit{ padding-left: 0px !important;color: white !important;}']
})
export class LoginComponent {
        localUser = {
        username: '',
        password: ''
    }

    constructor(private _service: AuthService, private _router: Router, private _websocketservice: WebsocketService) { 

    }

    // ngDoCheck() {
    //     if (this._websocketservice.disconnectflag === true) {

    //         this._websocketservice.createWebsocket();
            
    //     } else {

    //         return true;
    //     }
    // }

    login() {
        console.log("inside login()")
           if(this.localUser.username == '' || this.localUser.password == '')
        {
            alert("Enter username and password");
        }
        this._service.loginfn(this.localUser).then((res) => {
            if (res && this._websocketservice.connectflag==true) {
                this._router.navigate(['dashboard']);
            }
            else {
                alert("Invalid username/password");
                console.log(res);
            }
        }
        )
    }

    clearfields() {
        this.localUser.username = '';
        this.localUser.password = '';
    }
 }
