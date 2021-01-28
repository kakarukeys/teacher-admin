const _ = require('underscore');
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

describe('teacher | register', () => {
  beforeEach(async () => {
    /* test fixture */
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

describe('teacher | commonStudents', () => {
  beforeEach(async () => {
    /* test fixture */
    const teachers = await Promise.all(_.map([
      { email: 'benleong@hotmail.com' },
      { email: 'ken@hotmail.com' },
      { email: 'ryu@hotmail.com' },
    ], (d) => Teacher.create(d)));

    const students = await Promise.all(_.map([
      { email: 'bob@gmail.com' },
      { email: 'jane@gmail.com' },
      { email: 'eric@gmail.com' },
      { email: 'nancy@gmail.com' },
      { email: 'tracy@gmail.com' },
    ], (d) => Student.create(d)));

    await TeacherStudent.bulkCreate([
      { TeacherId: teachers[0].id, StudentId: students[0].id },
      { TeacherId: teachers[0].id, StudentId: students[1].id },
      { TeacherId: teachers[0].id, StudentId: students[2].id },
      { TeacherId: teachers[1].id, StudentId: students[1].id },
      { TeacherId: teachers[1].id, StudentId: students[2].id },
      { TeacherId: teachers[1].id, StudentId: students[3].id },
      { TeacherId: teachers[2].id, StudentId: students[4].id },
    ]);
  });

  test('0 teacher', async () => {
    const res = await request(api)
      .get('/api/commonstudents?');

    expect(res.status).toBe(400);
  });

  test('1 teacher', async () => {
    const res = await request(api)
      .get('/api/commonstudents?teacher=benleong@hotmail.com');

    expect(res.body).toStrictEqual({
      students: [
        'bob@gmail.com',
        'eric@gmail.com',
        'jane@gmail.com',
      ],
    });
    expect(res.status).toBe(200);
  });

  test('1 teacher + non-existing teacher', async () => {
    const res = await request(api)
      .get('/api/commonstudents?teacher=benleong%40hotmail.com&teacher=invalid%40hotmail.com');

    expect(res.body).toStrictEqual({
      students: [
        'bob@gmail.com',
        'eric@gmail.com',
        'jane@gmail.com',
      ],
    });
    expect(res.status).toBe(200);
  });

  test('2 teachers', async () => {
    const res = await request(api)
      .get('/api/commonstudents?teacher=benleong%40hotmail.com&teacher=ken%40hotmail.com');

    expect(res.body).toStrictEqual({
      students: [
        'eric@gmail.com',
        'jane@gmail.com',
      ],
    });
    expect(res.status).toBe(200);
  });

  test('no overlap', async () => {
    const res = await request(api)
      .get('/api/commonstudents?teacher=benleong%40hotmail.com&teacher=ken%40hotmail.com&teacher=ryu%40hotmail.com');

    expect(res.body).toStrictEqual({
      students: [],
    });
    expect(res.status).toBe(200);
  });
});
