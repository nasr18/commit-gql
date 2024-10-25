import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  payrollDate: String,
  totalEarnings: Number,
  deductions: Number,
  workingDays: Number,
  leaveDays: Number,
  totalNetPay: Number,
  employeeId: {
    type: Number,
    ref: 'Employee',
  },
});

export const Payroll = mongoose.model('Payroll', payrollSchema);
