const dotenv = require('dotenv').config()
const { Client } = require('@notionhq/client')
const schedule = require('node-schedule');

const notion = new Client({
    auth: process.env.NOTION_SECRET_TOKEN || 'secret_vdTjF7R7pC39HsQ3Ee08HBk3FwrTrwVGpqfJGwdTi8T'
})
const database_todo_id = process.env.NOTION_TODO_DATABASE || 'f4b6421eb2744cd0a2e45c8647e3603a';
const database_schedule_id = 'f819516e02d64362ba2d0ac1637b5e03';

module.exports.getCalendarList = async function getCalendarList() {
    const {results} = await notion.databases.query({
        database_id: database_schedule_id
    })
    const calendar = results.map((page) => {
      return {
        id: page.id,
        title: page.properties.이름.title[0].plain_text,
        date: page.properties.날짜.date,
        tags: page.properties.태그.multi_select.map(tag => ({ name: tag.name })),
      };
    });
  return calendar;
}

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

const job = schedule.scheduleJob('* * * * *', async () => {
  console.log('매 분 작업 실행 중...');
  const data = await this.getCalendarList();

  // console.log(data);

  for (const item of data) {
    await this.createPage(item.title, item.date.start, item.date.end, item.tags);
  };
})