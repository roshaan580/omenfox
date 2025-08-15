const mongoose = require("mongoose");
const Wiki = require("../models/Wiki");
const User = require("../models/User");
require("dotenv").config();

const sampleWikiData = [
  {
    title: "Getting Started with Carbon Emissions Tracking",
    content: `Getting Started with Carbon Emissions Tracking

Welcome to the comprehensive guide for carbon emissions tracking. This article will help you understand the basics of carbon footprint measurement and how to use our platform effectively.

What are Carbon Emissions?

Carbon emissions refer to the release of carbon dioxide (CO2) and other greenhouse gases into the atmosphere. These emissions are typically categorized into three scopes:

- Scope 1: Direct emissions from owned or controlled sources
- Scope 2: Indirect emissions from purchased energy
- Scope 3: All other indirect emissions in the value chain

Getting Started

1. Set up your company profile
2. Add your facilities and locations
3. Start tracking your emissions data
4. Generate reports and analytics

Best Practices

- Regular data collection and validation
- Consistent measurement methodologies
- Proper documentation of emission sources
- Regular review and updates of emission factors

For more detailed information, please refer to the specific scope documentation.`,
    tags: ["getting-started", "basics", "carbon-emissions", "tutorial"],
  },
  {
    title: "Understanding Scope 1 Emissions",
    content: `Understanding Scope 1 Emissions

Scope 1 emissions are direct greenhouse gas emissions that occur from sources that are owned or controlled by your organization.

Types of Scope 1 Emissions

Mobile Combustion
- Company vehicles
- Fleet transportation
- Mobile equipment

Stationary Combustion
- Boilers and furnaces
- Emergency generators
- Process heaters

Calculation Methods

Activity Data × Emission Factor = CO2 Emissions

Example Calculation
If your company vehicle consumes 1,000 liters of gasoline:
- Activity Data: 1,000 liters
- Emission Factor: 2.31 kg CO2/liter
- Total Emissions: 2,310 kg CO2

Data Collection Tips

1. Maintain fuel purchase records
2. Track vehicle mileage
3. Monitor equipment usage hours
4. Keep maintenance logs

Common Challenges

- Data availability: Ensure consistent data collection
- Emission factors: Use appropriate regional factors
- Boundary setting: Clearly define organizational boundaries`,
    tags: ["scope-1", "direct-emissions", "mobile-combustion", "stationary-combustion"],
  },
  {
    title: "Scope 2 Emissions: Purchased Energy",
    content: `Scope 2 Emissions: Purchased Energy

Scope 2 emissions are indirect emissions from the generation of purchased electricity, steam, heating, and cooling consumed by your organization.

Key Components

Purchased Electricity
- Grid electricity consumption
- Renewable energy certificates (RECs)
- Power purchase agreements (PPAs)

Purchased Steam, Heat, and Cooling
- District heating systems
- Purchased steam for processes
- Centralized cooling systems

Calculation Methods

Location-Based Method
Uses average emission factors for the electricity grid

Market-Based Method
Uses emission factors from specific electricity suppliers

Emission Factors

Different regions have different grid emission factors:
- Coal-heavy grids: Higher emission factors
- Renewable-heavy grids: Lower emission factors
- Mixed grids: Moderate emission factors

Reducing Scope 2 Emissions

1. Energy efficiency improvements
2. Renewable energy procurement
3. On-site renewable generation
4. Green building certifications

Documentation Requirements

- Utility bills and invoices
- Meter readings
- Renewable energy certificates
- Power purchase agreements`,
    tags: ["scope-2", "purchased-energy", "electricity", "renewable-energy"],
  },
  {
    title: "Analytics and Reporting Best Practices",
    content: `Analytics and Reporting Best Practices

Effective analytics and reporting are crucial for understanding your carbon footprint and making informed decisions.

Key Performance Indicators (KPIs)

Absolute Emissions
- Total CO2 equivalent emissions
- Emissions by scope
- Emissions by facility/location

Intensity Metrics
- Emissions per unit of production
- Emissions per employee
- Emissions per square foot

Reporting Frameworks

GHG Protocol
The most widely used international standard for corporate GHG accounting

CDP (Carbon Disclosure Project)
Global disclosure system for environmental information

TCFD (Task Force on Climate-related Financial Disclosures)
Framework for climate-related financial risk disclosures

Data Visualization

Charts and Graphs
- Trend analysis: Line charts showing emissions over time
- Composition analysis: Pie charts showing emissions by source
- Comparison analysis: Bar charts comparing different periods

Dashboards
- Real-time emission tracking
- Key metric summaries
- Alert systems for unusual patterns

Quality Assurance

1. Data validation: Regular checks for accuracy
2. Consistency checks: Ensure methodological consistency
3. Third-party verification: Independent validation of data
4. Documentation: Maintain detailed records of methodologies

Reporting Schedule

- Monthly: Internal tracking and monitoring
- Quarterly: Management reporting
- Annually: External disclosure and verification`,
    tags: ["analytics", "reporting", "kpi", "ghg-protocol", "data-visualization"],
  },
  {
    title: "Setting and Tracking Emission Targets",
    content: `Setting and Tracking Emission Targets

Setting science-based targets is essential for meaningful climate action and business sustainability.

Types of Targets

Absolute Targets
- Reduce total emissions by X% by year Y
- Example: "Reduce Scope 1 and 2 emissions by 50% by 2030"

Intensity Targets
- Reduce emissions per unit of activity
- Example: "Reduce emissions per unit of production by 30% by 2025"

Science-Based Targets (SBTs)

Targets that are in line with what climate science says is necessary to limit global warming to 1.5°C above pre-industrial levels.

SBT Criteria
1. Ambitious: Consistent with 1.5°C pathway
2. Measurable: Clear metrics and timelines
3. Time-bound: Specific target years
4. Comprehensive: Cover significant emission sources

Target Setting Process

1. Baseline establishment: Define starting point
2. Scope definition: Determine which emissions to include
3. Target type selection: Absolute vs. intensity
4. Timeline setting: Short-term and long-term goals
5. Validation: Ensure targets are science-based

Tracking Progress

Regular Monitoring
- Monthly data collection
- Quarterly progress reviews
- Annual target assessments

Key Metrics
- Progress rate: % of target achieved
- Trajectory analysis: On-track vs. off-track
- Gap analysis: Remaining reductions needed

Common Challenges

- Data quality: Ensuring accurate baseline data
- Scope creep: Managing changes in business scope
- External factors: Economic conditions, regulatory changes
- Technology limitations: Availability of low-carbon alternatives`,
    tags: ["targets", "science-based-targets", "goal-setting", "progress-tracking"],
  }
];

const seedWikiData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      process.exit(1);
    }

    await Wiki.deleteMany({});
    const wikiArticles = sampleWikiData.map(article => ({
      ...article,
      author: adminUser._id,
    }));

    await Wiki.insertMany(wikiArticles);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding wiki data:", error);
    process.exit(1);
  }
};

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedWikiData();
}

module.exports = { seedWikiData, sampleWikiData };