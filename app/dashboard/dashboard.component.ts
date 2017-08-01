//author : Komal Sharma
//class : Dashboard
//Functionality: Patient card, vitals, graphs, alarms, trend graph, table and alarm history
import { Component, DoCheck, OnChanges } from '@angular/core';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Router } from '@angular/router';
import { ActivePatient } from '../vitals/ActivePatient';
import { ActivePatientService } from '../services/activepatientservice';
import { WebsocketService } from '../sockets/WebsocketService';
import { Observable } from 'rxjs/Rx';
import { TrendGraphService } from '../services/trendgraphservice';
import { ChartModule } from 'angular2-highcharts';
import { TrendDataService } from '../services/trenddataservice';
import { AlarmHistoryService } from '../services/alarmhistoryservice';
import { LogoutService } from '../services/logoutservice';
import { AuthService } from '../services/authservice';
import { NotesService } from '../services/Notes/notesservice';
import { PatientSettingService } from '../services/patientsettings';

import { LoginComponent } from '../login/login.component';

import { Patients } from '../Patients/Patients';
import { Cards } from '../Cards/Cards';
import { KeysPipe } from './pipe';
import { Alarms } from '../vitals/Alarms';
import { Resolution } from '../vitals/resolution';

import { Pipe } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeHtml' })
@Component({
    templateUrl: '../app/dashboard/dashboard.html',
    styleUrls: ['../app/dashboard/dashboard.css'],
    providers: [ActivePatientService, ActivePatient,
        TrendGraphService, TrendDataService,
        AlarmHistoryService, Patients, KeysPipe, LogoutService, AuthService, LoginComponent],
     
})

export class DashboardComponent {
    /*variables storing data of current patient */
    public patientname: string;
    public bednumber: any;
    public gender: string;
    public age: any;
    public com_name: string;
    public patientid: string;
    public ward: string;
    public hospital: string;

    public show: { tab1: boolean, tab2: boolean, tab3: boolean }; //for history, vital and setting tab
    public showHistory: { tab1: boolean, tab2: boolean, tab3: boolean, tab4: boolean }; //for trend graph, trend data and alarm history tab
    public showLoader: boolean = true; // loader for Alarm history
    public showLoaderData: boolean = true; // loader for Trend data
    public showLoaderGraph: boolean = true; // loader for Trend graph
    public showLoaderNotes: boolean=true;

    public ActiveData: any[] = []; //stores data of all the patients

    /* Object for Highcharts */
    options: Object;
    chart: Object;
    public graphTimestamp: any[] = [];


    /*for Trend Graph */
    public curTimeGraph: number; //stores current time for a session trend graph
    public graphPage: any = 1
    public totalPagesGraph: any
    public isTrendGraphs: boolean = false;
    public graphHeight: any;
    public graphWidth: any;

    /*for No. of records in Alarm history, trend data and trend graph */
    public pageSize: any = 20;

    /*for Trend Data */
    public curtimeData: number; //stores current time for a session trend data
    public dataPage: any = 1;
    public totalPagesData: any;
    public noData: boolean = false;

    /*for Alarm History */
    public curtimeAlarm: number; // stores current time for a session for Alarm history
    public alarmPage: any = 1;
    public totalPagesAlarm: any;
    public noAlarm:boolean = false;

    public data_json: any[] = []; // array for trend data
    public datatab: Array<any>; // array for alarm history
    public time1: any[] = []; //stores current datatime for alarm history

    public cards: {}; //object of Patients class
    public liveVitals: {}; // stores data of current patient

    /* Resolution for trend graph and trend data */
    inputResolution = {
        Resolution: ''
    };
    public resolution: any[] = ["5min", "15min", "30min", "1hr", "3hr", "6hr"]
    public counter = 1;
    public select: string;

    /*variables for notes */
    public notes: any[] = [];
    public imagePath: any;
    public showArticleEnd: boolean;
    public showImage: boolean;
    public base64img: any;
    public imageLoader: boolean;
    public oldImage: any;
    public viewer: any;

    /*varibles for patient setting */
    public showPatientSettings: { tab1: boolean, tab2: boolean, tab3: boolean, tab4: boolean, tab5: boolean, tab6: boolean }
    public settings: {};

    constructor(
        private _router: Router,
        private _activeservice: ActivePatientService,
        private _websocketservice: WebsocketService,
        private _activepatient: ActivePatient,
        private _trend: TrendGraphService,
        private _trendData: TrendDataService,
        private _alarm: AlarmHistoryService,
        private _patient: Patients,
        private _logout: LogoutService,
        private _auth: AuthService,
        private _notes: NotesService,
        private _settings: PatientSettingService,
        private _log: LoginComponent,
        private sanitizer: DomSanitizer
    ) {
        this._websocketservice.test(),
            this.getActivePatient(),
            this.show = { tab1: false, tab2: true, tab3: false };
        this.showHistory = { tab1: false, tab2: true, tab3: false, tab4: false };
        this.showArticleEnd = true;
        this.showImage = false;
        this.showPatientSettings = { tab1: false, tab2: false, tab3: false, tab4: false, tab5: false, tab6: false }
        this.inputResolution.Resolution = this.resolution[0];
        this.setCurTime();
        this.initHighcharts();
    }

    initHighcharts() {
        this.options = {
            title: { text: "" },
            chart: {
                type: 'line',
                reflow: true,
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: "time"
                },
                categories: this.graphTimestamp,
                // dateTimeLabelFormats: {
                //     day: '%m-%d'
                // },
                // tickInterval: 10,
                labels: {
                    rotation: 280,
                    align: 'right',
                    step: 5,
                    enabled: true,
                },
            },
            plotOptions: {
                series: {
                    // WARNING: DO NOT ENABLE UNDER ANY CIRCUMSTANCE
                    // ELECTROCUTION HAZARD
                    // connectNulls: true,
                },
                line: {
                    marker: {
                        radius: 1.5,
                        enabled: true
                    }
                }
            },
            series: [{
                title: { text: 'RR Trend Graph' }, //0
                name: 'HR(BPM)',
                data: [],
                allowPointSelect: true
            },
            {
                title: { text: 'HR Trend Graph' }, //1
                name: 'RR(BPM)',
                data: [],
                allowPointSelect: true
            },
            {
                title: { text: 'HR Trend Graph' }, //2
                name: 'SPO2(%)',
                data: [],
                allowPointSelect: true
            },
            {
                title: { text: 'SPO2 Trend Graph' }, //3
                name: 'PR(BPM)',
                data: [],
                allowPointSelect: true
            },
            {
                title: { text: 'TEMP1 Trend Graph' }, //4
                name: 'TEMP1(F)',
                data: [],
                allowPointSelect: true
            },
            {
                title: { text: 'TEMP2 Trend Graph' }, //5
                name: 'TEMP2(F)',
                data: [],
                allowPointSelect: true
            },
            {
                title: { text: 'NIBP HIGH Trend Graph' }, //6
                name: 'NIBP SYS(mmHg)',
                data: [],
                allowPointSelect: true
            },
            {
                title: { text: 'NIBP LOW Trend Graph' }, //7
                name: 'NIBP DIA(mmHg)',
                data: [],
                allowPointSelect: true
            },
            {
                title: { text: 'NIBP MEAN Trend Graph' }, //8
                name: 'NIBP MEAN(mmHg)',
                data: [],
                allowPointSelect: true
            }
            ],
        };
    }

    setCurTime() {
        this.alarmPage = 1;
        this.dataPage = 1;
        this.graphPage = 1;
        this.curtimeAlarm = new Date().getTime();
        this.curtimeData = new Date().getTime();
        this.curTimeGraph = new Date().getTime();
    }

    //setting record of Trend data and graph according to current time
    resolutionResetData() {
        this.dataPage = 1;
        this.graphPage = 1;
        this.curtimeData = new Date().getTime();
        this.curTimeGraph = new Date().getTime();
        this.getTrendGraph();
        this.getTrendData();
    }

    /* sets page no. and call Alarmhistory , trend data and trend graph functions */
    getPage(trend: number) {
        switch (trend) {
            case 1: if (this.alarmPage < this.totalPagesAlarm) {
                this.alarmPage++
            } else {
                this.alarmPage = this.totalPagesAlarm
            }
                this.getAlarmHistory();
                break;
            case 2: if (this.alarmPage == 1 || this.alarmPage == 0) {
                this.alarmPage == 1
            } else {
                this.alarmPage--
            }
                this.getAlarmHistory();
                break;

            case 3: if (this.dataPage < this.totalPagesData) {
                this.dataPage++
            } else {
                this.dataPage = this.totalPagesData
            }
                this.getTrendData();
                break;
            case 4: if (this.dataPage == 1 || this.dataPage == 0) {
                this.dataPage == 1
            } else {
                this.dataPage--
            }
                this.getTrendData();
                break;

            case 5: if (this.graphPage < this.totalPagesGraph) {
                this.graphPage++
            } else {
                this.graphPage = this.totalPagesGraph
            }
                this.getTrendGraph();
                break;
            case 6: if (this.graphPage == 1 || this.graphPage == 0) {
                this.graphPage == 1
            } else {
                this.graphPage--
            }
                this.getTrendGraph();
                break;
            default: return false;
        }
    }

    //Function for Resolution "+"  button functionality
    rightResolution() {
        this.showLoaderData = true;
        this.showLoaderGraph = true;
        this.inputResolution.Resolution.slice(this.resolution[this.counter]);
        if (this.counter <= this.resolution.length - 1) {
            var c = this.counter++;
            this.inputResolution.Resolution = this.resolution[c];
            this.select = this.inputResolution.Resolution;
        }
        // else {
        //     this.counter = 0;
        //     this.select = this.inputResolution.Resolution[0];
        // }
        // this.showLoaderData = false;
        // this.showLoaderGraph = false;
        this.resolutionResetData();
    }

    //Function for Resolution "-"  button functionality
    leftResolution() {
        this.showLoaderData = true;
        this.showLoaderGraph = true;
        var interval = this.select;
        this.counter = this.resolution.indexOf(interval);
        var decCounter = this.counter--;

        if (decCounter < 0) {
            var b = this.resolution.length - 1;
            this.inputResolution.Resolution = this.resolution[b];
            this.counter = b;
        } else if (this.counter == 0) {
            this.inputResolution.Resolution = this.resolution[this.counter]
        } else {
            this.inputResolution.Resolution = this.resolution[this.counter--];
            this.select = this.inputResolution.Resolution;
        }
        // this.showLoaderData = false;
        // this.showLoaderGraph = false;
        this.resolutionResetData();
    }

    //display trend graph with selected resolution and pagination. Next button functionality is applied.
    getTrendGraph() {
        this.showLoaderGraph = true;
        this._trend.trendgraphfn(this.patientid, this.inputResolution.Resolution, this.curTimeGraph, this.graphPage, this.pageSize).subscribe((data: any) => {
            // console.log(data);
            var rr: any[] = [];
            var hr: any[] = [];
            var pulse: any[] = [];
            var spo2: any[] = [];
            var temp1: any[] = [];
            var temp2: any[] = [];
            var nibph: any[] = [];
            var nibpl: any[] = [];
            var nibpm: any[] = [];
            if (data.status == "success") {
                this.totalPagesGraph = data.data.total_pages;
                for (var i = 0; i < data.data.trends.length; i++) {
                    rr[i] = (parseInt(data.data.trends[i].RR) == -1) ? null : parseInt(data.data.trends[i].RR);
                    hr[i] = (parseInt(data.data.trends[i].HR) == -1) ? null : parseInt(data.data.trends[i].HR);
                    pulse[i] = (parseInt(data.data.trends[i].PULSE) == -1) ? null : parseInt(data.data.trends[i].PULSE);
                    spo2[i] = (parseInt(data.data.trends[i].SPO2) == -1) ? null : parseInt(data.data.trends[i].SPO2);
                    temp1[i] = (parseInt(data.data.trends[i]["TEMP-1"]) == -1) ? null : parseInt(data.data.trends[i]["TEMP-1"]);
                    temp2[i] = (parseInt(data.data.trends[i]["TEMP-2"]) == -1) ? null : parseInt(data.data.trends[i]["TEMP-2"]);
                    nibph[i] = (parseInt(data.data.trends[i]["NIBP-HIGH"]) == -1) ? null : parseInt(data.data.trends[i]["NIBP-HIGH"]);
                    nibpl[i] = (parseInt(data.data.trends[i]["NIBP-LOW"]) == -1) ? null : parseInt(data.data.trends[i]["NIBP-LOW"]);
                    nibpm[i] = (parseInt(data.data.trends[i]["NIBP-MEAN"]) == -1) ? null : parseInt(data.data.trends[i]["NIBP-MEAN"]);
                    this.graphTimestamp[i] = new Date(parseInt(data.data.trends[i].timestamp)).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
                }

                this.chart.series[0].setData(hr)
                this.chart.series[1].setData(rr)
                this.chart.series[2].setData(spo2)
                this.chart.series[3].setData(pulse)
                this.chart.series[4].setData(temp1)
                this.chart.series[5].setData(temp2)
                this.chart.series[6].setData(nibph)
                this.chart.series[7].setData(nibpl)
                this.chart.series[8].setData(nibpm)
            } else {
                this.totalPagesGraph = 0;
                for (var i = 0; i < this.chart.series.length; i++) {
                    this.chart.series[i].setData([]);
                }
            }
            this.showLoaderGraph = false;
        }, (err: any) => {
            console.log("No Trend graph to display")
        }
        )
    }

    //display trend data with selected resolution and pagination. Next button functionality is applied.
    getTrendData() {
        this.noData=false;
        this.showLoaderData = true;
        this._trendData.trenddatafn(this.patientid, this.inputResolution.Resolution, this.curtimeData, this.dataPage, this.pageSize).subscribe((data: any) => {
            // console.log(data.success[0].data.length)
            if (data.status == "error" || !data.data) {
                this.noData=true;
                this.data_json = [];
            } else {
                this.totalPagesData = data.data.total_pages;
                this.data_json = [];
                for (var i = 0; i < data.data.trends.length; i++) {
                    this.data_json.push({
                        RR: ((data.data.trends[i].RR == -1) ? '--' : data.data.trends[i].RR),
                        HR: ((data.data.trends[i].HR == -1) ? '--' : data.data.trends[i].HR),
                        SPO2: ((data.data.trends[i].SPO2 == -1) ? '--' : data.data.trends[i].SPO2),
                        PULSE: ((data.data.trends[i].PULSE == -1) ? '--' : data.data.trends[i].PULSE),
                        TEMP1: ((data.data.trends[i]["TEMP-1"] == -1) ? '--' : data.data.trends[i]["TEMP-1"]),
                        TEMP2: ((data.data.trends[i]["TEMP-2"] == -1) ? '--' : data.data.trends[i]["TEMP-2"]),
                        NIBP_HIGH: ((data.data.trends[i]["NIBP-HIGH"] == -1) ? '--' : data.data.trends[i]["NIBP-HIGH"]),
                        NIBP_LOW: ((data.data.trends[i]["NIBP-LOW"] == -1) ? '--' : data.data.trends[i]["NIBP-LOW"]),
                        NIBP_MEAN: ((data.data.trends[i]["NIBP-MEAN"] == -1) ? '--' : data.data.trends[i]["NIBP-MEAN"]),
                        TIMESTAMP: new Date(parseInt(data.data.trends[i].timestamp)).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
                    });
                }
            }
            this.showLoaderData = false;
        }, (err: any) => {
            console.log("No trend data to display")
        }
        )
    }

    //display alarm history
    getAlarmHistory() {
        this.noAlarm=false;
        this.showLoader = true;
        this._alarm.alarmhistoryfn(this.patientid, this.curtimeAlarm, this.alarmPage, this.pageSize).subscribe((data: any) => {
            if (data.status == "error" || !data.data) {
                this.noAlarm=true;
                this.datatab = [];
            } else {
                this.time1 = [];
                this.datatab = data.data.alarms;
                this.totalPagesAlarm = data.data.total_pages;
                if (this.datatab.length > 0) {
                    for (var i = 0; i < this.datatab.length; i++) {
                        var time = this.datatab[i].timestamp;
                        var datet = new Date(parseInt(time)).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
                        this.time1.push(datet);
                    }
                }
            }
            this.showLoader = false;
        }, err => console.log("No alarm data to display")
        )
    }

    /*get notes for current patient */
    getNotes() {
        this._notes.getAllPatientNotes(this.patientid).subscribe((data: any) => {
            // this.showLoaderNotes=true;
            if (data.error) {
                this.notes = [];
                this.showArticleEnd = false;
            } else {
                this.showArticleEnd=true;
                this.notes = [];
                for (var i = 0; i < data.success.length; i++) {
                    this.notes.push({
                        CreatedOn: new Date(data.success[i].created_on).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }),
                        NotesDesc: data.success[i].note_description,
                        NoteId: data.success[i].note_id,
                        Thumbnail: this.sanitizer.bypassSecurityTrustResourceUrl("data:image/jpeg;base64," + data.success[i].encoded_thumbnail_string)
                    }
                    )
                }
            }
            // this.showLoaderNotes=false;
        }, err => console.log("No Notes to display")
        )
    }

    /*get full resolution images for corresponding thumbnails */
    getNotesImage(noteid: string) {
        this.showImage = false;
        this.imageLoader = true;
        this._notes.getPatientNotes(noteid).subscribe((data: any) => {
            this.base64img = "data:image/jpeg;base64," + data.success["0"].encoded_image_string
            this.imagePath = this.sanitizer.bypassSecurityTrustResourceUrl(this.base64img);

            if (this.viewer) {
                var tiledImage = this.viewer.world.getItemAt(0);
                this.viewer.world.removeItem(tiledImage);

                this.viewer.addTiledImage({
                    tileSource: {
                        type: 'image',
                        url: this.base64img,
                    }
                })
            } else {
                this.viewer = new OpenSeadragon({
                    id: 'image',
                    prefixUrl: '../app/dashboard/zoom/images/',
                    tileSources: {
                        type: 'image',
                        url: this.base64img,
                    },
                });
            }
            this.viewer.setFullPage(true);
            this.showImage = true;
            this.imageLoader = false;

        }, err => console.log("No images")
        )
    }

    getPatientSettings() {
        this._settings.patientSettingfn(this.patientid).subscribe((data: any) => {
            // console.log(data.success)
            this.settings = data.success
        }, err => console.log("No Settings")
        )
    }

    //Creates object for all the patients and send subscribe request to the server.
    getActivePatient() {
        this._activeservice.activePatientfn().subscribe(
            (data: any) => {
                this._websocketservice.initChart();
                // console.log("patients :"+JSON.stringify(data.patient))
                this.ActiveData = data.patient;
                this.com_name = data.patient[0].com_name;
                // console.log("device id :" + this.com_name)

                for (var i = 0; i < data.patient.length; i++) {
                    var pid = data.patient[i].patient_id;
                    Cards.card_list[pid] = new Patients();
                    Cards.card_list[pid].details = data.patient[i];
                    Cards.card_list[pid].alarm_list = [];
                    Cards.card_list[pid].cur_alrm_count = 0;
                    Cards.card_list[pid].active = '';
                    Cards.card_list[pid].hrAlarm = '';
                    Cards.card_list[pid].tempAlarm = '';
                    Cards.card_list[pid].spo2Alarm = '';
                    Cards.card_list[pid].respAlarm = '';
                    Cards.card_list[pid].nibpAlarm = '';
                    var channel = "ID:" + Cards.card_list[pid].details.com_name;

                    // add revese lookup entry
                    Cards.rev_lookup[channel] = pid;
                    this._websocketservice.subscribe(channel);
                }
                this.cards = Cards.card_list;
            });
    }

    //Handles History, Vitals and setting. Retrieves data of current patient and call correspoding graph, data and alarm functions.
    detailsTab(pid: string, name: string, gen: string, age: number, bed: string, hospital: string, item: any) {
        var old_active_channel = Cards.active_patient_channel;
        Cards.active_patient_id = pid;
        Cards.active_patient_channel = "ID:" + Cards.card_list[pid].details.com_name + ":graphs";
        Cards.rev_lookup[Cards.active_patient_channel + ""] = pid;

        this.patientname = name;
        this.gender = gen;
        this.age = age;
        this.bednumber = bed;
        this.patientid = pid;
        this.hospital = hospital;
        this.liveVitals = Cards.card_list[pid];

        this.showPatientSettings = { tab1: false, tab2: false, tab3: false, tab4: false, tab5: false, tab6: false }; 
        // var element = document.getElementById('element');
        // this.graphHeight = element.offsetHeight + 'px';
        // this.graphWidth = element.offsetWidth + 'px';

        // alert(this.graphHeight+" "+this.graphWidth)

        // this.initHighcharts();

        this.setCurTime();
        this.getTrendGraph();
        this.getTrendData();
        this.getAlarmHistory();
        this.getNotes();
        this.getPatientSettings();

        if (item === 'history')
            this.show = { tab1: true, tab2: false, tab3: false };
        else if (item === 'vitals') {
            if (old_active_channel) {
                this._websocketservice.unsubscribe(old_active_channel);
            }
            this._websocketservice.subscribe(Cards.active_patient_channel);
            // alert("device subscribed" + Cards.active_patient_channel + "  patient: " + Cards.card_list[pid].details.patient_name)
            this.show = { tab1: false, tab2: true, tab3: false };
        }
        else if (item === 'settings')
            this.show = { tab1: false, tab2: false, tab3: true };
    }

    //Handles trend graph, trend data and alarm history tabs
    historyTab(item: any) {
        if (item === 'trend_graph')
            this.showHistory = { tab1: true, tab2: false, tab3: false, tab4: false };
        else if (item === 'data_table')
            this.showHistory = { tab1: false, tab2: true, tab3: false, tab4: false };
        else if (item === 'alarm_history')
            this.showHistory = { tab1: false, tab2: false, tab3: true, tab4: false };
        else if (item === 'notes')
            this.showHistory = { tab1: false, tab2: false, tab3: false, tab4: true };
    }

    settingTab(item: any) {
        if (item === 'ecg') {
            this.showPatientSettings = { tab1: true, tab2: false, tab3: false, tab4: false, tab5: false, tab6: false };
        }
        else if (item === 'arrhythmia') {
            this.showPatientSettings = { tab1: false, tab2: true, tab3: false, tab4: false, tab5: false, tab6: false };
        }
        else if (item === 'spo2') {
            this.showPatientSettings = { tab1: false, tab2: false, tab3: true, tab4: false, tab5: false, tab6: false };
        }
        else if (item === 'resp_rate') {
            this.showPatientSettings = { tab1: false, tab2: false, tab3: false, tab4: true, tab5: false, tab6: false };
        }
        else if (item === 'nibp') {
            this.showPatientSettings = { tab1: false, tab2: false, tab3: false, tab4: false, tab5: true, tab6: false };
        }
        else if (item === 'temp') {
            this.showPatientSettings = { tab1: false, tab2: false, tab3: false, tab4: false, tab5: false, tab6: true };
        }
    }

    //Functions for Highcharts
    saveChart(chart: any) {
        this.chart = chart;
    }
    onPointSelect(point: any) {
        alert(`${point.y} is selected`);
    }
    onSeriesHide(series: any) {
        alert(`${series.name} is selected`);
    }

    // onResize(event:any) {
    //     this.chart = document.getElementById('element1')
        
    //     console.log('redraw');
    //     var w = document.getElementById('element1').closest(".wrapper").width()
    //     // setsize will trigger the graph redraw 
    //     this.chart.setSize(       
    //         w,w * (3/4),false
    //     );
    // }

    //Function for refresh button
    refresh() {
        this._router.navigate(['/'])
    }

    //Function for logout button
    logout() {
        this._logout.logoutfn();
        this._log.clearfields();
        window.localStorage.removeItem('auth_key')
        this._router.navigate(['']);
    }

}
