enum Motor {
    //% block="LA"
    M1_A = 0x1,
    //% block="LB"
    M1_B = 0x2,
    //% block="RA"
    M2_A = 0x2,
    //% block="RB"
    M2_B = 0x3,
}
enum Servo_Ch {
    //% block="S1"
    S1 = 8,
    //% block="S2"
    S2 = 9,
    //% block="S3"
    S3 = 10,
    //% block="S4"
    S4 = 11,
    //% block="S5"
    S5 = 12,
    //% block="S6"
    S6 = 13,
    //% block="S7"
    S7 = 14,
    //% block="S8"
    S8 = 15,
}

enum Dir {
    //% block="Forward"
    forward = 0x1,
    //% block="Backward"
    backward = 0x2,
}
/**
 * 自定义图形块
 */
//% weight=5 color=#0fbc11 icon="\uf113"
namespace servo_motor {
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09
    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD

    const STP_CHA_L = 2047
    const STP_CHA_H = 4095

    const STP_CHB_L = 1
    const STP_CHB_H = 2047

    const STP_CHC_L = 1023
    const STP_CHC_H = 3071

    const STP_CHD_L = 3071
    const STP_CHD_H = 1023

    const motor_m1_a = [0, 1]
    const motor_m1_b = [2, 3]
    const motor_m2_a = [4, 5]
    const motor_m2_b = [6, 7]

    let initialized = false

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50);
        setPwm(0, 0, 4095);
        for (let idx = 1; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }

	/**
	 * Servo Execute
	 * @param degree [0-180] degree of servo; eg: 90, 0, 180
	*/
    //% blockId=setServo block="Servo channel|%channel|degree %degree"
    //% weight=85
    //% degree.min=0 degree.max=180
    export function servo(channel: Servo_Ch, degree: number): void {
		if (!initialized) {
            initPCA9685();
        }
		// 50hz: 20,000 us
        let v_us = (degree * 1800 / 180 + 600); // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000;
        setPwm(channel-1, 0, value);
    }
	
	/**
	 * Servo Execute
	 * @param pulse [500-2500] pulse of servo; eg: 1500, 500, 2500
	*/
    //% blockId=setServoPulse block="Servo channel|%channel|pulse %pulse"
    //% weight=85
    //% channel.min=1 channel.max=8
    //% pulse.min=500 pulse.max=2500
    export function servo_pulse(channel: Servo_Ch, pulse: number): void {
		if (!initialized) {
            initPCA9685();
        }
		// 50hz: 20,000 us
        let value = pulse * 4096 / 20000;
        setPwm(channel, 0, value);
    }
	/**
	 * Servo Execute
	 * @param degree [0-180] degree of servo; eg: 90, 0, 180
	*/
    //% blockId=setMotor block="Motor channel|%channel|degree %degree"
    //% weight=85
    //% degree.min=0 degree.max=4095
    export function motor(motor_name: Motor,dir: Dir, speed:number): void {
		if (!initialized) {
            initPCA9685();
        }
        // 50hz: 20,000 us
        let value = speed * 4096 / 20000;
        switch (motor_name) { 
            case Motor.M1_A:
                if (dir == Dir.forward) {
                    setPwm(0, 0, 0);
                    setPwm(1, 0, value);
                }
                else {
                    setPwm(0, 0, value);
                    setPwm(1, 0, 0);
                }
                break;
            case Motor.M1_B:
                if (dir == Dir.forward) {
                    setPwm(2, 0, 0);
                    setPwm(3, 0, value);
                }
                else {
                    setPwm(2, 0, value);
                    setPwm(3, 0, 0);
                }
            break;
            case Motor.M2_A:
                if (dir == Dir.forward) {
                    setPwm(4, 0, 0);
                    setPwm(5, 0, value);
                }
                else {
                    setPwm(4, 0, value);
                    setPwm(5, 0, 0);
                }
            break;
            case Motor.M2_B:
                if (dir == Dir.forward) {
                    setPwm(6, 0, 0);
                    setPwm(7, 0, value);
                }
                else {
                    setPwm(6, 0, value);
                    setPwm(7, 0, 0);
                }
                break;
        }
    }
}
