# Vehicle Production Line Analysis System

## Background and Overview

Vehicle production operations are experiencing systematic plan-vs-actual deviations that negatively impact operational efficiency. These deviations manifest as high inventory levels, queue buildup in production lines, increased operational costs, and order delivery delays. Additional operational challenges include machine breakdowns, quality inconsistencies, and resulting customer dissatisfaction.

This analysis system was developed to identify the root causes and responsible operations behind these symptoms, systematically improve production line performance, and simulate post-improvement gains. The system enables data-driven decision-making by converting production data into actionable insights through automated analysis and interactive simulation capabilities.

The project implements the DMAIC (Define-Measure-Analyze-Improve-Control) methodology, a fundamental Six Sigma framework widely used in industrial process improvement. This structured approach ensures systematic progression through each phase, grounds decisions in concrete data, and makes solutions sustainable.

---

## Data Structure

The analysis utilizes production time data across multiple operations and vehicle types. The dataset encompasses three fundamental information layers:

### Core Data Components

1. **Operation Duration Data** (`raw_data`)
   - 8 production operations tracked across 21 vehicle types
   - Sequentially labeled operations: İşlem1, İşlem2, İşlem3, İşlem4, İşlem5, İşlem6, İşlem7, İşlem8
   - Duration measurements recorded in hours for each operation-vehicle combination

2. **Vehicle Catalog** (`vehicles`)
   - 21 different vehicle models analyzed
   - Sequentially labeled vehicles: Araç1, Araç2, Araç3, ..., Araç21
   - Each vehicle passes through all production operations

3. **Financial Parameters** (`config.js`)
     Requests hourly labor cost, daily production rate, annual working days, and investment cost multiplier from the user. (Default values are provided)

### Data Relationships

The system creates an **Operation-Vehicle Matrix** where each cell represents the time required by a specific vehicle type for a specific operation. This matrix structure enables:
- Cross-sectional analysis (comparing operations across all vehicles)
- Longitudinal analysis (tracking vehicle performance across all operations)
- Bottleneck detection through statistical threshold analysis
- Correlation detection between operation pairs

### Data Flow Architecture

```
Raw Production Data (Python Script)
    ↓
Statistical Analysis and Cleaning
    ↓
JSON Export (analysis_results.json)
    ↓
Web Dashboard Visualization (HTML/JS/CSS)
    ↓
Interactive Simulation Interface
```

---

## Executive Summary

The analysis identified four critical findings that directly impact production efficiency and financial performance:

1. **Primary Bottleneck Identified**: İşlem4 operates as the production line constraint with an average cycle time of 59.6 hours—this is 65% above the system-wide average of 36.0 hours. This single operation determines the maximum output capacity of the entire production line.

2. **High Process Variability**: İşlem6 exhibits excessive variance (σ² = 204.8), indicating significant process instability. This inconsistency suggests non-standardized procedures, material availability issues, or skill-dependent execution.

3. **Vehicle-Level Performance Disparity**: The analysis reveals a 33% efficiency gap between the best-performing vehicle (30.9-hour average on Araç7) and the worst-performing vehicle (41.2-hour average on Araç19). This disparity presents opportunities for best practice replication.

4. **Pareto Concentration**: 80% of total production time is concentrated in just 3-4 operations, validating focused resource allocation strategies rather than broad-based improvement initiatives.

---

## Deep Dive

### Bottleneck Analysis

The system uses **dynamic threshold calculation** to detect bottlenecks:
- Threshold = System Average + 1 Standard Deviation
- Any operation exceeding this threshold is flagged as a constraint
- İşlem4 (59.6 hours) significantly exceeds the 49.9-hour threshold

The bottleneck's impact extends beyond its own cycle time. When İşlem4 operates at full capacity, upstream operations accumulate work-in-process inventory and downstream operations experience starvation—classic symptoms of constraint-based production systems described in Goldratt's Theory of Constraints.

**Financial Impact Measurement**:
- Assuming 150 TL/hour labor cost and 5 vehicles/day production rate
- On an annual basis, bottleneck delays can result in approximately **4,425,000 TL** in labor inefficiency costs
- Each **10% improvement in İşlem4 translates to approximately 1,118,000 TL** in annual savings

### Pareto Analysis

80/20 rule validation shows:
- **Top 3 operations** (İşlem4, İşlem7, İşlem6) contribute to **48.8% of total production time**
- **Top 5 operations** contribute to **71.3% of total time**, confirming the classic Pareto principle
- This concentration necessitates allocating improvement resources primarily to İşlem4 (bottleneck), followed by İşlem7 and İşlem6
- The remaining 3 operations (İşlem3, İşlem8, İşlem2) constitute only 28.7% of total time and require continuous monitoring

### Vehicle Efficiency Distribution

The system ranks all 21 vehicles by average total production time:
- **Best Performance** (Araç7): Total 30.9 hours → serves as benchmarking standard
- **Worst Performance** (Araç19): Total 41.2 hours → requires root cause analysis
- **Improvement Opportunity**: Replicating Araç7's process characteristics can reduce cycle time system-wide by up to 25%

The color-coded visualization on the dashboard uses a green-yellow-red gradient to instantly communicate performance status to stakeholders.

### Simulation Model Validation

The **Interactive Bottleneck Simulation Module** allows users to test "what-if" scenarios:
- Select target operation (default: İşlem4)
- Choose improvement percentage (5%-50% range in 5% increments)
- Enter financial parameters (labor cost, production volume, investment cost)
- **Output**: Time savings, cost savings, ROI calculation, payback period

---

## Recommendations

Based on the findings uncovered, the following recommendations are presented:

**Immediately address the İşlem4 bottleneck.** İşlem4, which alone constitutes 65% of production time, limits the output of the entire line. Allocate additional personnel to this operation or evaluate semi-automatic equipment investment. A 15-20% improvement can provide annual savings of 2-3M TL with payback in 8-12 months.

**Establish standard work procedures in İşlem6.** İşlem6, showing a coefficient of variation over 40%, indicates inconsistent work methods. Prepare visual work instructions, document best operator techniques, and provide standardized training to the entire team. This will increase reliability in production time estimates and can improve on-time delivery by 12%.

**Transfer Araç7's success to other vehicles.** Examine the production methods of Araç7, which is 14% faster than the system average. Conduct time-motion studies to identify transferable techniques and test on 2-3 vehicle types as a pilot. With full adaptation, there is potential for annual savings of 5-7.6M TL with investment return in 2-3 months.

**Focus improvement resources on the top 3 operations.** 48.8% of total production time is concentrated in just 3 operations (İşlem4, İşlem7, İşlem6). Allocate 70-80% of the improvement budget to these operations. Keep other operations under routine monitoring but do not make major investments.

**Investigate why Araç19 is slow.** Examine Araç19, the slowest produced vehicle model, in detail. Identify which operations lose the most time and determine model-specific challenges (complex assembly, material supply, quality rejection). Develop solutions by applying root cause analysis.

**Establish a continuous improvement culture.** Regularly collect improvement suggestions from line operators and reward those who implement successful suggestions. Initiate a monthly DMAIC (Define-Measure-Analyze-Improve-Control) review cycle. This will provide 3-5% continuous annual efficiency increase (~1.5-2.2M TL).

---
