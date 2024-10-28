export const payrollTypeDefs = `#graphql
  type Payroll {
    _id: ID!
    payrollDate: String!
    totalEarnings: Int
    deductions: Int
    workingDays: Int
    leaveDays: Int
    totalNetPay: Int
    employeeId: ID!
    employee: Employee!
  }

  type SegmentedPayroll {
    employee: Employee!
    periods: [Payroll]
  }

  type AggregatedPayroll {
    employee: Employee!
    totalEarnings: Int!
    totalDeductions: Int!
    totalWorkingDays: Int!
    totalLeaveDays: Int!
    averageNetPay: Float!
    # periodCount: Int!
  }

  type ComparisonPayroll {
    employee: Employee
    period1: Payroll
    period2: Payroll
    earningsDiff: Float
    deductionsDiff: Float
    workingDaysDiff: Int
    leaveDaysDiff: Int
    netPayDiff: Float
  }

  type PaginatedPayrollResponse {
    items: [SegmentedPayroll]
    totalCount: Int
  }

  input DateRangeInput {
    startDate: String!
    endDate: String!
  }

  extend type Query {
    getSegmentedPayroll(dateRange: DateRangeInput!, page: Int, limit: Int, sortField: String, sortOrder: String): PaginatedPayrollResponse
    getAggregatedPayroll(dateRange: DateRangeInput!, page: Int, limit: Int): [AggregatedPayroll]
    getComparisonPayroll(period1: DateRangeInput!, period2: DateRangeInput!, page: Int, limit: Int): [ComparisonPayroll]
  }
`;
