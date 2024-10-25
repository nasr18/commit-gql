export const payrollTypeDefs = `#graphql
  type Payroll {
    _id: ID!
    payrollDate: String!
    totalEarnings: Int
    deductions: Int
    workingDays: Int
    leaveDays: Int
    totalNetPay: Int
    employeeId: Int!
    employee: Employee!
  }

  type PayrollPeriod {
    period: String!
    payrollData: Payroll
  }

  type SegmentedPayroll {
    employee: Employee!
    periods: [PayrollPeriod!]!
  }

  type AggregatedPayroll {
    employee: Employee!
    totalEarnings: Int!
    totalDeductions: Int!
    totalWorkingDays: Int!
    totalLeaveDays: Int!
    averageNetPay: Float!
    periodCount: Int!
  }

  type ComparisonPayroll {
    employee: Employee!
    firstPeriod: Payroll
    secondPeriod: Payroll
    differences: PayrollDifference!
  }

  type PayrollDifference {
    earningsDifference: Int!
    deductionsDifference: Int!
    workingDaysDifference: Int!
    leaveDaysDifference: Int!
    netPayDifference: Int!
    percentageChange: Float!
  }

  input PayrollFilterInput {
    employeeId: ID
    startDate: String
    endDate: String
  }

  extend type Query {
    payrolls(
      pagination: PaginationInput = { page: 1, limit: 10 }
      filter: PayrollFilterInput
      sort: SortInput
    ): [Payroll]

    getSegmentedPayrolls(startDate: String!, endDate: String!): [SegmentedPayroll!]!
    getAggregatedPayrolls(startDate: String!, endDate: String!): [AggregatedPayroll!]!
    getComparisonPayrolls(firstPeriod: String!, secondPeriod: String!): [ComparisonPayroll!]!
  }
`;
