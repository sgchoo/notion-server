const express = require('express')
const { getCalendarList, createPage } = require('./services/notion')
const PORT = process.env.PORT || 3000

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const app = express()

/**
 * 노션 캘린더 데이터 가져오기
 */
app.get('/calendars', async(req, res) => {
    const calendars = await getCalendarList()
    res.json(calendars);
})

app.post('/calendar', jsonParser, async (req, res) => {
    console.log(req.body);
    const { name, startDate, endDate, tags} = req.body;
  
    try {
      const posting = await createPage(name, startDate, endDate, tags);
      res.json(posting);
    } catch (err) {
      console.log(err);
    }
  });

app.listen(PORT, console.log(`Server started on port ${PORT}`))