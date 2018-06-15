//#define CALIBRATE
//#define GRID

const double SERVO_LEFT_ZERO = 1800;
const double SERVO_RIGHT_ZERO = 850;

const double SERVO_LEFT_SCALE = 600;
const double SERVO_RIGHT_SCALE = 570;

#define DATE //comment this line if you don't need the date display
#define OPTION_12_HOUR //12 or 24 hour time
//#define OPTION_MONTH_DAY //day/month or month/day

const double DRAW_DELAY = 3;

///////////////////////////////////////////////////////////////////////////////

// Plotclock
// cc - by Johannes Heberlein 2014
// modified for glow clock - Tucker Shannon 2018
// improved - 12Me21 2018

// v 1.06
// thingiverse.com/joo   wiki.fablab-nuernberg.de
// thingiverse.com/TuckerPi
// units: mm; microseconds; radians
// origin: bottom left of drawing surface
// time library see http://playground.arduino.cc/Code/time
// RTC  library see http://playground.arduino.cc/Code/time
//               or http://www.pjrc.com/teensy/td_libs_DS1307RTC.html
// Change log:
// 1.01  Release by joo at https://github.com/9a/plotclock
// 1.02  Additional features implemented by Dave (https://github.com/Dave1001/):
//       - added ability to calibrate servofaktor seperately for left and right servos
//       - added code to support DS1307, DS1337 and DS3231 real time clock chips
//       - see http://www.pjrc.com/teensy/td_libs_DS1307RTC.html for how to hook up the real time clock
// 1.03  Fixed the length bug at the servoplotclockogp2 angle calculation, other fixups
// 1.04  Modified for Tuck's glow clock
// 1.05  Modified calibration mode to draw a 4 point square instead
// 1.06  Rewrote most of the code, improved calibration, added date drawing, fixed bug in angle calculations, etc.

///////////////////////////////////////////////////////////////////////////////

#include <TimeLib.h> //just need like 1 struct from here
#include <Servo.h> //servo controller
#include <Wire.h> //probably an IO library
#include <DS1307RTC.h> //RTC controller

//pins
const int SERVO_LEFT_PIN = 10;
const int SERVO_RIGHT_PIN = 9;
const int LED_PIN = 12;
const int BUTTON_PIN = 7;
#ifdef DATE
	const int DATE_PIN = 6;
#endif

//Sizes
const double LOWER_ARM = 35; //servo to lower arm joint
const double UPPER_ARM_LEFT = 56; //lower arm joint to led
const double LED_ARM = 13.5; //upper arm joint to led
const double UPPER_ARM = 45; //lower arm joint to upper arm joint
double cosineRule(double a, double b, double c);
const double LED_ANGLE = cosineRule(UPPER_ARM_LEFT,UPPER_ARM,LED_ARM);

//Location of servos relative to origin
const double SERVO_LEFT_X = 22;
const double SERVO_LEFT_Y = -32;
const double SERVO_RIGHT_X = SERVO_LEFT_X + 25.5;
const double SERVO_RIGHT_Y = SERVO_LEFT_Y;

// lovely macros
#define radian(angle) (M_PI*2* angle)
#define dist(x,y) sqrt(sq(x)+sq(y))
#define angle(x,y) atan2(y,x)

//digit location/size constants
const double TIME_BOTTOM = 12;
const double TIME_WIDTH = 11;
const double TIME_HEIGHT = 16;

const double DAY_WIDTH = 7;
const double DAY_HEIGHT = 12;
const double DAY_BOTTOM = 5;
const double DATE_BOTTOM = 24;

const double HOME_X = 55, HOME_Y = -5;
Servo servoLeft, servoRight;

const char weekDays[] = {7,9,11, 4,5,11, 8,9,1, 10,1,12, 8,3,9, 2,6,13, 7,0,8}; //character set: AEFHMORSTUWNDI

double lastX = HOME_X, lastY = HOME_Y;

bool lightOn = false;

void setup() {
	pinMode(LED_PIN, OUTPUT);
	digitalWrite(LED_PIN, LOW);
	pinMode(BUTTON_PIN, INPUT_PULLUP);
	#ifdef DATE
		pinMode(DATE_PIN, INPUT_PULLUP);
	#endif
}

void light(bool state){
	lightOn = state == HIGH; //I'm *pretty* sure HIGH/LOW are just true/false, but...
	delay(100);
	digitalWrite(LED_PIN, state);
}

void loop(){
	#if !defined(CALIBRATE) && !defined(GRID) && defined(DATE)
		bool date = false;
		if(digitalRead(DATE_PIN) == LOW)
			date = true;
		else
	#endif
	if(digitalRead(BUTTON_PIN) != LOW)
		return;
	if (!servoLeft.attached()) servoLeft.attach(SERVO_LEFT_PIN);
	if (!servoRight.attached()) servoRight.attach(SERVO_RIGHT_PIN);
	#ifdef CALIBRATE
		static bool half;
		servoLeft.writeMicroseconds(floor(SERVO_LEFT_ZERO + (half ? - M_PI/2  : 0) * SERVO_LEFT_SCALE ));
		servoRight.writeMicroseconds(floor(SERVO_RIGHT_ZERO + (half ? 0 : M_PI/2 ) * SERVO_RIGHT_SCALE ));
		light(half ? LOW : HIGH);
		half = !half;
		delay(2000);
	#else
		#ifdef GRID
			for(int i = 0; i <= 70; i += 10)
				for(int j = 0; j <= 40; j += 10){
					drawTo(i, j);
					light(HIGH);
					light(LOW);
				}
		#else
			drawTo(HOME_X, 0);
			tmElements_t tm;
			RTC.read(tm);
			//this part is messy sorry
			#ifdef DATE
				if(date){
					#ifdef OPTION_MONTH_DAY
						int temp = tm.Day;
						tm.Day = tm.Month;
						tm.Month = temp;
					#endif
					//draw month
					if(tm.Month / 10)
						drawDigit(70-(DAY_WIDTH+3)*5, DATE_BOTTOM, DAY_WIDTH, DAY_HEIGHT, tm.Month / 10);
					drawDigit(70-(DAY_WIDTH+3)*4, DATE_BOTTOM, DAY_WIDTH, DAY_HEIGHT, tm.Month % 10);
					// /
					drawDigit(70-(DAY_WIDTH+3)*3, DATE_BOTTOM, DAY_WIDTH, DAY_HEIGHT, 12);
					//day
					if(tm.Day / 10){
						drawDigit(70-(DAY_WIDTH+3)*2, DATE_BOTTOM, DAY_WIDTH, DAY_HEIGHT, tm.Day / 10);
						drawDigit(70-(DAY_WIDTH+3), DATE_BOTTOM, DAY_WIDTH, DAY_HEIGHT, tm.Day % 10);
					}else
						drawDigit(70-(DAY_WIDTH+3)*2, DATE_BOTTOM, DAY_WIDTH, DAY_HEIGHT, tm.Day % 10);
					//weekday
					drawDigit(5,DAY_BOTTOM,DAY_WIDTH,DAY_HEIGHT,13+weekDays[(tm.Wday-1)*3]);
					drawDigit(5+DAY_WIDTH+5,DAY_BOTTOM,DAY_WIDTH,DAY_HEIGHT,13+weekDays[(tm.Wday-1)*3+1]);
					drawDigit(5+(DAY_WIDTH+5)*2,DAY_BOTTOM,DAY_WIDTH,DAY_HEIGHT,13+weekDays[(tm.Wday-1)*3+2]);
				}else
			#endif
			{
				#ifdef OPTION_12_HOUR
					if(tm.Hour >= 12){
						tm.Hour = tm.Hour - 12;
						drawDigit(5,35,1,1,10);
					}
					if(tm.Hour == 0)
						tm.Hour = 12;
				#endif
				//draw hour
				if(tm.Hour / 10)
					drawDigit(3, TIME_BOTTOM, TIME_WIDTH, TIME_HEIGHT, tm.Hour / 10);
				drawDigit(3+TIME_WIDTH+3, TIME_BOTTOM, TIME_WIDTH, TIME_HEIGHT, tm.Hour % 10);
				//:
				drawDigit((70-TIME_WIDTH)/2, TIME_BOTTOM, TIME_WIDTH, TIME_HEIGHT, 11);
				//minute
				drawDigit(70-(TIME_WIDTH+3)*2, TIME_BOTTOM, TIME_WIDTH, TIME_HEIGHT, tm.Minute / 10);
				drawDigit(70-(TIME_WIDTH+3), TIME_BOTTOM, TIME_WIDTH, TIME_HEIGHT, tm.Minute % 10);
			}
		#endif //GRID
		drawTo(HOME_X, HOME_Y);
	#endif //CALIBRATE
	servoLeft.detach();
	servoRight.detach();
}

#define digitMove(dx, dy) drawTo(x + width*dx, y + height*dy)
#define digitStart(dx, dy) digitMove(dx, dy); light(HIGH)
#define digitArc(dx, dy, rx, ry, start, last) drawArc(x + width*dx, y + height*dy, width*rx, height*ry, radian(start), radian(last))

// Symbol is drawn with the lower left corner at (x,y) and a size of (width,height).
void drawDigit(double x, double y, double width, double height, char digit) {
	//see macros for reference
	switch (digit) {
		case 0: //
			digitStart(1/2,1);
			digitArc(1/2,1/2, 1/2,1/2, 1/4, -3/4);
			//digitStart(1,1/2);
			//digitArc(1/2,1/2, 1/2,1/2, 0, 1.02);
		break;case 1: //
			digitStart(1/4,7/8);
			digitMove(1/2,1);
			digitMove(1/2,0);
		break;case 2: //
			digitStart(0,3/4);
			digitArc(1/2,3/4, 1/2,1/4, 1/2, -1/8);
			digitArc(1,0, 1,1/2, 3/8, 1/2);
			digitMove(1,0);
		break;case 3:
			digitStart(0,3/4);
			digitArc(1/2,3/4, 1/2,1/4, 3/8, -1/4);
			digitArc(1/2,1/4, 1/2,1/4, 1/4, -3/8);
		break;case 4:
			digitStart(1,3/8);
			digitMove(0,3/8);
			digitMove(3/4,1);
			digitMove(3/4,0);
		break;case 5: //wayy too many damn lines
			digitStart(1,1);
			digitMove(0,1);
			digitMove(0,1/2);
			digitMove(1/2,1/2);
			digitArc(1/2,1/4, 1/2,1/4, 1/4, -1/4);
			digitMove(0,0);
		break;case 6:
			digitStart(0,1/4);
			digitArc(1/2,1/4, 1/2,1/4, 1/2, -1/2);
			digitArc(1,1/2, 1,1/2, 1/2, 1/4);
		break;case 7:
			digitStart(0,1);
			digitMove(1,1);
			digitMove(1/4,0);	
		break;case 8:
			digitStart(1/2,1/2);
			digitArc(1/2,3/4, 1/2,1/4, -1/4, 3/4);
			digitArc(1/2,1/4, 1/2,1/4, 1/4, -3/4);
		break;case 9:
			digitStart(1,3/4);
			digitArc(1/2,3/4, 1/2,1/4, 0, 1);
			digitMove(3/4,0);
		#ifdef OPTION_12_HOUR
			break;case 10: //dot
				digitStart(0,0);
				//digitMove(0,1);
				//digitMove(1,1);
				//digitMove(1,0);
		#endif
		break;case 11: //colon
			digitStart(1/2,3/4);
			light(LOW);
			digitStart(1/2,1/4);
		break;case 12: //slash
			digitStart(3/4,5/4);
			digitMove(1/4,-1/4);
		#ifdef DATE
			//letters for the day of the week
			break;case 13: //A
				digitStart(0,0);
				digitMove(1/2,1);
				digitMove(1,0);
				light(LOW);
				digitStart(1/4,1/2);
				digitMove(3/4,1/2);
			break;case 14: //E
				digitStart(1,0);
				digitMove(0,0);
				digitMove(0,1);
				digitMove(1,1);
				light(LOW);
				digitStart(0,1/2);
				digitMove(1,1/2);
			break;case 15: //F
				digitStart(0,0);
				digitMove(0,1);
				digitMove(1,1);
				light(LOW);
				digitStart(0,1/2);
				digitMove(1,1/2);
			break;case 16: //H
				digitStart(0,1);
				digitMove(0,0);
				light(LOW);
				digitStart(0,1/2);
				digitMove(1,1/2);
				light(LOW);
				digitStart(1,1);
				digitMove(1,0);
			break;case 17: //M
				digitStart(0,0);
				digitMove(0,1);
				digitMove(1/2,1/2);
				digitMove(1,1);
				digitMove(1,0);
			break;case 18: //O (0)
				digitStart(1,1/2);
				digitArc(1/2,1/2, 1/2,1/2, 0, 1.02);
			break;case 19: //R
				digitStart(0,0);
				digitMove(0,1);
				digitMove(1/2,1);
				digitArc(1/2,3/4, 1/2,1/4, 1/4, -1/4);
				digitMove(0,1/2);
				digitMove(1,0);
			break;case 20: //S
				digitStart(0,0);
				digitMove(1/2,0);
				digitArc(1/2,1/4, 1/2,1/4, -1/4, 1/4);
				digitArc(1/2,3/4, 1/2,1/4, 3/4, 1/4);
				digitMove(1,1);
			break;case 21: //T
				digitStart(1,1);
				digitMove(-1/2,1); //bad
				light(LOW);
				digitStart(1/2,1);
				digitMove(1/2,0);
			break;case 22: //U
				digitStart(0,1);
				digitMove(0,1/4);
				digitArc(1/2,1/4, 1/2,1/4, -1/2, 0);
				digitMove(1,1);
			break;case 23: //W
				digitStart(0,1);
				digitMove(0,0);
				digitMove(1/2,1/2);
				digitMove(1,0);
				digitMove(1,1);
			break;case 24: //N
				digitStart(0,0);
				digitMove(0,1);
				digitMove(1,0);
				digitMove(1,1);
			break;case 25: //D
				digitStart(0,0);
				digitMove(0,1);
				digitMove(1/2,1);
				digitArc(1/2,1/2, 1/2,1/2, 1/4,-1/4);
				digitMove(0,0);
			break;case 26: //I
				digitStart(1/2,1);
				digitMove(1/2,0);
		#endif
	}
	light(LOW);
}

#define ARCSTEP 0.05 //should change depending on radius...
void drawArc(double x, double y, double rx, double ry, double pos, double last) {
	if(pos < last)
		for(; pos <= last; pos += ARCSTEP)
		    drawTo(x + cos(pos)*rx, y + sin(pos)*ry);
	else
		for(; pos >= last; pos -= ARCSTEP)
			drawTo(x + cos(pos)*rx, y + sin(pos)*ry);
}

//didn't really change this
void drawTo(double pX, double pY) {
	double dx, dy, c;
	int i;
	
	// dx dy of new point
	dx = pX - lastX;
	dy = pY - lastY;
	//path length in mm, times 4 equals 4 steps per mm
	c = floor(4 * dist(dx,dy));
	
	if (c < 1)
		c = 1;
	
	// draw line point by point
	for (i = 1; i <= c; i++){
		set_XY(lastX + (i * dx / c), lastY + (i * dy / c));
		if (lightOn)
			delay(DRAW_DELAY);
	}
	
	lastX = pX;
	lastY = pY;
}

// cosine rule for angle between c and a
double cosineRule(double a, double b, double c) {
	return acos((sq(a)+sq(c)-sq(b))/(2*a*c));
}

void set_XY(double x, double y) {
	//Calculate triangle between left servo, left arm joint, and light
	//Position of pen relative to left servo
	//rectangular
	double penX = x - SERVO_LEFT_X;
	double penY = y - SERVO_LEFT_Y;
	//polar
	double penAngle = angle(penX,penY);
	double penDist = dist(penX,penY);
	//get angle between lower arm and a line connecting the left servo and the pen
	double bottomAngle = cosineRule(LOWER_ARM, UPPER_ARM_LEFT, penDist);
	
	servoLeft.writeMicroseconds(floor(SERVO_LEFT_ZERO + (bottomAngle + penAngle - M_PI) * SERVO_LEFT_SCALE));
	
	//calculate middle arm joint location
	double topAngle = cosineRule(UPPER_ARM_LEFT, LOWER_ARM, penDist);
	double lightAngle = penAngle - topAngle + LED_ANGLE + M_PI;
	double jointX = x - SERVO_RIGHT_X + cos(lightAngle) * LED_ARM;
	double jointY = y - SERVO_RIGHT_Y + sin(lightAngle) * LED_ARM;
	
	bottomAngle = cosineRule(LOWER_ARM, UPPER_ARM, dist(jointX, jointY));
	double jointAngle = angle(jointX, jointY);
	
	servoRight.writeMicroseconds(floor(SERVO_RIGHT_ZERO + (jointAngle - bottomAngle) * SERVO_RIGHT_SCALE));
}
