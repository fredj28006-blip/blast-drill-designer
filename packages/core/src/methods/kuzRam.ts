/**
 * Kuz-Ram Method Implementation
 * For rock fragmentation analysis and prediction
 * Based on: Kuznetsov, V.M. (1973)
 */

import { BlastDesignParameters, RockProperties, ExplosiveProperties, FragmentationAnalysis } from '../types';

export class KuzRamMethod {
  private rockProperties: RockProperties;
  private explosiveProperties: ExplosiveProperties;
  private blastParameters: BlastDesignParameters;
  private rockssFactor: number;
  private powerCoefficient: number;

  constructor(
    rockProperties: RockProperties,
    explosiveProperties: ExplosiveProperties,
    blastParameters: BlastDesignParameters,
    rockssFactor: number = 7.0,
    powerCoefficient: number = 0.5
  ) {
    this.rockProperties = rockProperties;
    this.explosiveProperties = explosiveProperties;
    this.blastParameters = blastParameters;
    this.rockssFactor = rockssFactor;
    this.powerCoefficient = powerCoefficient;
  }

  /**
   * Rock Mass Factor (RMF)
   * A = 0.06 × (RMD + RDI + HF) × (1 + W/B)
   * RMD = Rock Mass Description
   * RDI = Rock Density Index
   * HF = Hardness Factor
   */
  private calculateRockMassFactor(): number {
    const RMD = this.getRMD();
    const RDI = this.getRDI();
    const HF = this.getHardnessFactor();
    const ratio = 1 + (this.blastParameters.spacing / this.blastParameters.burden);

    return 0.06 * (RMD + RDI + HF) * ratio;
  }

  private getRMD(): number {
    // Rock Mass Description (0-100)
    switch (this.rockProperties.rockmass) {
      case 'excellent': return 10;
      case 'good': return 40;
      case 'fair': return 50;
      case 'poor': return 70;
      case 'very poor': return 90;
      default: return 50;
    }
  }

  private getRDI(): number {
    // Rock Density Index
    // Normalized to 0-100
    const density = this.rockProperties.density;
    return Math.min(100, (density - 1500) / 15);
  }

  private getHardnessFactor(): number {
    // Based on compressive strength
    const strength = this.rockProperties.compressiveStrength;
    if (strength < 50) return 20;
    if (strength < 100) return 50;
    if (strength < 150) return 70;
    return 100;
  }

  /**
   * Calculate mean fragment size (d50) using Kuznetsov equation
   * Xm = (K₁ × K₂ × A × D^1.5) / (Q^0.5)
   * K₁ = 13 (for metric units)
   * K₂ = relative weight strength of explosive
   * A = rock mass factor
   * D = hole diameter (mm)
   * Q = charge mass per hole (kg)
   */
  calculateMeanFragmentSize(): number {
    const K1 = 13;
    const K2 = this.getRelativeWeightStrength();
    const A = this.calculateRockMassFactor();
    const D = this.blastParameters.holeDiameter;
    const Q = this.blastParameters.chargePerHole;

    const xm = (K1 * K2 * A * Math.pow(D, 1.5)) / Math.pow(Q, 0.5);
    
    return Math.max(10, xm); // Minimum 10mm
  }

  /**
   * Relative Weight Strength (RWS) of explosive
   */
  private getRelativeWeightStrength(): number {
    const explosiveType = this.explosiveProperties.type;
    
    // RWS relative to ANFO = 1.0
    const rwsValues: Record<string, number> = {
      'ANFO': 1.0,
      'Dynamite': 1.25,
      'RDX': 1.15,
      'PETN': 1.40,
      'Emulsion': 1.10
    };

    return rwsValues[explosiveType] || 1.0;
  }

  /**
   * Calculate d80 from d50 using Rosin-Rammler distribution
   * Assumes uniformity index n ≈ 2
   */
  calculateD80(): number {
    const d50 = this.calculateMeanFragmentSize();
    // For n ≈ 2, d80/d50 ≈ 1.58
    return d50 * 1.58;
  }

  /**
   * Calculate d10 (10% passing size)
   */
  calculateD10(): number {
    const d50 = this.calculateMeanFragmentSize();
    // For n ≈ 2, d10/d50 ≈ 0.31
    return d50 * 0.31;
  }

  /**
   * Uniformity index calculation
   * n = (ln(ln(100/15)) - ln(ln(100/85))) / ln(d15/d85)
   */
  calculateUniformityIndex(): number {
    // For practical purposes, estimate based on rock properties
    const rqd = this.rockProperties.rqd;
    // Higher RQD = more uniform fragmentation
    const baseIndex = 2.5 - (rqd / 100) * 1.5;
    return Math.max(1.0, baseIndex);
  }

  /**
   * Estimate percentage of fragments in each size class
   */
  private estimateSizeDistribution(d80: number, d50: number): { fines: number; medium: number; coarse: number } {
    const d10 = this.calculateD10();
    
    // Using typical Rosin-Rammler distribution
    const fines = Math.exp(-Math.pow(100 / d10, this.calculateUniformityIndex()));
    const coarse = Math.exp(-Math.pow(250 / d80, this.calculateUniformityIndex()));
    const medium = 100 - (fines + coarse);

    return {
      fines: Math.max(0, Math.min(100, fines * 100)),
      medium: Math.max(0, Math.min(100, medium)),
      coarse: Math.max(0, Math.min(100, coarse * 100))
    };
  }

  /**
   * Complete fragmentation analysis using Kuz-Ram
   */
  calculateFragmentation(): FragmentationAnalysis {
    const d80 = this.calculateD80();
    const d50 = this.calculateMeanFragmentSize();
    const uniformityIndex = this.calculateUniformityIndex();
    
    const distribution = this.estimateSizeDistribution(d80, d50);

    return {
      d80,
      d50,
      uniformityIndex,
      finesFraction: distribution.fines,
      coarsesFraction: distribution.coarse,
      averageFragmentSize: d50,
      distribution: uniformityIndex < 1.2 ? 'uniform' : uniformityIndex < 2.5 ? 'bimodal' : 'poor'
    };
  }

  /**
   * Complete analysis
   */
  analyze() {
    return {
      rockMassFactor: this.calculateRockMassFactor(),
      relativeWeightStrength: this.getRelativeWeightStrength(),
      meanFragmentSize: this.calculateMeanFragmentSize(),
      d80: this.calculateD80(),
      d10: this.calculateD10(),
      uniformityIndex: this.calculateUniformityIndex(),
      fragmentation: this.calculateFragmentation()
    };
  }
}

export default KuzRamMethod;
