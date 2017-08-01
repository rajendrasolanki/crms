export class Patients {

    public tempValue: any;
    public hrValue: any;
    public rrValue: any;
    public nibpValue: any;
    public spo2Value: any;
    public alarms: String[];
    public current_alarm: number;
    public details: any;

    public patient: {
        device_id: string,
        vitals: { RR: number, HR: number, SPO2: number, TEMP: number, NIBP: number };
    }
}



