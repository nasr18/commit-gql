import { Payroll } from './payroll.model.js';
import { Employee } from '../employee/employee.model.js';

// Convert dates to YYYY-MM-DD format for string comparison
const getYYYYMM = (date) => date.substring(0, 7);

export const payrollResolvers = {
  Payroll: {
    // resolver for employee field in Payroll type
    employee: async (parent) => {
      try {
        return await Employee.findById(parent.employeeId);
      } catch (err) {
        console.error('Error fetching payroll employee:', err);
        throw new Error('Error fetching payroll employee');
      }
    },
    // compute...
  },

  Query: {
    payrolls: async (_, { pagination }) => {
      return await Payroll.find()
        .limit(pagination.limit)
        .skip(pagination.page - 1)
        .lean();
    },

    getSegmentedPayrolls: async (_, { startDate, endDate }) => {
      // const startPeriod = getYYYYMM(startDate);
      // const endPeriod = getYYYYMM(endDate);

      const employees = await Employee.find().limit(10).lean();
      const segmentedResults = [];

      for (const employee of employees) {
        const payrolls = await Payroll.find({
          employeeId: employee._id,
          payrollDate: {
            $gte: startDate, // new Date(startDate),
            $lte: endDate, // new Date(endDate),
          },
        }).lean();
        console.log('payrolls:', payrolls);

        const periods = payrolls.map((payroll) => ({
          // period: new Date(payroll.payrollDate).toLocaleDateString('default', {
          //   month: 'short',
          //   year: 'numeric',
          // }),
          period: getYYYYMM(payroll.payrollDate),
          payrollData: payroll,
        }));

        segmentedResults.push({
          employee,
          periods,
        });
      }

      return segmentedResults;
    },

    getAggregatedPayrolls: async (_, { startDate, endDate }) => {
      try {
        const employees = await Employee.find().lean();
        const aggregatedResults = [];

        for (const employee of employees) {
          const payrolls = await Payroll.find({
            employeeId: employee._id,
            payrollDate: {
              $gte: startDate, // new Date(startDate),
              $lte: endDate, // new Date(endDate),
            },
          }).lean();

          const aggregated = payrolls.reduce(
            (acc, curr) => ({
              totalEarnings: (acc.totalEarnings || 0) + curr.totalEarnings,
              totalDeductions: (acc.totalDeductions || 0) + curr.deductions,
              totalWorkingDays: (acc.totalWorkingDays || 0) + curr.workingDays,
              totalLeaveDays: (acc.totalLeaveDays || 0) + curr.leaveDays,
            }),
            {},
          );

          aggregatedResults.push({
            employee,
            ...aggregated,
            averageNetPay:
              payrolls.reduce((acc, curr) => acc + curr.totalNetPay, 0) /
              payrolls.length,
            periodCount: payrolls.length,
          });
        }

        return aggregatedResults;
      } catch (error) {
        throw new Error(`Error fetching aggregated payrolls: ${error.message}`);
      }
    },

    getComparisonPayrolls: async (_, { firstPeriod, secondPeriod }) => {
      try {
        const employees = await Employee.find().lean();
        const comparisonResults = [];

        for (const employee of employees) {
          const firstPeriodPayroll = await Payroll.findOne({
            employeeId: employee._id,
            payrollDate: { $regex: `^${firstPeriod}` }, // new Date(firstPeriod),
          }).lean();

          const secondPeriodPayroll = await Payroll.findOne({
            employeeId: employee._id,
            payrollDate: { $regex: `^${secondPeriod}` }, // new Date(secondPeriod),
          }).lean();

          if (firstPeriodPayroll && secondPeriodPayroll) {
            const differences = {
              earningsDifference:
                secondPeriodPayroll.totalEarnings -
                firstPeriodPayroll.totalEarnings,
              deductionsDifference:
                secondPeriodPayroll.deductions - firstPeriodPayroll.deductions,
              workingDaysDifference:
                secondPeriodPayroll.workingDays -
                firstPeriodPayroll.workingDays,
              leaveDaysDifference:
                secondPeriodPayroll.leaveDays - firstPeriodPayroll.leaveDays,
              netPayDifference:
                secondPeriodPayroll.totalNetPay -
                firstPeriodPayroll.totalNetPay,
              percentageChange: (
                ((secondPeriodPayroll.totalNetPay -
                  firstPeriodPayroll.totalNetPay) /
                  firstPeriodPayroll.totalNetPay) *
                100
              ).toFixed(2),
            };

            comparisonResults.push({
              employee,
              firstPeriod: firstPeriodPayroll,
              secondPeriod: secondPeriodPayroll,
              differences,
            });
          }
        }

        return comparisonResults;
      } catch (error) {
        throw new Error(`Error fetching comparison payrolls: ${error.message}`);
      }
    },
  },
};
