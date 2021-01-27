module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('Teachers', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
      });

      await queryInterface.createTable('Students', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        suspended: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          default: false,
        },
      });

      await queryInterface.createTable('TeacherStudents', {
        TeacherId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'Teachers', key: 'id' },
        },
        StudentId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: { model: 'Students', key: 'id' },
        },
      }, {
        uniqueKeys: {
          teacherid_studentid_uniq: {
            fields: ['TeacherId', 'StudentId'],
          },
        },
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable('Teacher');
      await queryInterface.dropTable('Student');
      await queryInterface.dropTable('TeacherStudent');
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};
