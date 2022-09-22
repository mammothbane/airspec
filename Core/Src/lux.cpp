/*
 * ppg.c
 *
 *  Created on: Nov 30, 2021
 *      Author: patrick
 */
#include "lux.h"
#include "TSL2772.h"
#include "packet.h"
#include "main.h"
#include "cmsis_os2.h"
#include "portmacro.h"
#include "captivate_config.h"


#define LUX_SAMPLE_SYS_PERIOD_MS		5000 //how often do we want the system to sample
#define SEND_LUX_EVERY_X_S				30
#define MAX_LUX_SAMPLES_PACKET	(SEND_LUX_EVERY_X_S*1000)/LUX_SAMPLE_SYS_PERIOD_MS

typedef struct luxSamples {
	uint32_t lux;
	uint32_t timestamp;
} luxSample;


static void triggerLuxSample(void *argument);
static luxSample luxData[MAX_LUX_SAMPLES_PACKET];


static PacketHeader header;
//osThreadId_t specTaskHandle;
osTimerId_t periodicLuxTimer_id;

TSL2772 luxSensor;

void LuxTask(void *argument) {
	SensorPacket *packet = NULL;
	uint32_t flags;
	uint32_t timeLeftForSample = 0;

	osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);
	if (!luxSensor.begin(TSL2772_I2CADDR, &hi2c1)) {
		osDelay(100);
	}
	luxSensor.powerOn(true);

	luxSensor.setATIME(TSL2722_INTEGRATIONTIME_101MS);
	luxSensor.setAGAIN(TSL2722_GAIN_8X);

	luxSensor.enableALS(true);

	header.payloadLength = MAX_LUX_SAMPLES_PACKET * sizeof(luxSample);
	header.reserved[0] = (uint8_t) TSL2722_INTEGRATIONTIME_101MS;
	header.reserved[1] = (uint8_t) TSL2722_GAIN_8X;

	uint16_t luxIdx = 0;
	uint32_t luxID = 0;

	uint32_t luxSample;

	osSemaphoreRelease(messageI2C1_LockHandle);
	periodicLuxTimer_id = osTimerNew(triggerLuxSample, osTimerPeriodic,
			NULL, NULL);
	osTimerStart(periodicLuxTimer_id, LUX_SAMPLE_SYS_PERIOD_MS);

	while (1) {
		flags = osThreadFlagsWait(GRAB_SAMPLE_BIT | TERMINATE_THREAD_BIT,
		osFlagsWaitAny, osWaitForever);

		if ((flags & GRAB_SAMPLE_BIT) == GRAB_SAMPLE_BIT) {

			timeLeftForSample = HAL_GetTick() - timeLeftForSample;
			if(timeLeftForSample < LUX_SAMPLE_SYS_PERIOD_MS){
				osDelay(timeLeftForSample);
			}

			osSemaphoreAcquire(messageI2C1_LockHandle, osWaitForever);
			luxData[luxIdx].lux = luxSensor.getLux();
			luxData[luxIdx].timestamp = HAL_GetTick();
			osSemaphoreRelease(messageI2C1_LockHandle);

			luxIdx++;

			if (luxIdx >= MAX_LUX_SAMPLES_PACKET) {
				header.packetType = LUX;
				header.packetID = luxID;
				header.msFromStart = HAL_GetTick();
				packet = grabPacket();
				if (packet != NULL) {
					memcpy(&(packet->header), &header, sizeof(PacketHeader));
					memcpy(packet->payload, luxData, header.payloadLength);
					queueUpPacket(packet);
				}
				luxID++;
				luxIdx = 0;
			}

			timeLeftForSample = HAL_GetTick();
		}

		if ((flags & TERMINATE_THREAD_BIT) == TERMINATE_THREAD_BIT) {
			osTimerDelete(periodicLuxTimer_id);
			break;
		}
	}
}

static void triggerLuxSample(void *argument) {
	osThreadFlagsSet(luxTaskHandle, GRAB_SAMPLE_BIT);
}
