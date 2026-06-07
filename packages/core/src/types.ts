/**
 * Core Types and Interfaces for Blast Drill Designer
 */

export interface RockProperties {
  density: number; // kg/m³
  compressiveStrength: number; // MPa
  tensileStrength: number; // MPa
  youngModulus: number; // GPa
  poissonsRatio: number;
  rockmass: 'excellent' | 'good' | 'fair' | 'poor' | 'very poor';
  rqd: number; // Rock Quality Designation (0-100)
}

export interface ExplosiveProperties {
  type: 'ANFO' | 'Dynamite' | 'RDX' | 'PETN' | 'Emulsion';
  density: number; // kg/m³
  vod: number; // Velocity of Detonation (m/s)
  pressureCapability: number; // MPa
  energyDensity: number; // MJ/kg
  sensitivityFactor: number;
}

export interface BlastDesignParameters {
  holeDepth: number; // m
  holeDiameter: number; // mm
  spacing: number; // m
  burden: number; // m
  subdrilling: number; // m
  stemming: number; // m
  chargePerHole: number; // kg
  sequenceDelay: number; // ms
  numberOfHoles: number;
  geometry: 'linear' | 'grid' | 'circular' | 'fan';
}

export interface VibrationalParameters {
  ppv: number; // Peak Particle Velocity (mm/s)
  frequency: number; // Hz
  distance: number; // m
  attenuation: number;
  riskLevel: 'safe' | 'acceptable' | 'unsafe';
}

export interface FragmentationAnalysis {
  d80: number; // 80% passing size (mm)
  d50: number; // 50% passing size (mm)
  uniformityIndex: number;
  finesFraction: number; // % < 10mm
  coarsesFraction: number; // % > 250mm
  averageFragmentSize: number; // mm
  distribution: 'uniform' | 'bimodal' | 'poor';
}

export interface OptimizationResult {
  parameters: BlastDesignParameters;
  fragmentation: FragmentationAnalysis;
  vibration: VibrationalParameters;
  cost: number;
  efficiency: number;
  score: number; // 0-100
  recommendations: string[];
}

export interface SimulationResult {
  timestamp: Date;
  method: 'Longfors' | 'Kuz-Ram' | 'RMSE' | 'Holmberg-Person';
  parameters: BlastDesignParameters;
  rockProperties: RockProperties;
  explosiveProperties: ExplosiveProperties;
  results: {
    fragmentation?: FragmentationAnalysis;
    vibration?: VibrationalParameters;
    stability?: number;
    safetyFactor?: number;
  };
  projectName: string;
}

export interface ExcavationDesign {
  type: 'underground' | 'openpit' | 'quarry';
  depth: number; // m
  width: number; // m
  length: number; // m
  crossSection: 'circular' | 'rectangular' | 'arched';
  supportType: 'none' | 'bolt' | 'shotcrete' | 'combination';
}

export interface MethodologyOptions {
  longfors?: {
    fixedRockFactor: boolean;
    powerExponent: number;
  };
  kuzRam?: {
    rockssFactor: number;
    powerCoefficient: number;
  };
  rmse?: {
    tolerance: number;
    maxIterations: number;
  };
  holmberg?: {
    safetyFactor: number;
    presplitMode: boolean;
  };
}
