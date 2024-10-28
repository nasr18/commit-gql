import { Payroll } from './payroll.model.js';
import { Employee } from '../employee/employee.model.js';

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
    getSegmentedPayroll: async (
      _,
      { dateRange, page = 1, limit = 10, sortField, sortOrder },
    ) => {
      try {
        const skip = (page - 1) * limit;

        // Get payroll records for the date range
        const query = {
          payrollDate: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate,
          },
        };

        // Get distinct employee IDs for pagination
        const distinctEmployeeIds = await Payroll.distinct('employeeId', query);
        const totalCount = distinctEmployeeIds.length;

        // Get paginated employee IDs
        const paginatedEmployeeIds = distinctEmployeeIds.slice(
          skip,
          skip + limit,
        );

        // Get payroll records for paginated employees
        const payrollRecords = await Payroll.find({
          ...query,
          employeeId: { $in: paginatedEmployeeIds },
        })
          .sort(sortField ? { [sortField]: sortOrder === 'asc' ? 1 : -1 } : {})
          .populate('employeeId');

        // Group payroll records by employee
        const groupedPayroll = paginatedEmployeeIds.map((employeeId) => {
          const employeePayrolls = payrollRecords.filter(
            (record) =>
              record.employeeId._id.toString() === employeeId.toString(),
          );

          return {
            employee: employeePayrolls[0].employeeId,
            periods: employeePayrolls,
          };
        });

        return {
          items: groupedPayroll,
          totalCount,
        };
      } catch (error) {
        console.error('Error in getSegmentedPayroll:', error);
        throw error;
      }
    },

    getAggregatedPayroll: async (_, { dateRange, page = 1, limit = 10 }) => {
      try {
        const skip = (page - 1) * limit;

        // Get distinct employee IDs first
        const distinctEmployeeIds = await Payroll.distinct('employeeId', {
          payrollDate: {
            $gte: dateRange.startDate,
            $lte: dateRange.endDate,
          },
        });

        // Get paginated employee IDs
        const paginatedEmployeeIds = distinctEmployeeIds.slice(
          skip,
          skip + limit,
        );

        // Process each employee separately
        const aggregatedResults = await Promise.all(
          paginatedEmployeeIds.map(async (employeeId) => {
            const payrolls = await Payroll.find({
              employeeId,
              payrollDate: {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate,
              },
            }).populate('employeeId');

            // Calculate aggregates manually
            const totalEarnings = payrolls.reduce(
              (sum, p) => sum + p.totalEarnings,
              0,
            );
            const totalDeductions = payrolls.reduce(
              (sum, p) => sum + p.deductions,
              0,
            );
            const totalWorkingDays = payrolls.reduce(
              (sum, p) => sum + p.workingDays,
              0,
            );
            const totalLeaveDays = payrolls.reduce(
              (sum, p) => sum + p.leaveDays,
              0,
            );
            const averageNetPay =
              payrolls.reduce((sum, p) => sum + p.totalNetPay, 0) /
              payrolls.length;

            return {
              employee: payrolls[0].employeeId,
              totalEarnings,
              totalDeductions,
              totalWorkingDays,
              totalLeaveDays,
              averageNetPay,
            };
          }),
        );

        return aggregatedResults;
      } catch (error) {
        console.error('Error in getAggregatedPayroll:', error);
        throw error;
      }
    },

    getComparisonPayroll: async (
      _,
      { period1, period2, page = 1, limit = 10 },
    ) => {
      try {
        const skip = (page - 1) * limit;

        // Get distinct employee IDs first
        const distinctEmployeeIds = await Payroll.distinct('employeeId', {
          payrollDate: {
            $gte: period1.startDate,
            $lte: period2.endDate,
          },
        });

        // Get paginated employee IDs
        const paginatedEmployeeIds = distinctEmployeeIds.slice(
          skip,
          skip + limit,
        );

        // Process each employee separately
        const comparisonResults = await Promise.all(
          paginatedEmployeeIds.map(async (employeeId) => {
            const [period1Data, period2Data] = await Promise.all([
              Payroll.findOne({
                employeeId,
                payrollDate: {
                  $gte: period1.startDate,
                  $lte: period1.endDate,
                },
              }).populate('employeeId'),
              Payroll.findOne({
                employeeId,
                payrollDate: {
                  $gte: period2.startDate,
                  $lte: period2.endDate,
                },
              }),
            ]);

            if (!period1Data || !period2Data) return null;

            return {
              employee: period1Data.employeeId,
              period1: period1Data,
              period2: period2Data,
              earningsDiff:
                period2Data.totalEarnings - period1Data.totalEarnings,
              deductionsDiff: period2Data.deductions - period1Data.deductions,
              workingDaysDiff:
                period2Data.workingDays - period1Data.workingDays,
              leaveDaysDiff: period2Data.leaveDays - period1Data.leaveDays,
              netPayDiff: period2Data.totalNetPay - period1Data.totalNetPay,
            };
          }),
        );

        return comparisonResults.filter((result) => result !== null);
      } catch (error) {
        console.error('Error in getPayrollComparison:', error);
        throw error;
      }
    },
  },
};
