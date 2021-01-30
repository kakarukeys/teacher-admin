module.exports = {
  up: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.bulkInsert('Teachers', [
        { email: 'teacherken@gmail.com' },
        { email: 'teacherjoe@gmail.com' },
      ], { transaction });
      await queryInterface.bulkInsert('Students', [
        { email: 'studentjon@gmail.com' },
        { email: 'studenthon@gmail.com' },
        { email: 'commonstudent1@gmail.com' },
        { email: 'commonstudent2@gmail.com' },
        { email: 'studentmary@gmail.com' },
        { email: 'studentbob@gmail.com' },
        { email: 'studentagnes@gmail.com' },
        { email: 'studentmiche@gmail.com' },
      ], { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  down: async (queryInterface) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.bulkDelete('TeacherStudents', null, { transaction });
      await queryInterface.bulkDelete('Teachers', null, { transaction });
      await queryInterface.bulkDelete('Students', null, { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
