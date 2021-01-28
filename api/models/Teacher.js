const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/* Teacher administration models  */

const Teacher = sequelize.define('Teacher', {
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
}, { timestamps: false });

const Student = sequelize.define('Student', {
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  suspended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, { timestamps: false });

// many-2-many relation
const TeacherStudent = sequelize.define('TeacherStudent', {
}, { timestamps: false });

Teacher.belongsToMany(Student, { through: TeacherStudent });
Student.belongsToMany(Teacher, { through: TeacherStudent });

module.exports = {
  Teacher,
  Student,
  TeacherStudent,
};
