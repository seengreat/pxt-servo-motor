// tests go here; this will not be compiled when this package is used as an extension.
basic.forever(() => {
    servo_motor.servo_pulse(1, 1500)
    servo_motor.servo(1, 90)
    servo_motor.servo_pulse(2, 1500)
    servo_motor.servo(2, 90)
    servo_motor.servo_pulse(3, 1500)
    servo_motor.servo(3, 90)
    servo_motor.servo_pulse(4, 1500)
    servo_motor.servo(4, 90)
    servo_motor.servo_pulse(5, 1500)
    servo_motor.servo(5, 90)
    servo_motor.servo_pulse(6, 1500)
    servo_motor.servo(6, 90)
    servo_motor.servo_pulse(7, 1500)
    servo_motor.servo(7, 90)
    servo_motor.servo_pulse(8, 1500)
    servo_motor.servo(8, 90)
})
