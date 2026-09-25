import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

export const schools = pgTable('schools', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(),
  schoolId: text('school_id').references(() => schools.id).notNull(),
  permissions: jsonb('permissions').default([]).notNull(),
});

export const students = pgTable('students', {
  id: text('id').primaryKey(),
  admissionNo: text('admission_no').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  gender: text('gender').notNull(),
  dob: text('dob').notNull(),
  bloodGroup: text('blood_group'),
  classId: text('class_id'),
  className: text('class_name'),
  section: text('section'),
  rollNo: integer('roll_no'),
  parentName: text('parent_name'),
  parentRelationship: text('parent_relationship'),
  parentPhone: text('parent_phone'),
  parentEmail: text('parent_email'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  photoUrl: text('photo_url'),
  feeStatus: text('fee_status'),
  totalFees: integer('total_fees'),
  paidFees: integer('paid_fees'),
  pendingAmount: integer('pending_amount'),
  attendancePercent: integer('attendance_percent'),
  status: text('status'),
  enrollmentDate: text('enrollment_date'),
  schoolId: text('school_id').references(() => schools.id).notNull(),
});

export const staff = pgTable('staff', {
  id: text('id').primaryKey(),
  empId: text('emp_id').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  gender: text('gender').notNull(),
  department: text('department'),
  designation: text('designation'),
  phone: text('phone'),
  email: text('email'),
  qualification: text('qualification'),
  joiningDate: text('joining_date'),
  salary: integer('salary'),
  status: text('status'),
  schoolId: text('school_id').references(() => schools.id).notNull(),
});

export const classes = pgTable('classes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  section: text('section'),
  classTeacher: text('class_teacher'),
  roomNo: text('room_no'),
  capacity: integer('capacity'),
  schoolId: text('school_id').references(() => schools.id).notNull(),
});

