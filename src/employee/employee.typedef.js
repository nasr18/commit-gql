export const employeeTypeDefs = `#graphql
  type Employee {
    _id: ID!
    employeeName: String!
    department: String!
    designation: String!
    workLocation: String
    payrolls: [Payroll]
  }

  type EmployeesResponse {
    pageInfo: PageInfo!
    data: [Employee!]
  }

  input EmployeeFilterInput {
    department: String
    designation: String
    searchTerm: String
  }

  extend type Query {
    employees(
      pagination: PaginationInput = { page: 1, limit: 10 }
      filter: EmployeeFilterInput
      sort: SortInput = { field: "employeeName", order: "ASC" }
    ): EmployeesResponse
  }
`;
