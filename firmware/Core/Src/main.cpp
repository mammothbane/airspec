/* USER CODE BEGIN Header */
/**
 ******************************************************************************
 * @file           : main.c
 * @brief          : Main program body
 ******************************************************************************
 * @attention
 *
 * Copyright (c) 2022 STMicroelectronics.
 * All rights reserved.
 *
 * This software is licensed under terms that can be found in the LICENSE file
 * in the root directory of this software component.
 * If no LICENSE file comes with this software, it is provided AS-IS.
 *
 ******************************************************************************
 */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "cmsis_os.h"
#include "adc.h"
#include "dma.h"
#include "i2c.h"
#include "ipcc.h"
#include "rf.h"
#include "rtc.h"
#include "sai.h"
#include "spi.h"
#include "tim.h"
#include "usb_device.h"
#include "gpio.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include "lp5523.h"
#include "fram.h"
#include "circular_buffer.h"
#include "captivate_config.h"
/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */

/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */
/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/

/* USER CODE BEGIN PV */
/* Definitions for lightsComplexQueue */
#ifdef KEEP_CUBE_INIT_ORDER
/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
void PeriphCommonClock_Config(void);
void MX_FREERTOS_Init(void);
/* USER CODE BEGIN PFP */
#else
void PeriphCommonClock_Config(void);
void MX_FREERTOS_Init(void);
extern "C" void SystemClock_Config(void);
#endif

/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */
volatile unsigned long ulHighFrequencyTimerTicks;
volatile uint8_t sensorThreadsRunning = 0;
void epoch_to_date_time(unsigned int epoch);
void reset_DFU_trigger(void);
void RTC_FromEpoch(uint32_t epoch, RTC_TimeTypeDef *time,
		RTC_DateTypeDef *date);
//__attribute__((section(".noinit"))) volatile int my_non_initialized_integer;

struct SensorConfig sensorConfig;
/* USER CODE END 0 */

/**
 * @brief  The application entry point.
 * @retval int
 */
int main(void) {
	/* USER CODE BEGIN 1 */
	reset_DFU_trigger();
	/* USER CODE END 1 */

	/* MCU Configuration--------------------------------------------------------*/

	/* Reset of all peripherals, Initializes the Flash interface and the Systick. */
	HAL_Init();
	/* Config code for STM32_WPAN (HSE Tuning must be done before system clock configuration) */
	MX_APPE_Config();

	HAL_Delay(1000);

	/* USER CODE BEGIN Init */

	/* USER CODE END Init */

	/* Configure the system clock */
	SystemClock_Config();

	/* Configure the peripherals common clocks */
	PeriphCommonClock_Config();

	/* IPCC initialisation */
	MX_IPCC_Init();

	/* USER CODE BEGIN SysInit */
#ifdef KEEP_CUBE_INIT_ORDER
  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_ADC1_Init();
  MX_I2C1_Init();
  MX_I2C3_Init();
  MX_RF_Init();
  MX_RTC_Init();
  MX_SAI1_Init();
  MX_SPI1_Init();
  MX_SPI2_Init();
  MX_TIM16_Init();
  MX_DMA_Init();
  MX_TIM2_Init();
  MX_USB_Device_Init();
  MX_TIM17_Init();
  /* USER CODE BEGIN 2 */
#else
	MX_GPIO_Init();
	MX_DMA_Init();

	MX_RF_Init();
	MX_RTC_Init();
	MX_SAI1_Init();
	MX_SPI1_Init();
	MX_SPI2_Init();
	MX_TIM16_Init();
	MX_TIM2_Init();
	MX_USB_Device_Init();
	MX_TIM17_Init();
	MX_ADC1_Init();
	MX_I2C1_Init();
	MX_I2C3_Init();
	extMemInit();
//  HAL_Delay(500); // needed or wireless stack wont init properly (delay duration can probably be reduced)

//grab SensorConfig from FRAM
	uint32_t isSystemFresh;
//	while(1){
	extMemGetData(START_ADDR, (uint8_t*) &isSystemFresh, 4);
//	HAL_Delay(1000);
//	}
	if (isSystemFresh != 0xDEADBEAF) {
//	if(1){
		//initialize fresh system
		sensorConfig.systemRunState = 1;
		sensorConfig.uuid = LL_FLASH_GetUDN();
		sensorConfig.firmware_version = 1;

		sensorConfig.luxSensor.enable = 1;
		sensorConfig.luxSensor.gain = 1;
		sensorConfig.luxSensor.integration_time = 219;
		sensorConfig.luxSensor.sample_period = 1000;

		sensorConfig.gasSensor.enable = 1;
		sensorConfig.gasSensor.sample_period = 5000;

		sensorConfig.inertialSensor.enable = 0;
		sensorConfig.inertialSensor.gyroLPFEn = 1;
		sensorConfig.inertialSensor.gyroLPFCutoff = 0;
		sensorConfig.inertialSensor.gyroRange = 3;
		sensorConfig.inertialSensor.gyroSampleRate = 1;
		sensorConfig.inertialSensor.accelLPFEn = 1;
		sensorConfig.inertialSensor.accelLPFCutoff = 0;
		sensorConfig.inertialSensor.accelRange = 3;
		sensorConfig.inertialSensor.accelSampleRate = 1;

		sensorConfig.colorSensor.enable = 1;
		sensorConfig.colorSensor.integrationTime = 100;
		sensorConfig.colorSensor.integrationStep = 999;
		sensorConfig.colorSensor.gain = 9;
		sensorConfig.colorSensor.sample_period = 5000;

		sensorConfig.thermopileSensor.enable = 1;
		sensorConfig.thermopileSensor.sample_period = 1000;

		sensorConfig.blinkSensor.enable = 0;
		sensorConfig.blinkSensor.daylightCompensationEn = 1;
		sensorConfig.blinkSensor.daylightCompensationUpperThresh = 7;
		sensorConfig.blinkSensor.daylightCompensationLowerThresh = 235;
		sensorConfig.blinkSensor.sample_frequency = 1000;

		sensorConfig.micSensor.enable = 0;
		sensorConfig.micSensor.sample_frequency = 44100;

		sensorConfig.humiditySensor.enable = 1;
		sensorConfig.humiditySensor.precisionLevel = 0;
		sensorConfig.humiditySensor.heaterSetting = 0;
		sensorConfig.humiditySensor.sample_period = 5000;


		extMemWriteData(START_ADDR + 4, (uint8_t*) &sensorConfig,
				sizeof(struct SensorConfig));
		updateSystemConfig_BLE(&sensorConfig);

		isSystemFresh = 0xDEADBEAF;
		extMemWriteData(START_ADDR, (uint8_t*) &isSystemFresh, 4);
	} else {
		extMemGetData(START_ADDR + 4, (uint8_t*) &sensorConfig,
				sizeof(struct SensorConfig));
		updateSystemConfig_BLE(&sensorConfig);
	}

	/* Init scheduler */
	osKernelInitialize(); /* Call init function for freertos objects (in freertos.c) */
	MX_FREERTOS_Init();
	/* Start scheduler */
	MX_APPE_Init();
	osKernelStart();
#endif
#ifdef KEEP_CUBE_INIT_ORDER
//  while(1){
////	  HAL_Delay(5000);
////	  extMemChipSelectPin(true);
////	  extMemWriteProtectPin(true);
////	  extMemWriteData(BME_CONFIG_ADDR, temp_data, BME_CONFIG_SIZE);
//	  extMemGetData(BME_CONFIG_ADDR, temp_data2, BME_CONFIG_SIZE);
//	  HAL_Delay(5000);
////	  extMemChipSelectPin(false);
////	  extMemWriteProtectPin(false);
//  }

//  uint8_t data[1000];
//  HAL_SAI_Receive(&hsai_BlockA1, data, 500, 100);
//  while(1);

  /* USER CODE END 2 */

  /* Init scheduler */
  osKernelInitialize();  /* Call init function for freertos objects (in freertos.c) */
//  MX_FREERTOS_Init();
  /* Start scheduler */
  MX_APPE_Init();
  osKernelStart();

  /* We should never get here as control is now taken by the scheduler */
  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
#endif
//  uint8_t testData[100];
//  uint8_t testDataRX[100] = {0};
//  for(int i=0;i<100;i++) testData[i] = i;
//
//
//  extMemWriteData(0x1, testData, 100);
//  extMemGetData(0x1, testDataRX, 100);
//
//  CircularBuffer* backupBufferTest;
//  backupBufferTest = allocateBackupBuffer();
//
//  SensorPacket packetToSend[50];
//  for(int i = 0; i<50; i++){
//	  packetToSend[i].header.packetID = i;
//	  pushPacketToFRAM(backupBufferTest, &packetToSend[i]);
//
//  }
//  SensorPacket packetToReceive[50];
//  for(int i = 0; i<50; i++){
//	  getPacketFromFRAM(backupBufferTest, &packetToReceive[i]);
//  }
//  getPacketFromFRAM(backupBuffer, packetToSend);
//  pushPacketToFRAM(backupBuffer, packetToSend);

	while (1) {
//		HAL_RTC_GetTime(&hrtc, &timeTest, RTC_FORMAT_BIN);
//		HAL_Delay(1000);
		/* USER CODE END WHILE */

		/* USER CODE BEGIN 3 */
	}
	/* USER CODE END 3 */
}

/**
 * @brief System Clock Configuration
 * @retval None
 */
void SystemClock_Config(void) {
	RCC_OscInitTypeDef RCC_OscInitStruct = { 0 };
	RCC_ClkInitTypeDef RCC_ClkInitStruct = { 0 };

	/** Configure LSE Drive Capability
	 */
	HAL_PWR_EnableBkUpAccess();
	__HAL_RCC_LSEDRIVE_CONFIG(RCC_LSEDRIVE_LOW);
	/** Configure the main internal regulator output voltage
	 */
	__HAL_PWR_VOLTAGESCALING_CONFIG(PWR_REGULATOR_VOLTAGE_SCALE1);
	/** Initializes the RCC Oscillators according to the specified parameters
	 * in the RCC_OscInitTypeDef structure.
	 */
	RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSI
			| RCC_OSCILLATORTYPE_HSE | RCC_OSCILLATORTYPE_LSE
			| RCC_OSCILLATORTYPE_MSI;
	RCC_OscInitStruct.HSEState = RCC_HSE_ON;
	RCC_OscInitStruct.LSEState = RCC_LSE_ON;
	RCC_OscInitStruct.HSIState = RCC_HSI_ON;
	RCC_OscInitStruct.MSIState = RCC_MSI_ON;
	RCC_OscInitStruct.HSICalibrationValue = RCC_HSICALIBRATION_DEFAULT;
	RCC_OscInitStruct.MSICalibrationValue = RCC_MSICALIBRATION_DEFAULT;
	RCC_OscInitStruct.MSIClockRange = RCC_MSIRANGE_8;
	RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
	RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_MSI;
	RCC_OscInitStruct.PLL.PLLM = RCC_PLLM_DIV2;
	RCC_OscInitStruct.PLL.PLLN = 32;
	RCC_OscInitStruct.PLL.PLLP = RCC_PLLP_DIV2;
	RCC_OscInitStruct.PLL.PLLR = RCC_PLLR_DIV8;
	RCC_OscInitStruct.PLL.PLLQ = RCC_PLLQ_DIV2;
	if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK) {
		Error_Handler();
	}
	/** Configure the SYSCLKSource, HCLK, PCLK1 and PCLK2 clocks dividers
	 */
	RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK4 | RCC_CLOCKTYPE_HCLK2
			| RCC_CLOCKTYPE_HCLK | RCC_CLOCKTYPE_SYSCLK | RCC_CLOCKTYPE_PCLK1
			| RCC_CLOCKTYPE_PCLK2;
	RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
	RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV2;
	RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV1;
	RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;
	RCC_ClkInitStruct.AHBCLK2Divider = RCC_SYSCLK_DIV1;
	RCC_ClkInitStruct.AHBCLK4Divider = RCC_SYSCLK_DIV1;

	if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_1) != HAL_OK) {
		Error_Handler();
	}
	/** Enable MSI Auto calibration
	 */
	HAL_RCCEx_EnableMSIPLLMode();
}

/**
 * @brief Peripherals Common Clock Configuration
 * @retval None
 */
void PeriphCommonClock_Config(void) {
	RCC_PeriphCLKInitTypeDef PeriphClkInitStruct = { 0 };

	/** Initializes the peripherals clock
	 */
	PeriphClkInitStruct.PeriphClockSelection = RCC_PERIPHCLK_SMPS
			| RCC_PERIPHCLK_RFWAKEUP | RCC_PERIPHCLK_SAI1 | RCC_PERIPHCLK_USB
			| RCC_PERIPHCLK_ADC;
	PeriphClkInitStruct.PLLSAI1.PLLN = 12;
	PeriphClkInitStruct.PLLSAI1.PLLP = RCC_PLLP_DIV2;
	PeriphClkInitStruct.PLLSAI1.PLLQ = RCC_PLLQ_DIV2;
	PeriphClkInitStruct.PLLSAI1.PLLR = RCC_PLLR_DIV2;
	PeriphClkInitStruct.PLLSAI1.PLLSAI1ClockOut = RCC_PLLSAI1_SAI1CLK
			| RCC_PLLSAI1_USBCLK | RCC_PLLSAI1_ADCCLK;
	PeriphClkInitStruct.Sai1ClockSelection = RCC_SAI1CLKSOURCE_PLLSAI1;
	PeriphClkInitStruct.UsbClockSelection = RCC_USBCLKSOURCE_PLLSAI1;
	PeriphClkInitStruct.AdcClockSelection = RCC_ADCCLKSOURCE_PLLSAI1;
	PeriphClkInitStruct.RFWakeUpClockSelection = RCC_RFWKPCLKSOURCE_LSE;
	PeriphClkInitStruct.SmpsClockSelection = RCC_SMPSCLKSOURCE_HSI;
	PeriphClkInitStruct.SmpsDivSelection = RCC_SMPSCLKDIV_RANGE1;

	if (HAL_RCCEx_PeriphCLKConfig(&PeriphClkInitStruct) != HAL_OK) {
		Error_Handler();
	}
	/* USER CODE BEGIN Smps */

	/* USER CODE END Smps */
}

/* USER CODE BEGIN 4 */
void reset_DFU_trigger(void) {
	*((int*) 0x2000020c) = 0xCAFEFEED; // Reset our trigger
}

/**
 * @brief This function handles TIM1 trigger and commutation interrupts and TIM11 global interrupt.
 */

void configureTimerForRunTimeStats(void) {
	ulHighFrequencyTimerTicks = 0;
	HAL_TIM_Base_Start_IT(&htim17);
}

unsigned long getRunTimeCounterValue(void) {
	return ulHighFrequencyTimerTicks;
}

/* USER CODE END 4 */

/**
 * @brief  Period elapsed callback in non blocking mode
 * @note   This function is called  when TIM1 interrupt took place, inside
 * HAL_TIM_IRQHandler(). It makes a direct call to HAL_IncTick() to increment
 * a global variable "uwTick" used as application time base.
 * @param  htim : TIM handle
 * @retval None
 */
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim) {
	/* USER CODE BEGIN Callback 0 */

	/* USER CODE END Callback 0 */
	if (htim->Instance == TIM1) {
		HAL_IncTick();
	}
	/* USER CODE BEGIN Callback 1 */

	/* USER CODE END Callback 1 */
}

/**
 * @brief  This function is executed in case of error occurrence.
 * @retval None
 */
void Error_Handler(void) {
	/* USER CODE BEGIN Error_Handler_Debug */
	/* User can add his own implementation to report the HAL error return state */
	__disable_irq();
	while (1) {
	}
	/* USER CODE END Error_Handler_Debug */
}

#ifdef  USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
  /* User can add his own implementation to report the file name and line number,
     ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */
