const rewire = require('rewire');

const Wire = rewire('../../api/controllers/TeacherController');
const parseNotificationEmails = Wire.__get__('parseNotificationEmails'); // eslint-disable-line

test('parseNotificationEmails', async () => {
  let notiff = '';
  let emails = parseNotificationEmails(notiff);
  expect(emails).toEqual([]);

  notiff = 'the quick fox jumps';
  emails = parseNotificationEmails(notiff);
  expect(emails).toEqual([]);

  notiff = 'the quick @abc fox jumps';
  emails = parseNotificationEmails(notiff);
  expect(emails).toEqual([]);

  notiff = 'the quick @abc fox jumps @jane@gmail.com';
  emails = parseNotificationEmails(notiff);
  expect(emails).toEqual(['jane@gmail.com']);

  notiff = 'the quick @abc fox jumps @john@gmail.com @jane@gmail.com';
  emails = parseNotificationEmails(notiff);
  expect(emails).toEqual(['john@gmail.com', 'jane@gmail.com']);

  notiff = 'the quick @abc fox jumps   @john@gmail.com  @jane@gmail.com   ';
  emails = parseNotificationEmails(notiff);
  expect(emails).toEqual(['john@gmail.com', 'jane@gmail.com']);

  notiff = 'the quick @abc fox jumps   @john@gmail.com  @jane@gmail.com   ';
  emails = parseNotificationEmails(notiff);
  expect(emails).toEqual(['john@gmail.com', 'jane@gmail.com']);

  notiff = 'the quick @abc fox jumps @ jack@gmail.com  @john@gmail.com  @jane@gmail.com   ';
  emails = parseNotificationEmails(notiff);
  expect(emails).toEqual(['john@gmail.com', 'jane@gmail.com']);

  notiff = 'the quick @abc fox jumps @ jack@gmail.com   \t@john@gmail.com  \t@jane@gmail.com   ';
  emails = parseNotificationEmails(notiff);
  expect(emails).toEqual(['john@gmail.com', 'jane@gmail.com']);
});
