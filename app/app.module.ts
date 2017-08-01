import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ChartModule } from 'angular2-highcharts';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { ActivePatient } from './vitals/ActivePatient';
import { ActivePatientService } from './services/activepatientservice';
import { AuthService } from './services/authservice';
import { WebsocketService } from './sockets/WebsocketService';
import { TrendGraphService } from './services/trendgraphservice';
import { TrendDataService } from './services/trenddataservice';
import { AlarmHistoryService } from './services/alarmhistoryservice';
import {NotesService} from './services/Notes/notesservice';
import {PatientSettingService} from './services/patientsettings';
import { Cards } from './Cards/Cards';
import { Patients } from './Patients/Patients';
import { AuthCheck } from './authcheck';

import { routing } from './app.routes';
import {KeysPipe} from './dashboard/pipe';


@NgModule({
  imports: [BrowserModule, FormsModule, routing, HttpModule, ChartModule],
  declarations: [AppComponent, LoginComponent, DashboardComponent, KeysPipe],
  providers: [ActivePatientService,
             AuthService,
             AuthCheck,
             WebsocketService,
             ActivePatient,
             TrendGraphService,
             TrendDataService,
             AlarmHistoryService, 
             NotesService,
             PatientSettingService, 
             Patients, 
             Cards],
  bootstrap: [AppComponent]
})
export class AppModule { }
