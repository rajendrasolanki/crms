import { Injectable, Inject } from '@angular/core';

@Injectable()
export class ActivePatient {

    /*   Patient alarms    */
    alrm: string;

    /*   Patient Details    */
    age: any;
    blood_group: string;
    com_name: string;
    dob: number;
    gender: number;
    height: number;
    hospital_id: number;
    hospital_name: string;

    patient_bed_number: any;
    patient_code: number;
    patient_id: number;
    patient_name: string;
    ward_id: number;
    ward_name: string;
    weight: number;

    /*   Patient vitals    */
    ecg_timestamp: number = -1;
    spo2_timestamp: number = -1;
    rr_timestamp: number = -1;
    // temp_value: any;
    // temp1: any = '-';
    // temp2: any = '-';
    // temp1_value: any;
    // temp2_value: any;
    // hr: any = '--';
    // rr: any = '--';
    // nibpsys: any = '--';
    // nibpdia: any = '--';
    // nibpsys_value: any;
    // nibpdia_value: any;
    // spo2: any = '--';

    temp1: any = '-';
    temp2: any = '-';
    temp1_value: any;
    temp2_value: any;
    hr: any;
    rr: any;
    nibpsys: any = '--';
    nibpdia: any = '--';
    nibpsys_value: any;
    nibpdia_value: any;
    spo2: any;

    /*   Patient Graphs    */

    chart_1: any;
    chart_2: any;
    chart_3: any;
    ecg_count: number = 0;
    max_points: number = 2000;

    spo2_chart: any;
    spo2_count: number = 0;
    spo2_max_points: number = 500;

    rr_chart: any;
    rr_count: number = 0;
    rr_max_points: number = 500;

}