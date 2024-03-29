const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const serverless = require('serverless-http');
const sendEmail = require('./sendEmail');
const app = express(); // Declare app before using it

dotenv.config();
app.use(cors());
app.use(bodyParser.json());

const port = 8000;


// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
   connectionLimit: 1000,
    connectTimeout: 60 * 60 * 1000,
    queueLimit: 30,
});


let contacts = [];
let quotes = [];

app.post('/api/contacts', async (req, res) => {
  const newContact = req.body;
  const contactId = uuidv4();

  try {
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO contacts (id, firstName, lastName, email, phoneNo, organisation, message) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [
         contactId,
         newContact.firstName,
         newContact.lastName,
         newContact.email,
         newContact.phoneNo,
         newContact.organisation,
         newContact.message
            ]);
    connection.release();
    newContact.id = contactId; 
    await sendEmail({
      type: 'contact',
      subject: 'EmpireBio',
      firstName: newContact.firstName,
      lastName: newContact.lastName,
      email: newContact.email,
      phoneNo: newContact.phoneNo,
      organisation: newContact.organisation,
      message: newContact.message,
    });
    
    res.json({ message: 'Contact created successfully', contact: newContact });
  } catch (error) {
    console.error('Error inserting contact into database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/quote', async (req, res) => {
  const newQuote = req.body;
  const quoteId = uuidv4();

  try {
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO quotes (id, firstName, lastName, email, phoneNo, organisation, destination, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [
        quoteId,
        newQuote.firstName,
        newQuote.lastName,
        newQuote.email,
        newQuote.phoneNo,
        newQuote.organisation,
        newQuote.destination,
        newQuote.message
      ]);
    connection.release();
    newQuote.id = quoteId; 
    quotes.push(newQuote);

    await sendEmail({
      type: 'quote',
      subject: 'EmpireBio',
      firstName: newQuote.firstName,
      lastName: newQuote.lastName,
      email: newQuote.email,
      phoneNo: newQuote.phoneNo,
      organisation: newQuote.organisation,
      message: newQuote.message, 
    });

    res.json({ message: 'Quote created successfully', quote: newQuote });
  } catch (error) {
    console.error('Error inserting quote into database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

let schedules  = [];
app.post('/api/schedule', async (req, res) => {
  const newSchedule = req.body;
  const scheduleId = uuidv4();

  try {
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO schedule (id, firstName, lastName, email, phoneNo, organisation, destination, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [
        scheduleId,
        newSchedule.firstName,
        newSchedule.lastName,
        newSchedule.email,
        newSchedule.phoneNo,
        newSchedule.organisation,
        newSchedule.destination,
        newSchedule.message
      ]);
    connection.release();

    newSchedule.id = scheduleId; 
    schedules.push(newSchedule);
    await sendEmail({
      type: 'schedule',
      subject: 'EmpireBio',
      firstName: newSchedule.firstName,
      lastName: newSchedule.lastName,
      email: newSchedule.email,
      phoneNo: newSchedule.phoneNo,
      organisation: newSchedule.organisation,
      message: newSchedule.message, 
    });
    res.json({ message: 'schedule created successfully', schedule: newSchedule });
  } catch (error) {
    console.error('Error inserting quote into database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
module.exports.handler = serverless(app);