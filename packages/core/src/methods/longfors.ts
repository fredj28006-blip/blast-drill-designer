/**
 * Longfors Method Implementation
 * For general blast design and fragmentation prediction
 * Based on: Langefors, B. and Kihlström, B. (1963)
 */

import { BlastDesignParameters, RockProperties, ExplosiveProperties, FragmentationAnalysis, VibrationalParameters } from '../types';

export class LongforsMethod {
  private rockProperties: RockProperties;
  private explosiveProperties: ExplosiveProperties;
  private blastParameters: BlastDesignParameters;

  constructor(
    rockProperties: RockProperties,
    explosiveProperties: ExplosiveProperties,
    blastParameters: BlastDesignParameters
  ) {
    this.rockProperties = rockProperties;
    this.explosiveProperties = explosiveProperties;
    this.blastParameters = blastParameters;
  }

  /**
   * Calculate maximum burden based on hole diameter
   * B = (D/33) * f * √(ρe/ρr)
   * where D = hole diameter (mm)
   * f = rock factor
   * ρe = explosive density
   * ρr = rock density
   */
  calculateMaximumBurden(): number {
    const D = this.blastParameters.holeDiameter;
    const f = this.getRockFactor();
    const densityRatio = Math.sqrt(this.explosiveProperties.density / this.rockProperties.density);
    
    return (D / 33) * f * densityRatio;
  }

  /**
   * Rock factor calculation based on rock properties
   */
  private getRockFactor(): number {
    const rqd = this.rockProperties.rqd;
    const rockmass = this.rockProperties.rockmass;
    
    let baseFactor = 1.0;
    
    switch (rockmass) {
      case 'excellent':
        baseFactor = 1.5;
        break;
      case 'good':
        baseFactor = 1.2;
        break;
      case 'fair':
        baseFactor = 1.0;
        break;
      case 'poor':
        baseFactor = 0.8;
        break;
      case 'very poor':
        baseFactor = 0.6;
        break;
    }
    
    // Adjust by RQD
    const rqdFactor = 0.5 + (rqd / 100) * 0.5;
    
    return baseFactor * rqdFactor;
  }

  /**
   * Calculate specific charge (kg/m³)
   * q = (B × S × H) / Q
   * where B = burden, S = spacing, H = hole depth, Q = charge per hole
   */
  calculateSpecificCharge(): number {
    const B = this.blastParameters.burden;
    const S = this.blastParameters.spacing;
    const H = this.blastParameters.holeDepth;
    const Q = this.blastParameters.chargePerHole;

    return (B * S * H) / Q;
  }

  /**
   * Calculate powder factor (kg/m³)
   */
  calculatePowderFactor(): number {
    return this.calculateSpecificCharge();
  }

  /**
   * Estimate fragmentation using Longfors approach
   */
  calculateFragmentation(): FragmentationAnalysis {
    const q = this.calculateSpecificCharge();
    const RQD = this.rockProperties.rqd;
    
    // d80 estimation (mm)
    // Larger charge = finer fragmentation
    const d80 = 2000 / (1 + Math.pow(q, 0.8)) + (100 - RQD) * 0.5;
    
    // d50 estimation
    const d50 = d80 * 0.63;
    
    // Uniformity index
    const uniformityIndex = d80 / d50;
    
    // Calculate fines and coarses
    const finesFraction = Math.min(100, 20 + (2000 / d80) * 5);
    const coarsesFraction = Math.max(0, 100 - finesFraction - 50);
    
    return {
      d80,
      d50,
      uniformityIndex,
      finesFraction,
      coarsesFraction,
      averageFragmentSize: (d80 + d50) / 2,
      distribution: uniformityIndex < 1.2 ? 'uniform' : uniformityIndex < 2.5 ? 'bimodal' : 'poor'
    };
  }

  /**
   * Calculate vibration parameters using Longfors empirical relationships
   */
  calculateVibration(distanceFromBlast: number): VibrationalParameters {
    const Q = this.blastParameters.numberOfHoles * this.blastParameters.chargePerHole;
    const distance = distanceFromBlast;
    
    // Empirical formula for PPV (mm/s)
    // PPV = K * (Q^(1/3) / distance) ^ α
    const K = 1100; // Site constant (typical value)
    const alpha = 1.6; // Exponent (typical value)
    
    const ppv = K * Math.pow(Math.pow(Q, 1/3) / distance, alpha);
    
    // Frequency estimation (Hz)
    const frequency = 500 / Math.sqrt(distanceFromBlast);
    
    // Risk assessment
    let riskLevel: 'safe' | 'acceptable' | 'unsafe';
    if (ppv < 5) {
      riskLevel = 'safe';
    } else if (ppv < 12) {
      riskLevel = 'acceptable';
    } else {
      riskLevel = 'unsafe';
    }
    
    return {
      ppv,
      frequency,
      distance,
      attenuation: Math.pow(distance, -alpha),
      riskLevel
    };
  }

  /**
   * Complete analysis
   */
  analyze() {
    return {
      maximumBurden: this.calculateMaximumBurden(),
      rockFactor: this.getRockFactor(),
      specificCharge: this.calculateSpecificCharge(),
      powderFactor: this.calculatePowderFactor(),
      fragmentation: this.calculateFragmentation(),
      vibrationAt100m: this.calculateVibration(100),
      vibrationAt50m: this.calculateVibration(50)
    };
  }
}

export default LongforsMethod;
