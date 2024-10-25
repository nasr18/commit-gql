import { commonTypeDefs } from './common.typedef.js';
import { employeeTypeDefs } from '../employee/employee.typedef.js';
import { payrollTypeDefs } from '../payroll/payroll.typedef.js';

const baseTypeDefs = `#graphql
  type Query {
    greetings: String
    welcome(name: String!): String
  }
`;

export const typeDefs = [
  baseTypeDefs,
  commonTypeDefs,
  employeeTypeDefs,
  payrollTypeDefs,
];
