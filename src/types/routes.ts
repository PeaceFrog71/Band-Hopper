// Pre-Calculated Route Database
// All routes that cross the Aaron Halo with exit distances for each band

import { BANDS, type AaronHaloBand } from './bands';

export interface BandExit {
  bandId: number;
  distanceFromStanton: number;   // km - Stanton marker method
  distanceToDestination: number; // km - remaining distance to destination
  distanceFromStart: number;     // km - how far traveled from start
}

/**
 * BandExit with calculated exit width (margin for error)
 * Width is the gap between this band's exit and adjacent bands
 */
export interface BandExitWithWidth extends BandExit {
  exitWidth: number;             // km - margin for error when exiting at this band
  gapToPreviousBand?: number;    // km - gap to previous band (undefined for Band 1)
  gapToNextBand?: number;        // km - gap to next band (undefined for Band 10)
}

export interface PreCalculatedRoute {
  id: string;                    // 'arc-l1_to_hur-l5'
  startId: string;
  destinationId: string;
  crossesHalo: boolean;
  bandExits: BandExit[];
}

/**
 * Pre-Calculated Route Database
 *
 * Source: CaptSheppard's Aaron Halo Travel Routes (cstone.space)
 * Version: 3.19.1-LIVE
 *
 * Exit distances (distanceToDestination) are measured in-game values
 * representing the remaining distance to destination when exiting QT
 * at each band's peak density point.
 *
 * Note: distanceFromStanton values are the band's peak density distance.
 * distanceFromStart is a pre-calculated value for how far has been traveled from
 * the start; the implied total route distance at any band is
 * distanceFromStart + distanceToDestination.
 *
 * Only routes involving ARC-L1 or ARC-L2 are currently verified from source charts.
 */
export const ROUTES: PreCalculatedRoute[] = [
  // ==================== ARC-L1 Routes ====================
  // Source: ARC-L1_3.19.1-LIVE.png & Band Jump Distances.csv
  {
    id: 'arc-l1_to_cru-l4',
    startId: 'arc-l1',
    destinationId: 'cru-l4',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 12_744_803, distanceFromStart: 8_256_962 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 13_157_847, distanceFromStart: 7_843_918 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 13_510_150, distanceFromStart: 7_491_615 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 13_934_165, distanceFromStart: 7_067_600 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 14_292_609, distanceFromStart: 6_709_156 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 14_637_246, distanceFromStart: 6_364_519 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 15_058_764, distanceFromStart: 5_943_001 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 15_524_706, distanceFromStart: 5_477_059 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 15_938_061, distanceFromStart: 5_063_704 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 16_188_952, distanceFromStart: 4_812_813 }
    ]
  },
  {
    id: 'arc-l1_to_crusader',
    startId: 'arc-l1',
    destinationId: 'crusader',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 32_477_533, distanceFromStart: 9_173_467 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 32_661_536, distanceFromStart: 8_989_464 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 32_824_869, distanceFromStart: 8_826_131 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 33_028_998, distanceFromStart: 8_622_002 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 33_207_787, distanceFromStart: 8_443_213 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 33_384_898, distanceFromStart: 8_266_102 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 33_608_233, distanceFromStart: 8_042_767 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 33_863_390, distanceFromStart: 7_787_610 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 34_096_746, distanceFromStart: 7_554_254 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 34_241_481, distanceFromStart: 7_409_519 }
    ]
  },
  {
    id: 'arc-l1_to_cru-l5',
    startId: 'arc-l1',
    destinationId: 'cru-l5',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 38_842_891, distanceFromStart: 6_325_109 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 38_997_920, distanceFromStart: 6_170_080 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 39_135_946, distanceFromStart: 6_032_054 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 39_308_978, distanceFromStart: 5_859_022 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 39_461_005, distanceFromStart: 5_706_995 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 39_612_032, distanceFromStart: 5_555_968 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 39_803_066, distanceFromStart: 5_364_934 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 40_022_104, distanceFromStart: 5_145_896 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 40_223_137, distanceFromStart: 4_944_863 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 40_348_158, distanceFromStart: 4_819_842 }
    ]
  },
  {
    id: 'arc-l1_to_hurston',
    startId: 'arc-l1',
    destinationId: 'hurston',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 12_680_614, distanceFromStart: 7_630_386 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 12_881_847, distanceFromStart: 7_429_153 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 13_060_115, distanceFromStart: 7_250_885 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 13_282_453, distanceFromStart: 7_028_547 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 13_476_792, distanceFromStart: 6_834_208 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 13_668_952, distanceFromStart: 6_642_048 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 13_910_778, distanceFromStart: 6_400_222 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 14_186_429, distanceFromStart: 6_124_571 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 14_437_964, distanceFromStart: 5_873_036 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 14_593_715, distanceFromStart: 5_717_285 }
    ]
  },
  {
    id: 'arc-l1_to_cru-l3',
    startId: 'arc-l1',
    destinationId: 'cru-l3',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 10_989_473, distanceFromStart: 11_722_527 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 11_446_936, distanceFromStart: 11_265_064 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 11_832_950, distanceFromStart: 10_879_050 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 12_293_296, distanceFromStart: 10_418_704 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 12_679_383, distanceFromStart: 10_032_617 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 13_048_324, distanceFromStart: 9_663_676 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 13_496_942, distanceFromStart: 9_215_058 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 13_989_945, distanceFromStart: 8_722_055 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 14_425_115, distanceFromStart: 8_286_885 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 14_688_359, distanceFromStart: 8_023_641 }
    ]
  },

  // ==================== ARC-L2 Routes ====================
  // Source: Band Jump Distances.csv
  {
    id: 'arc-l2_to_cru-l4',
    startId: 'arc-l2',
    destinationId: 'cru-l4',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 8_282_791, distanceFromStart: 20_717_209 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 8_819_520, distanceFromStart: 20_180_480 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 9_261_296, distanceFromStart: 19_738_704 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 9_384_727, distanceFromStart: 19_615_273 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 10_213_088, distanceFromStart: 18_786_912 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 10_619_534, distanceFromStart: 18_380_466 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 11_108_954, distanceFromStart: 17_891_046 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 11_641_854, distanceFromStart: 17_358_146 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 12_109_387, distanceFromStart: 16_890_613 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 12_389_524, distanceFromStart: 16_610_476 }
    ]
  },
  {
    id: 'arc-l2_to_crusader',
    startId: 'arc-l2',
    destinationId: 'crusader',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 29_835_087, distanceFromStart: 11_164_913 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 30_020_198, distanceFromStart: 10_979_802 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 30_183_988, distanceFromStart: 10_816_012 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 30_416_953, distanceFromStart: 10_583_047 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 32_090_899, distanceFromStart: 8_909_101 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 32_273_873, distanceFromStart: 8_726_127 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 32_503_681, distanceFromStart: 8_496_319 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 32_766_911, distanceFromStart: 8_233_089 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 33_005_926, distanceFromStart: 7_994_074 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 33_155_143, distanceFromStart: 7_844_857 }
    ]
  },
  {
    id: 'arc-l2_to_hur-l5',
    startId: 'arc-l2',
    destinationId: 'hur-l5',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 7_043_371, distanceFromStart: 16_956_629 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 7_201_232, distanceFromStart: 16_798_768 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 7_341_201, distanceFromStart: 16_658_799 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 7_536_360, distanceFromStart: 16_463_640 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 7_671_815, distanceFromStart: 16_328_185 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 7_825_770, distanceFromStart: 16_174_230 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 8_019_481, distanceFromStart: 15_980_519 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 8_242_037, distanceFromStart: 15_757_963 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 8_446_266, distanceFromStart: 15_553_734 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 8_573_334, distanceFromStart: 15_426_666 }
    ]
  },
  {
    id: 'arc-l2_to_hurston',
    startId: 'arc-l2',
    destinationId: 'hurston',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 11_591_569, distanceFromStart: 13_408_431 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 11_789_853, distanceFromStart: 13_210_147 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 11_964_198, distanceFromStart: 13_035_802 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 12_205_207, distanceFromStart: 12_794_793 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 12_373_993, distanceFromStart: 12_626_007 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 12_562_456, distanceFromStart: 12_437_544 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 12_801_159, distanceFromStart: 12_198_841 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 13_072_050, distanceFromStart: 11_927_950 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 13_320_467, distanceFromStart: 11_679_533 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 13_473_594, distanceFromStart: 11_526_406 }
    ]
  },

  // ==================== CRUSADER Routes (Verified) ====================
  // Source: Band Jump Distances.csv
  {
    id: 'crusader_to_arc-l1',
    startId: 'crusader',
    destinationId: 'arc-l1',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 7_173_358, distanceFromStart: 34_477_642 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 6_989_355, distanceFromStart: 34_661_645 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 6_826_022, distanceFromStart: 34_824_978 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 6_621_894, distanceFromStart: 35_029_106 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 6_443_104, distanceFromStart: 35_207_896 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 6_265_993, distanceFromStart: 35_385_007 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 6_042_658, distanceFromStart: 35_608_342 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 5_787_501, distanceFromStart: 35_863_499 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 5_554_145, distanceFromStart: 36_096_855 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 5_409_410, distanceFromStart: 36_241_590 }
    ]
  },
  {
    id: 'crusader_to_arc-l2',
    startId: 'crusader',
    destinationId: 'arc-l2',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 13_643_681, distanceFromStart: 27_356_319 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 13_458_570, distanceFromStart: 27_541_430 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 13_294_910, distanceFromStart: 27_705_090 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 13_061_778, distanceFromStart: 27_938_222 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 12_898_644, distanceFromStart: 28_101_356 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 12_715_670, distanceFromStart: 28_284_330 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 12_485_862, distanceFromStart: 28_514_138 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 12_222_632, distanceFromStart: 28_777_368 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 11_983_618, distanceFromStart: 29_016_382 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 11_834_401, distanceFromStart: 29_165_599 }
    ]
  },

  // ==================== CRU-L3 Routes ====================
  {
    id: 'cru-l3_to_arc-l1',
    startId: 'cru-l3',
    destinationId: 'arc-l1',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 11_722_536, distanceFromStart: 10_989_464 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 11_265_073, distanceFromStart: 11_446_927 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 10_879_059, distanceFromStart: 11_832_941 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 10_418_713, distanceFromStart: 12_293_287 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 10_032_626, distanceFromStart: 12_679_374 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 9_663_684, distanceFromStart: 13_048_316 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 9_215_066, distanceFromStart: 13_496_934 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 8_722_063, distanceFromStart: 13_989_937 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 8_286_894, distanceFromStart: 14_425_106 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 8_023_649, distanceFromStart: 14_688_351 }
    ]
  },

  // ==================== CRU-L4 Routes ====================
  {
    id: 'cru-l4_to_arc-l1',
    startId: 'cru-l4',
    destinationId: 'arc-l1',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 11_256_961, distanceFromStart: 9_743_039 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 10_843_917, distanceFromStart: 10_156_083 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 10_491_614, distanceFromStart: 10_508_386 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 10_067_599, distanceFromStart: 10_932_401 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 9_709_155, distanceFromStart: 11_290_845 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 9_364_518, distanceFromStart: 11_635_482 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 8_943_000, distanceFromStart: 12_057_000 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 8_477_058, distanceFromStart: 12_522_942 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 8_063_703, distanceFromStart: 12_936_297 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 7_812_812, distanceFromStart: 13_187_188 }
    ]
  },
  {
    id: 'cru-l4_to_arc-l2',
    startId: 'cru-l4',
    destinationId: 'arc-l2',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 20_117_293, distanceFromStart: 8_882_707 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 19_581_064, distanceFromStart: 9_418_936 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 19_139_288, distanceFromStart: 9_860_712 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 18_565_856, distanceFromStart: 10_434_144 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 18_187_496, distanceFromStart: 10_812_504 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 17_781_049, distanceFromStart: 11_218_951 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 17_291_629, distanceFromStart: 11_708_371 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 16_758_730, distanceFromStart: 12_241_270 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 16_291_196, distanceFromStart: 12_708_804 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 16_011_059, distanceFromStart: 12_988_941 }
    ]
  },

  // ==================== CRU-L5 Routes ====================
  {
    id: 'cru-l5_to_arc-l1',
    startId: 'cru-l5',
    destinationId: 'arc-l1',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 6_324_828, distanceFromStart: 38_843_172 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 6_169_798, distanceFromStart: 38_998_202 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 6_031_773, distanceFromStart: 39_136_227 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 5_858_741, distanceFromStart: 39_309_259 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 5_706_713, distanceFromStart: 39_461_287 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 5_555_686, distanceFromStart: 39_612_314 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 5_364_653, distanceFromStart: 39_803_347 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 5_145_615, distanceFromStart: 40_022_385 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 4_944_581, distanceFromStart: 40_223_419 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 4_819_561, distanceFromStart: 40_348_439 }
    ]
  },

  // ==================== HURSTON Routes ====================
  {
    id: 'hurston_to_arc-l1',
    startId: 'hurston',
    destinationId: 'arc-l1',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 7_630_180, distanceFromStart: 12_680_820 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 7_428_947, distanceFromStart: 12_882_053 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 7_250_679, distanceFromStart: 13_060_321 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 7_028_341, distanceFromStart: 13_282_659 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 6_834_002, distanceFromStart: 13_476_998 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 6_641_842, distanceFromStart: 13_669_158 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 6_400_015, distanceFromStart: 13_910_985 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 6_124_364, distanceFromStart: 14_186_636 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 5_872_830, distanceFromStart: 14_438_170 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 5_717_079, distanceFromStart: 14_593_921 }
    ]
  },
  {
    id: 'hurston_to_arc-l2',
    startId: 'hurston',
    destinationId: 'arc-l2',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 13_932_455, distanceFromStart: 11_067_545 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 13_734_171, distanceFromStart: 11_265_829 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 13_559_263, distanceFromStart: 11_440_737 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 13_318_817, distanceFromStart: 11_681_183 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 13_150_031, distanceFromStart: 11_849_969 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 12_961_568, distanceFromStart: 12_038_432 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 12_722_865, distanceFromStart: 12_277_135 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 12_451_974, distanceFromStart: 12_548_026 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 12_203_557, distanceFromStart: 12_796_443 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 12_050_430, distanceFromStart: 12_949_570 }
    ]
  },

  // ==================== HUR-L5 Routes ====================
  {
    id: 'hur-l5_to_arc-l2',
    startId: 'hur-l5',
    destinationId: 'arc-l2',
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 12_240_389, distanceFromStart: 11_759_611 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 12_082_529, distanceFromStart: 11_917_471 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 11_942_560, distanceFromStart: 12_057_440 },
      { bandId: 4, distanceFromStanton: 20_179_000, distanceToDestination: 11_747_400, distanceFromStart: 12_252_600 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 11_611_945, distanceFromStart: 12_388_055 },
      { bandId: 6, distanceFromStanton: 20_540_000, distanceToDestination: 11_457_990, distanceFromStart: 12_542_010 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 11_264_279, distanceFromStart: 12_735_721 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 11_041_724, distanceFromStart: 12_958_276 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 10_837_495, distanceFromStart: 13_162_505 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 10_710_426, distanceFromStart: 13_289_574 }
    ]
  }
];

/**
 * Get route by start and destination IDs
 */
export function getRoute(startId: string, destinationId: string): PreCalculatedRoute | null {
  return ROUTES.find(r =>
    r.startId === startId && r.destinationId === destinationId
  ) || null;
}

/**
 * Get all routes from a starting location
 */
export function getRoutesFromLocation(startId: string): PreCalculatedRoute[] {
  return ROUTES.filter(r => r.startId === startId);
}

/**
 * Get all routes to a destination
 */
export function getRoutesToLocation(destinationId: string): PreCalculatedRoute[] {
  return ROUTES.filter(r => r.destinationId === destinationId);
}

/**
 * Get band exit data for a specific route and band
 */
export function getBandExit(
  startId: string,
  destinationId: string,
  bandId: number
): BandExit | null {
  const route = getRoute(startId, destinationId);
  if (!route) return null;

  return route.bandExits.find(be => be.bandId === bandId) || null;
}

/**
 * Get all available start locations that have routes
 */
export function getAvailableStartLocations(): string[] {
  const startIds = new Set<string>();
  for (const route of ROUTES) {
    startIds.add(route.startId);
  }
  return Array.from(startIds);
}

/**
 * Get available destinations from a given start location
 */
export function getAvailableDestinations(startId: string): string[] {
  return getRoutesFromLocation(startId).map(r => r.destinationId);
}

/**
 * Check if a route exists between two locations
 */
export function routeExists(startId: string, destinationId: string): boolean {
  return getRoute(startId, destinationId) !== null;
}

/**
 * Get band information with exit data for display
 */
export function getRouteWithBandInfo(
  startId: string,
  destinationId: string
): {
  route: PreCalculatedRoute;
  bandDetails: Array<{
    band: AaronHaloBand;
    exit: BandExit;
  }>;
} | null {
  const route = getRoute(startId, destinationId);
  if (!route) return null;

  const bandDetails = route.bandExits.map(exit => {
    const band = BANDS.find(b => b.id === exit.bandId);
    if (!band) throw new Error(`Band ${exit.bandId} not found`);
    return { band, exit };
  });

  return { route, bandDetails };
}

/**
 * Calculate exit widths for all bands on a route
 * Width = gap between this band's exit distance and adjacent bands
 * A wider gap means more margin for error when exiting QT
 */
export function calculateExitWidths(bandExits: BandExit[]): BandExitWithWidth[] {
  // Sort by band ID to ensure correct order
  const sorted = [...bandExits].sort((a, b) => a.bandId - b.bandId);

  return sorted.map((exit, index) => {
    const prevExit = sorted[index - 1];
    const nextExit = sorted[index + 1];

    // Calculate gaps using distanceToDestination (what pilot sees)
    const gapToPrevious = prevExit
      ? Math.abs(exit.distanceToDestination - prevExit.distanceToDestination)
      : undefined;
    const gapToNext = nextExit
      ? Math.abs(nextExit.distanceToDestination - exit.distanceToDestination)
      : undefined;

    // Exit width is the minimum gap (limiting factor for stopping accuracy)
    // For edge bands (1 and 10), use the only available gap
    let exitWidth: number;
    if (gapToPrevious !== undefined && gapToNext !== undefined) {
      exitWidth = Math.min(gapToPrevious, gapToNext);
    } else {
      exitWidth = gapToPrevious ?? gapToNext ?? 0;
    }

    return {
      ...exit,
      gapToPreviousBand: gapToPrevious,
      gapToNextBand: gapToNext,
      exitWidth
    };
  });
}

/**
 * Get exit width for a specific band on a route
 */
export function getExitWidth(
  startId: string,
  destinationId: string,
  bandId: number
): number | null {
  const route = getRoute(startId, destinationId);
  if (!route) return null;

  const withWidths = calculateExitWidths(route.bandExits);
  const bandExit = withWidths.find(be => be.bandId === bandId);

  return bandExit?.exitWidth ?? null;
}

/**
 * Get available destinations from a start location, sorted by exit width for a specific band
 * Returns destinations with widest exit margin first (easiest to stop at)
 */
export function getDestinationsByBandWidth(
  startId: string,
  bandId: number
): Array<{
  destinationId: string;
  exitDistance: number;
  exitWidth: number;
  gapToPreviousBand?: number;
  gapToNextBand?: number;
}> {
  const routes = getRoutesFromLocation(startId);

  const results = routes
    .map(route => {
      const withWidths = calculateExitWidths(route.bandExits);
      const bandExit = withWidths.find(be => be.bandId === bandId);

      if (!bandExit) return null;

      return {
        destinationId: route.destinationId,
        exitDistance: bandExit.distanceToDestination,
        exitWidth: bandExit.exitWidth,
        gapToPreviousBand: bandExit.gapToPreviousBand,
        gapToNextBand: bandExit.gapToNextBand
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  // Sort by exit width descending (widest first = easiest)
  return results.sort((a, b) => b.exitWidth - a.exitWidth);
}
