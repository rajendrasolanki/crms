import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthCheck } from './authcheck';

import { Subject, Observable, Subscription } from 'rxjs/Rx';

import { WebsocketService } from './sockets/WebsocketService';

import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
    selector: 'my-app',
    template: ' <router-outlet></router-outlet>',
    providers: [AuthCheck]
})
export class AppComponent implements OnInit {
    private messages: string;

    constructor(private websocketservice: WebsocketService, private auth: AuthCheck) {
        this.websocketservice.createWebsocket();
    }

    ngOnInit() {
        this.websocketservice.test();
       
    }

}

