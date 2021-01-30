const _ = require('underscore');
const request = require('supertest');
const { beforeAction, afterAction } = require('../setup/_setup');

const { Teacher, Student, TeacherStudent } = require('../../api/models/Teacher');

let api;

const clearData = async () => {
  await TeacherStudent.destroy({ truncate: true });
  await Teacher.destroy({ where: {} });
  await Student.destroy({ where: {} });
};

beforeAll(async () => {
  api = await beforeAction();
});

afterAll(() => {
  afterAction();
});

describe('teacher | register', () => {
  beforeAll(async () => {
    await clearData();

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

  test('already registered', async () => {
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
  beforeAll(async () => {
    await clearData();

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

describe('teacher | suspend', () => {
  beforeAll(async () => {
    await clearData();

    /* test fixture */
    Student.bulkCreate([
      { email: 'bob@gmail.com' },
      { email: 'jane@gmail.com' },
    ]);
  });

  test('invalid student', async () => {
    const res = await request(api)
      .post('/api/suspend')
      .send({ student: 'invalid@gmail.com' })
      .set('Content-Type', 'application/json');

    expect(res.body.message).toContain('student email is not registered');
    expect(res.status).toBe(400);

    const totalSuspended = await Student.count({ where: { suspended: true } });
    expect(totalSuspended).toBe(0);
  });

  test('suspend bob', async () => {
    const res = await request(api)
      .post('/api/suspend')
      .send({ student: 'bob@gmail.com' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(204);

    const { count: totalSuspended, rows: students } = await Student
      .findAndCountAll({ where: { suspended: true } });

    expect(totalSuspended).toBe(1);
    expect(students[0].email).toBe('bob@gmail.com');
  });
});

describe('teacher | retrieveForNotifications', () => {
  beforeAll(async () => {
    await clearData();

    /* test fixture */
    const teachers = await Promise.all(_.map([
      { email: 'benleong@hotmail.com' },
      { email: 'ken@hotmail.com' },
      { email: 'ryu@hotmail.com' },
    ], (d) => Teacher.create(d)));

    const students = await Promise.all(_.map([
      { email: 'bob@gmail.com' },
      { email: 'jane@gmail.com', suspended: true },
      { email: 'eric@gmail.com' },
      { email: 'nancy@gmail.com', suspended: true },
      { email: 'tracy@gmail.com' },
      { email: 'miko@gmail.com' },
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

  test('invalid teacher', async () => {
    const res = await request(api)
      .post('/api/retrievefornotifications')
      .send({
        teacher: 'invalid@hotmail.com',
        notification: '... hello ... @bob@gmail.com @jane@gmail.com @nancy@gmail.com @tracy@gmail.com @moko@gmail.com @miko@gmail.com',
      })
      .set('Content-Type', 'application/json');

    expect(res.body).toStrictEqual({ message: 'teacher email is not registered' });
    expect(res.status).toBe(400);
  });

  test('retrieve for notifications', async () => {
    const res = await request(api)
      .post('/api/retrievefornotifications')
      .send({
        teacher: 'benleong@hotmail.com',
        notification: '... hello ... @bob@gmail.com @nancy@gmail.com @tracy@gmail.com @moko@gmail.com @miko@gmail.com',
      })
      .set('Content-Type', 'application/json');

    expect(res.body).toStrictEqual({
      recipients: [
        'bob@gmail.com',
        'eric@gmail.com',
        'miko@gmail.com',
        'tracy@gmail.com',
      ],
    });
    expect(res.status).toBe(200);
  });
});
