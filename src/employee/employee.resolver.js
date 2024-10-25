import { Employee } from './employee.model.js';
import { Payroll } from '../payroll/payroll.model.js';

export const employeeResolvers = {
  Employee: {
    // resolver for payrolls field in Employee type
    payrolls: async (parent) => {
      try {
        return await Payroll.find({ employeeId: parent._id });
      } catch (err) {
        console.error('Error fetching employee payrolls:', err);
        throw new Error('Error fetching employee payrolls');
      }
    },
  },

  Query: {
    employees: async (_, { pagination = {}, filter = {}, sort = {} }) => {
      console.log('employees:', { pagination, filter, sort });

      if (pagination.page < 1) {
        pagination.page = 1;
      }

      if (pagination.limit > 25) {
        pagination.limit = 10;
      }

      const skip = (pagination.page - 1) * pagination.limit;

      const _filter = {};

      if (filter.department) {
        _filter.department = { $regex: filter.department, $options: 'i' };
      }

      if (filter.searchTerm) {
        // _filter.$or = [
        //   { employeeName: { $regex: filter.searchTerm, $options: 'i' } },
        // ];
        _filter.employeeName = { $regex: filter.searchTerm, $options: 'i' };
      }

      const [total, employees] = await Promise.all([
        Employee.countDocuments(_filter),
        Employee.find(_filter)
          .sort({ [sort.field]: sort.order === 'ASC' ? 1 : -1 })
          .limit(pagination.limit)
          .skip(skip)
          .lean(),
      ]);

      return {
        pageInfo: { ...pagination, total },
        data: employees,
      };
    },
  },
};
