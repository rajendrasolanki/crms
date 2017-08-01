//Websocket Class
import { Injectable, Inject } from '@angular/core';
import { Subject, Observer, Observable } from 'rxjs/Rx';
// import Rx from 'rxjs/Rx';
import { ActivePatient } from '../vitals/ActivePatient';
import { Cards } from '../Cards/Cards';
import { Alarms } from '../vitals/Alarms';


@Injectable()
export class WebsocketService extends ActivePatient {
    public websocket: any;

    public alarm: string;
    public alarm_temp: string;
    public _activepatient: ActivePatient[] = [];

    public ecg1_line: any = new TimeSeries();
    public ecg2_line: any = new TimeSeries();
    public ecg3_line: any = new TimeSeries();

    public spo2_line: any = new TimeSeries();
    public rr_line: any = new TimeSeries();

    public alrm_list: any[];
    public missing: any[];

    public disconnectflag = false;
    public connectflag = false;

    public createWebsocket() {
        this.websocket = new WebSocket('wss://lat-tice.com/ws');
        // this.websocket = new WebSocket('ws://45.33.53.93:8080/ws');
        this.websocket.binaryType = 'arraybuffer';

        this.websocket.onopen = (evt: any) => {
            this.websocket.send("websocket connected");
            console.log("websocket connected")
            this.connectflag = true;
        };


        this.websocket.onmessage =
            (evt: any) => {
                try {
                    if (typeof evt.data === "string") {
                        console.log("helloooo  :" + evt.data)

                        Cards.server_ack.push(evt.data);

                        setTimeout(() => {
                            let missing = Cards.subscribe_channels.filter(item => Cards.server_ack.indexOf(item) < 0);
                            // console.log(missing);
                            for (var i = 0; i <= missing.length; i++) {
                                this.send(missing[i])

                                Cards.subscribe_channels = [];
                                Cards.server_ack = [];
                            }
                        },
                            5000)
                    }
                    var all_pack = msgpack.decode(this.convert(evt.data));

                    var packets = all_pack.data
                    var msg_id = all_pack.id
                    // var msg_id = packets.
                    // for(var i in p.data)
                    for (var i = 0; i < packets.length; i++) {
                        var pacs = packets[i];
                        this.handler(msg_id, pacs);
                    }

                } catch (Error) {
                    //alert(Error.message);
                    return false;
                }
            };

        this.websocket.onclose = (evt: any) => {
            console.log("disconnected")
            this.websocket = null
            this.disconnectflag = true;
            this.reconnectSocket(this.disconnectflag)

        };

        this.websocket.onerror = (evt: any) => {
            console.log("error" + evt)
        };

    }

    convert(data: any) {
        return new Uint8Array(data);
    }

    public disconnect() {
        if (this.websocket === null)
            return console.log('already disconnected');

        this.websocket.close();
        return false;
    }

    private send(msg: String) {
        if (this.websocket === null) {
            console.log("could not connect")
            return false;
        }
        else {
            setTimeout(() => {
                this.websocket.send(msg);
            },
                2000)

            // this.createWebsocket();
        }

        return true;
    }

    subscribe(channel: String) {
        var msg = JSON.stringify({ "action": "subscribe", "data": channel })
        Cards.subscribe_channels.push(msg);
        return this.send(msg)
    }

    unsubscribe(channel: String) {
        var msg = JSON.stringify({ "action": "unsubscribe", "data": channel })
        return this.send(msg)
    }

    reconnectSocket(flag: boolean) {
        if (flag == true)
            this.createWebsocket();
    }

    handler(channel: any, p: any) {
        {
            // current patient
            var cur_p = Cards.card_list[Cards.rev_lookup[channel]];
            if (!cur_p) {
                console.log("no patient for: " + channel);
                return;
            }

            // TODO if p[0] is in 0x05/0x16/0x10, then if pid != active_patient, then return
            if (Cards.rev_lookup[channel] != Cards.active_patient_id) {
                switch (p[0]) {
                    case 0x05:
                    case 0x16:
                    case 0x10:
                        return;
                }
            }

            switch (p[0]) {

                case 0x05:
                    /*********************************** ECG GRAPH*******************************************/
                    var val1 = ((0x3f & p[2]) * 256 + p[3]);
                    var val2 = (p[4] * 256 + p[5]);
                    var val3 = (p[6] * 256 + p[7]);

                    if (this.ecg_timestamp == -1) {
                        this.ecg_timestamp = new Date().getTime();
                    }

                    this.ecg_timestamp += 1000.0 / 500

                    this.ecg1_line.append(this.ecg_timestamp, val1);
                    // ecg2_line.append(ecg_timestamp, val2);
                    // ecg3_line.append(ecg_timestamp, val3);

                    break;
                case 0x07:
                    //console.log("HR = " + (p[2] * 256 + p[3]));
                    if ((p[2] * 256 + p[3]) <= 350) {
                        cur_p.hr = (p[2] * 256 + p[3]);
                        cur_p.hr_ts = new Date();

                    }
                    else {
                        cur_p.hr = '--'
                    }
                    break;
                case 0x11:
                    //console.log("RR = " + (p[2] * 256 + p[3]));
                    if ((p[2] * 256 + p[3]) <= 100) {
                        cur_p.rr = (p[2] * 256 + p[3]);
                        cur_p.rr_ts = new Date();
                    } else {
                        cur_p.rr = '--'
                    }
                    break;
                case 0x15:
                    //console.log("T1 = " + (p[3] * 256 + p[4]) / 10.0 + " C");
                    var tempC1 = (p[3] * 256 + p[4]) / 10.0;
                    var tempC2 = (p[5] * 256 + p[6]) / 10.0;

                    var temp1 = Math.round((tempC1 * 9 / 5 + 32) * 10) / 10;
                    var temp2 = Math.round((tempC2 * 9 / 5 + 32) * 10) / 10;

                    if (temp1 == undefined || temp1 > 6543.6) {
                        cur_p.temp1 = '--';
                    } else {
                        cur_p.temp1 = temp1;
                        cur_p.temp1_ts = new Date();
                    }

                    if (temp2 == undefined || temp2 > 6543.6) {
                        cur_p.temp2 = '--';
                    } else {
                        cur_p.temp2 = temp2;
                        cur_p.temp2_ts = new Date();
                    }
                    break;
                /*********************************** SPO2 GRAPH*******************************************/
                case 0x16:
                    var val = p[2];

                    var cur = new Date().getTime();
                    if ((cur - this.spo2_timestamp) > 4000) {
                        this.ecg_timestamp = -1;
                        this.spo2_timestamp = -1;
                        this.rr_timestamp = -1;
                    }

                    if (this.spo2_timestamp == -1) {
                        this.spo2_timestamp = new Date().getTime();
                    }

                    this.spo2_timestamp += 1000.0 / 125
                    this.spo2_line.append(this.spo2_timestamp, val);

                    break;
                case 0x17:
                    // cur_p.spo2 = (p[5]);
                    if ((p[5]) <= 100) {
                        cur_p.spo2 = (p[5]);
                        cur_p.spo2_ts = new Date();
                    } else {
                        cur_p.spo2 = '--';
                    }

                    break;
                case 0x22:
                    var nibpsys = (p[2] * 256 + p[3]);
                    var nibpdia = (p[4] * 256 + p[5]);

                    if (nibpsys == undefined || nibpsys == 65436) {
                        cur_p.nibpsys = '--';
                        cur_p.nibpsys_ts = new Date();
                    } else {
                        cur_p.nibpsys = nibpsys;
                    }

                    if (nibpdia == undefined || nibpdia == 65436) {
                        cur_p.nibpdia = '--';
                    } else {
                        cur_p.nibpdia = nibpdia;
                        cur_p.nibpdia_ts = new Date();
                    }
                    break;
                /*********************************** RR GRAPH*******************************************/
                case 0x10:
                    var vall = p[2] & 0xff;

                    if (this.rr_timestamp == -1) {
                        this.rr_timestamp = new Date().getTime();
                    }

                    this.rr_timestamp += 1000.0 / 125
                    this.rr_line.append(this.rr_timestamp, vall);
                    break;

                //Add and remove alarm
                case 0x29:
                    {
                        var alrm_pri = p[3];
                        var alrm_id = p[2];
                        var add_remove = p[4];
                        var alarm;

                        if (Alarms.alarm_strings[alrm_id]) {
                            if (add_remove == 0) { //remove alarm
                                // this.alarm_removefn(cur_p.alarm_list, Alarms.alarm_strings[alrm_id]);
                                // delete cur_p.alarm_list[alrm_id];
                                // delete cur_p.alarm_list[(Alarms.alarm_strings[alrm_id])];
                                for (var i = cur_p.alarm_list.length - 1; i >= 0; i--) {
                                    if (cur_p.alarm_list[i] === Alarms.alarm_strings[alrm_id]) {
                                        cur_p.alarm_list.splice(i, 1);
                                        // break;       //<-- Uncomment  if only the first term has to be removed
                                    }

                                }

                            } else if (add_remove == 1) { // add alarm
                                // cur_p.alarm_list.push(Alarms.alarm_strings[alrm_id]);
                                // cur_p.alarm_list[alrm_id] = true;
                                // cur_p.alarm_list[(Alarms.alarm_strings[alrm_id])] = true;
                                if(alrm_pri == 2){
                                    cur_p.alarm_list.push(Alarms.alarm_strings[alrm_id]+'*')
                                }else
                                cur_p.alarm_list.push(Alarms.alarm_strings[alrm_id])
                            }
                            this.update_alarms_count(cur_p, alrm_id, alrm_pri);
                        }
                    }
                    break;

                //Current alarm
                case 0x30:
                    //console.log("alarm received")
                    var alrm_pri = p[2];
                    var alrm_id = p[3]

                    if (Alarms.alarm_strings[alrm_id]) {
                        cur_p.alarm = Alarms.alarm_strings[alrm_id];
                    } else if (cur_p.cur_alrm_count == 0) {
                        cur_p.alarm = "";
                    }
                    break;

                //clear alarm list    
                case 0x33:
                    this.resetAlarms(cur_p);
                    cur_p.alarm_list = [];
                    cur_p.cur_alrm_count = 0;
                    break;
            }
        }
    }

    //setting the alarm count
    update_alarms_count(patient: any, alrm_id: any, priority: any) {
        // if (Object.keys(patient.alarm_list).length > 0) {
        //     patient.cur_alrm_count = Object.keys(patient.alarm_list).length;
        // } else {
        //     patient.cur_alrm_count = null;
        // }
        // this.resetAlarms(patient);
        if (patient.alarm_list.length > 0) {
            patient.cur_alrm_count = patient.alarm_list.length - 1;
        } else {
            patient.cur_alrm_count = null;
        }

        // if (priority == 2) {
        //     if (Alarms.arrythmia_alarms.includes(Alarms.alarm_strings[alrm_id])) {
        //         patient.active = 'alarm';
        //     } else if (Alarms.hr_alarms.includes(Alarms.alarm_strings[alrm_id])) {
        //         patient.hrAlarm = 'alarm';
        //     } else if (Alarms.temp_alarms.includes(Alarms.alarm_strings[alrm_id])) {
        //         patient.tempAlarm = 'alarm';
        //     } else if (Alarms.spo2_alarms.includes(Alarms.alarm_strings[alrm_id])) {
        //         patient.spo2Alarm = 'alarm';
        //     } else if (Alarms.resp_alarms.includes(Alarms.alarm_strings[alrm_id])) {
        //         patient.respAlarm = 'alarm';
        //     } else if (Alarms.nibp_alarms.includes(Alarms.alarm_strings[alrm_id])) {
        //         patient.nibpAlarm = 'alarm';
        //     }
        // } else {
        //     this.resetAlarms(patient);
        // }

        switch (priority) {
            case 0:
            case 1: if (Alarms.arrythmia_alarms.includes(Alarms.alarm_strings[alrm_id])) {
                patient.active = '';
            } else if (Alarms.hr_alarms.includes(Alarms.alarm_strings[alrm_id])) {
                patient.hrAlarm = '';
            } else if (Alarms.temp_alarms.includes(Alarms.alarm_strings[alrm_id])) {
                patient.tempAlarm = '';
            } else if (Alarms.spo2_alarms.includes(Alarms.alarm_strings[alrm_id])) {
                patient.spo2Alarm = '';
            } else if (Alarms.resp_alarms.includes(Alarms.alarm_strings[alrm_id])) {
                patient.respAlarm = '';
            } else if (Alarms.nibp_alarms.includes(Alarms.alarm_strings[alrm_id])) {
                patient.nibpAlarm = '';
            }
                break;

            case 2: if (Alarms.arrythmia_alarms.includes(Alarms.alarm_strings[alrm_id])) {
                patient.active = 'alarm';
            } else if (Alarms.hr_alarms.includes(Alarms.alarm_strings[alrm_id])) {
                patient.hrAlarm = 'alarm';
            } else if (Alarms.temp_alarms.includes(Alarms.alarm_strings[alrm_id])) {
                patient.tempAlarm = 'alarm';
            } else if (Alarms.spo2_alarms.includes(Alarms.alarm_strings[alrm_id])) {
                patient.spo2Alarm = 'alarm';
            } else if (Alarms.resp_alarms.includes(Alarms.alarm_strings[alrm_id])) {
                patient.respAlarm = 'alarm';
            } else if (Alarms.nibp_alarms.includes(Alarms.alarm_strings[alrm_id])) {
                patient.nibpAlarm = 'alarm';
            }
                break;

            default: this.resetAlarms(patient);
                break;

        }
    }

    resetAlarms(patient: any) {
        patient.active = '';
        patient.hrAlarm = '';
        patient.tempAlarm = '';
        patient.spo2Alarm = '';
        patient.respAlarm = '';
        patient.nibpAlarm = '';
    }

    test() {
        console.log("ok");
    }
    log(text: any) {
        console.log(text)
    }

    // initChart() {
    //     //  setTimeout(() => {
    //     this._activepatient.chart_1 = new SmoothieChart({ interpolation: 'linear', millisPerPixel: 4, grid: { fillStyle: '#ffffff', strokeStyle: 'transparent' }, labels: { fillStyle: '#000000' }, timestampFormatter: SmoothieChart.timeFormatter, maxValue: 4096, minValue: 0 });
    //     // chart_2 = new SmoothieChart({interpolation:'linear',millisPerPixel:4,grid:{strokeStyle:'rgba(119,119,119,0.60)'},maxValue:4096,minValue:0});
    //     // chart_3 = new SmoothieChart({interpolation:'linear',millisPerPixel:4,grid:{strokeStyle:'rgba(119,119,119,0.60)'},maxValue:4096,minValue:0});
    //     this._activepatient.spo2_chart = new SmoothieChart({ interpolation: 'linear', millisPerPixel: 8, grid: { fillStyle: '#ffffff', strokeStyle: 'transparent' }, labels: { fillStyle: '#000000' }, timestampFormatter: SmoothieChart.timeFormatter, maxValue: 255, minValue: 0 });
    //     this._activepatient.rr_chart = new SmoothieChart({ interpolation: 'linear', millisPerPixel: 8, grid: { fillStyle: '#ffffff', strokeStyle: 'transparent' }, labels: { fillStyle: '#000000' }, timestampFormatter: SmoothieChart.timeFormatter, maxValue: 255, minValue: 0 });

    //     this._activepatient.chart_1.streamTo(document.getElementById("container_ecg1"), 4000);

    //     // chart_2.streamTo(document.getElementById("canvas2"), 2000);
    //     // chart_3.streamTo(document.getElementById("canvas3"), 2000);
    //     this._activepatient.spo2_chart.streamTo(document.getElementById("container_spo2"), 4000);
    //     this._activepatient.rr_chart.streamTo(document.getElementById("container_rr"), 4000);

    //     this._activepatient.chart_1.addTimeSeries(this.ecg1_line, { lineWidth: 1.9, strokeStyle: '#ff0000' });
    //     // chart_2.addTimeSeries(ecg2_line, { strokeStyle:'#00ff00'});
    //     // chart_3.addTimeSeries(ecg3_line, { strokeStyle:'#0000ff'});
    //     this._activepatient.spo2_chart.addTimeSeries(this.spo2_line, { lineWidth: 1.9, strokeStyle: '#00ff00' });
    //     this._activepatient.rr_chart.addTimeSeries(this.rr_line, { lineWidth: 1.9, strokeStyle: '#0000ff' });

    //     //  },
    //     //  20000);



    // }

    initChart() {
        this._activepatient.chart_1 = new SmoothieChart({ interpolation: 'bezier', millisPerPixel: 18, grid: { fillStyle: '#ffffff', strokeStyle: 'transparent' }, labels: { fillStyle: '#000000' }, maxValue: 4096, minValue: 0 });
        this._activepatient.spo2_chart = new SmoothieChart({ interpolation: 'bezier', millisPerPixel: 9, grid: { fillStyle: '#ffffff', strokeStyle: 'transparent' }, labels: { fillStyle: '#000000' }, maxValue: 255, minValue: 0 });
        this._activepatient.rr_chart = new SmoothieChart({ interpolation: 'bezier', millisPerPixel: 9, grid: { fillStyle: '#ffffff', strokeStyle: 'transparent' }, labels: { fillStyle: '#000000' }, maxValue: 255, minValue: 0 });

        this._activepatient.chart_1.streamTo(document.getElementById("container_ecg1"), 2000);
        this._activepatient.spo2_chart.streamTo(document.getElementById("container_spo2"), 2000);
        this._activepatient.rr_chart.streamTo(document.getElementById("container_rr"), 2000);

        this._activepatient.chart_1.addTimeSeries(this.ecg1_line, { lineWidth: 0.8, strokeStyle: '#ff0000' });
        this._activepatient.spo2_chart.addTimeSeries(this.spo2_line, { lineWidth: 1.9, strokeStyle: '#00ff00' });
        this._activepatient.rr_chart.addTimeSeries(this.rr_line, { lineWidth: 1.9, strokeStyle: '#0000ff' });

        // Set up the resizer, note that a resize is immediately triggered and a redraw() will follow that
        var canvasResizer = new swevans.CanvasResizer("container_ecg1");
        var canvasResizer1 = new swevans.CanvasResizer("container_spo2");
        var canvasResizer2 = new swevans.CanvasResizer("container_rr");
    }

}

