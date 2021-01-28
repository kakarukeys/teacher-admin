const request = require('supertest');
const { beforeAction, afterAction } = require('../setup/_setup');

const { Teacher, Student, TeacherStudent } = require('../../api/models/Teacher');

let api;

beforeAll(async () => {
  api = await beforeAction();
});

afterAll(() => {
  afterAction();
});

beforeEach(async () => {
  await TeacherStudent.destroy({ truncate: true });
  await Teacher.destroy({ where: {} });
  await Student.destroy({ where: {} });
});

describe('teacher | register', async () => {
  beforeEach(async () => {
    await Teacher.bulkCreate([
      { email: 'benleong@hotmail.com' },
    ]);

    await Student.bulkCreate([
      { email: 'bob@gmail.com' },
      { email: 'jane@gmail.com' },
    ]);
  });

  test('invalid teacher', async () => {
    const res = await request(api)
      .post('/api/register')
      .send({
        teacher: 'invalid@hotmail.com',
        students: [
          'bob@gmail.com',
          'jane@gmail.com',
        ],
      })
      .set('Content-Type', 'application/json');

    expect(res.body).toStrictEqual({ message: 'teacher email is not registered' });
    expect(res.status).toBe(400);

    const regs = await TeacherStudent.findAll();
    expect(regs.length).toBe(0);
  });

  test('invalid student', async () => {
    const res = await request(api)
      .post('/api/register')
      .send({
        teacher: 'benleong@hotmail.com',
        students: [
          'bob@gmail.com',
          'invalid@gmail.com',
        ],
      })
      .set('Content-Type', 'application/json');

    expect(res.body.message).toContain('some student emails are not registered');
    expect(res.status).toBe(400);

    const regs = await TeacherStudent.findAll();
    expect(regs.length).toBe(0);
  });

  test('all entities exist', async () => {
    const res = await request(api)
      .post('/api/register')
      .send({
        teacher: 'benleong@hotmail.com',
        students: [
          'bob@gmail.com',
          'jane@gmail.com',
        ],
      })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(204);

    const regs = await TeacherStudent.count();
    expect(regs).toBe(2);
  });
});
