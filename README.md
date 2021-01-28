
#  Teacher Administration API

  

For GovTech DCUBE team's review.

  

##  Local Development Setup

  

Clone the project:

  

```sh

$ git clone https://github.com/kakarukeys/teacher-admin.git

```

  

You need MySQL database server (v5.7+), node and yarn (recommended versions in `package.json`). Instructions for installing MySQL locally on Mac OS:

  

```sh

$ brew install mysql

$ brew services start mysql

$ mysql_secure_installation

```

  

Create the follow user and databases:

  

```sql

CREATE USER 'expressjs'@'localhost' IDENTIFIED BY  'abcd1234#';

CREATE  DATABASE teacher_admin_db CHARACTER  SET utf8;

CREATE  DATABASE test_teacher_admin_db CHARACTER  SET utf8;

GRANT ALL PRIVILEGES ON teacher_admin_db.*  TO  'expressjs'@'localhost';

GRANT ALL PRIVILEGES ON test_teacher_admin_db.*  TO  'expressjs'@'localhost';

```

  

To set up the project for local development:

  

```sh

$ cd teacher-admin

$ yarn

$ npx sequelize-cli db:migrate

$ yarn start

```

  

Navigate to `http://localhost:5000/public/ping`, you should see a response.

  

To run unit tests:

  

```sh

$ yarn test

```

  

To deploy to production:

  

```sh

$ git remote add dokku dokku@app.reconnify.com:teacher-admin.reconnify.com

$ git push dokku master

```

  

Production URL: https://teacher-admin.reconnify.com

  

##  Notes

  

1. No User resource, authentication, authorization is implemented. All APIs are accessible by public.

2. The tech stack I choose: MySQL-Express-Node-Nginx. The programming language is JS (not typescript).

3. There is no requirement on the creation of students and teachers from APIs, i.e. no Teacher or Student Resource endpoints. So test data will have to be inserted to the database using fixtures.

4. In user story 1(teachers & students),3(student),4(teacher) if any teacher or student email does not exist in db, the API returns error 400. If an non-existing email is used in a query string or mention, it will be ignored instead.

5. There is no Notification data persistence, since it's not in the scope, hence no Notification model.

6. Error response codes. I make use of the default behavior of the framework to supply the codes 400x, 500x, and build any custom errors on top of the default behavior.

7. Normally, mentions in notifications are identified on the client side using autocompletion before sending to the server, and the server receives only the exact ids of the mentioned persons, so that no parsing is required on the server side. For this exercise, I am implementing the API as required. So I make these assumptions:

  

each mention is demarcated by `[WHITESPACE]@[EMAIL PATTERN][WHITESPACE OR end of message]`

`EMAIL PATTERN` follows the latest RFC, and I lean to the strict side when doing matching.

  

So below mention is considered invalid:

`........... @studentagnes@gmail.com@studentmiche@gmail.com`

  

If a mention does not correspond to any existing student's email, it will be ignored (no error).

  

##  LICENSE

  

MIT © Wong Jiang Fung
