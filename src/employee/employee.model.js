import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  _id: Number,
  employeeName: String,
  department: String,
  designation: String,
  workLocation: String,
});

export const Employee = mongoose.model('Employee', employeeSchema);
