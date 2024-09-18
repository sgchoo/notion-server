const dotenv = require('dotenv').config();
const { Client } = require('@notionhq/client');
const schedule = require('node-schedule');

// const notion = new Client({
//     auth: process.env.NOTION_SECRET_TOKEN || 'secret_vdTjF7R7pC39HsQ3Ee08HBk3FwrTrwVGpqfJGwdTi8T'
// })
// const database_todo_id = process.env.NOTION_TODO_DATABASE || 'f4b6421eb2744cd0a2e45c8647e3603a';
// const database_schedule_id = 'f819516e02d64362ba2d0ac1637b5e03';

let notion;
let database_todo_id;
let database_schedule_id;

module.exports.getCalendarList = async function getCalendarList() {
  const { results } = await notion.databases.query({
    database_id: database_schedule_id
  });
  const calendar = results.map((page) => {
    return {
      id: page.id,
      title: page.properties.이름.title[0].plain_text,
      date: page.properties.날짜.date,
      tags: page.properties.태그.multi_select.map(tag => ({ name: tag.name })),
    };
  });
  return calendar;
};

module.exports.getTodoList = async function getTodoList() {
  const { results } = await notion.databases.query({
    database_id: database_todo_id
  });
  const todoList = results.map((page) => {
    return {
      id: page.id,
      title: page.properties.이름.title[0].plain_text,
      date: page.properties.날짜.date,
      tags: page.properties.태그.multi_select.map(tag => ({ name: tag.name })),
    };
  });
  return todoList;
};

module.exports.createPage = async function createPage(
    name,
    startDate,
    endDate,
    tags,
  ) {
    const response = await notion.pages.create({
      parent: { database_id: database_todo_id },
      properties: {
        이름: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        날짜: {
          date: {
            start: startDate,
            end: endDate,
          },
        },
        태그: {
          multi_select: tags,
        },
      },
    });
    return response;
};

module.exports.initialize = async function initialize(notionToken, todoDatabaseId, scheduleDatabaseId) {
  notion = new Client({ auth: notionToken });
  database_todo_id = todoDatabaseId;
  database_schedule_id = scheduleDatabaseId;

  console.log('Notion client initialized');
  console.log('Notion Token:', notionToken);
  console.log('TODO Database ID:', todoDatabaseId);
  console.log('Schedule Database ID:', scheduleDatabaseId);

  let jobExist = false;

  // 오늘 8시부터 9시 사이에 한 번 실행 (UTC 기준)
  const job = schedule.scheduleJob('0 10 1 * *', async () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 8 && hour < 23 && !jobExist) {
      const calendarData = await module.exports.getCalendarList();
      const todoData = await module.exports.getTodoList();

      console.log('calendarData:', calendarData);
  
        // TODO 데이터베이스에 없는 일정 데이터만 삽입
        for (const item of calendarData) {
          const isDuplicate = todoData.some(todo => 
            todo.title === item.title && 
            todo.date.start === item.date.start && 
            todo.date.end === item.date.end
          );
  
          if (!isDuplicate) {
            await module.exports.createPage(item.title, item.date.start, item.date.end, item.tags);
          }
        }

      // 작업이 실행된 후에는 다음 실행을 방지하기 위해 jobExist를 true로 설정
      jobExist = true;
    }
  });

  console.log('Job scheduled');
};