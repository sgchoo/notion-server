const dotenv = require('dotenv').config()
const { Client } = require('@notionhq/client')
const schedule = require('node-schedule');

const notion = new Client({
    auth: process.env.NOTION_SECRET_TOKEN
})
const database_todo_id = process.env.NOTION_TODO_DATABASE;
const database_schedule_id = process.env.NOTION_SCHEDULES_DATABASE;

module.exports.getCalendarList = async function getCalendarList() {
    const {results} = await notion.databases.query({
        database_id: database_schedule_id
    })
    const calendar = results.map((page) => {
      console.log(page)
      // console.log(page.날짜);
      // console.log(page.태그.multi_select);
      // console.log(page.이름.title);
      return {
        id: page.id,
        title: page.properties.이름.title[0].plain_text,
        date: page.properties.날짜.date,
        tags: page.properties.태그,
      //   tags: page.properties.Tags.rich_text[0].text.content,
      //   description: page.properties.Description.rich_text[0].text.content,
      };
    });
    console.log(calendar);
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
        // 태그: {
        //   rich_text: [
        //     {
        //       text: {
        //         content: tags,
        //       },
        //     },
        //   ],
        // },
        // Description: {
        //   rich_text: [
        //     {
        //       text: {
        //         content: description,
        //       },
        //     },
        //   ],
        // },
      },
    });
    return response;
};

const job = schedule.scheduleJob('* * * * *', async () => {
  console.log('매 분 작업 실행 중...');
  const data = await this.getCalendarList();

  console.log(data);
})