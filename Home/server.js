require('dotenv').config();
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Enhanced middleware setup
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.static('views'));
app.use('/components', express.static('components'));
app.use('/utils', express.static('utils'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Enhanced rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: 'Too many API requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const chatbotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit chatbot requests
  message: 'Too many chatbot requests, please try again late.',
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Load Gemini API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Check if the API key is loaded
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is not defined in the .env file. Please add it and restart the server.');
  process.exit(1); // Exit the process if the API key is missing
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


const MONGO_KEY=process.env.MONGODB_CONNECTION;
// MongoDB connection
mongoose.connect(MONGO_KEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// Multer setup for file uploads (Excel)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Nodemailer setup for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nsscertificiate@gmail.com',
    pass: 'wbdabtpouudmwowk',
  },
});

// Middleware to check authentication
function authenticate(req, res, next) {
  const { userName, userEmail } = req.cookies;
  if (!userName || !userEmail) return res.redirect('/');
  next();
}

// Enhanced API endpoints

// Dashboard analytics endpoint
app.get('/api/analytics', authenticate, async (req, res) => {
  try {
    const students = await Student.find({});
    
    const analytics = {
      totalStudents: students.length,
      totalHours: students.reduce((sum, s) => sum + s.hoursWorked, 0),
      activeVolunteers: students.filter(s => s.hoursWorked > 0).length,
      averageHours: students.length > 0 ? 
        Math.round(students.reduce((sum, s) => sum + s.hoursWorked, 0) / students.length) : 0,
      completionRate: students.length > 0 ? 
        Math.round((students.filter(s => s.hoursWorked >= 120).length / students.length) * 100) : 0,
      
      // Department breakdown
      departmentStats: students.reduce((acc, student) => {
        const dept = student.department || 'Unknown';
        if (!acc[dept]) {
          acc[dept] = { count: 0, totalHours: 0, averageHours: 0 };
        }
        acc[dept].count++;
        acc[dept].totalHours += student.hoursWorked;
        acc[dept].averageHours = Math.round(acc[dept].totalHours / acc[dept].count);
        return acc;
      }, {}),
      
      // Year breakdown
      yearStats: students.reduce((acc, student) => {
        const year = student.year || 'Unknown';
        if (!acc[year]) {
          acc[year] = { count: 0, totalHours: 0, averageHours: 0 };
        }
        acc[year].count++;
        acc[year].totalHours += student.hoursWorked;
        acc[year].averageHours = Math.round(acc[year].totalHours / acc[year].count);
        return acc;
      }, {}),
      
      // Progress distribution
      progressDistribution: {
        '0 Hours': students.filter(s => s.hoursWorked === 0).length,
        '1-30 Hours': students.filter(s => s.hoursWorked > 0 && s.hoursWorked <= 30).length,
        '31-60 Hours': students.filter(s => s.hoursWorked > 30 && s.hoursWorked <= 60).length,
        '61-90 Hours': students.filter(s => s.hoursWorked > 60 && s.hoursWorked <= 90).length,
        '91-120 Hours': students.filter(s => s.hoursWorked > 90 && s.hoursWorked <= 120).length,
        '120+ Hours': students.filter(s => s.hoursWorked > 120).length
      },
      
      lastUpdated: new Date().toISOString()
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Bulk operations endpoint
app.post('/api/bulk-operations', authenticate, async (req, res) => {
  try {
    const { operation, studentIds, data } = req.body;
    
    switch (operation) {
      case 'updateHours':
        await Student.updateMany(
          { rollNumber: { $in: studentIds } },
          { $inc: { hoursWorked: data.hours } }
        );
        break;
        
      case 'updateDepartment':
        await Student.updateMany(
          { rollNumber: { $in: studentIds } },
          { $set: { department: data.department } }
        );
        break;
        
      case 'updateYear':
        await Student.updateMany(
          { rollNumber: { $in: studentIds } },
          { $set: { year: data.year } }
        );
        break;
        
      case 'delete':
        await Student.deleteMany({ rollNumber: { $in: studentIds } });
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid operation' });
    }
    
    res.json({ success: true, message: `Bulk ${operation} completed successfully` });
  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(500).json({ error: 'Bulk operation failed' });
  }
});

// Search endpoint with advanced filtering
app.get('/api/search', authenticate, async (req, res) => {
  try {
    const { 
      query, 
      department, 
      year, 
      minHours, 
      maxHours, 
      sortBy = 'name', 
      sortOrder = 'asc',
      page = 1,
      limit = 50
    } = req.query;
    
    let filter = {};
    
    // Text search
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { rollNumber: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Filters
    if (department) filter.department = department;
    if (year) filter.year = parseInt(year);
    if (minHours) filter.hoursWorked = { ...filter.hoursWorked, $gte: parseInt(minHours) };
    if (maxHours) filter.hoursWorked = { ...filter.hoursWorked, $lte: parseInt(maxHours) };
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const students = await Student.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Student.countDocuments(filter);
    
    res.json({
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Export data in multiple formats
app.get('/api/export/:format', authenticate, async (req, res) => {
  try {
    const { format } = req.params;
    const students = await Student.find({});
    
    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=students.json');
        res.json(students);
        break;
        
      case 'csv':
        const csvData = students.map(s => ({
          'Roll Number': s.rollNumber,
          'Name': s.name,
          'Department': s.department,
          'Year': s.year,
          'Hours Worked': s.hoursWorked,
          'Email': s.email || ''
        }));
        
        const csv = [
          Object.keys(csvData[0]).join(','),
          ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
        res.send(csv);
        break;
        
      case 'xlsx':
        const worksheet = xlsx.utils.json_to_sheet(students.map(s => ({
          'Roll Number': s.rollNumber,
          'Name': s.name,
          'Department': s.department,
          'Year': s.year,
          'Hours Worked': s.hoursWorked,
          'Email': s.email || ''
        })));
        
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
        
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
        res.send(buffer);
        break;
        
      default:
        res.status(400).json({ error: 'Unsupported format' });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'LoginPage.html'));
});

// 📁 Excel Upload & Download Routes
app.post('/upload-excel', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (let record of sheet) {
      await Student.updateOne(
        { rollNumber: record['Roll Number'] },
        {
          $set: {
            name: record['Name'],
            department: record['Department'],
            year: record['Year'],
            email: record['Email'],
          },
          $inc: { hoursWorked: record['Hours Worked'] || 0 },
        },
        { upsert: true }
      );
    }

    res.status(200).send('Excel data uploaded and stored in the portal successfully!');
  } catch (error) {
    console.error('Error uploading Excel:', error);
    res.status(500).send('Failed to upload and store Excel data.');
  }
});

app.get('/download-excel', authenticate, async (req, res) => {
  try {
    const students = await Student.find({}, { _id: 0, __v: 0 }).lean();
    if (!students.length) return res.status(404).send('No student data found.');

    const worksheet = xlsx.utils.json_to_sheet(students);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename*=UTF-8\'\'students_data.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.write(excelBuffer);
    res.end();
  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).send('Failed to download Excel file.');
  }
});

// User Authentication Routes
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.redirect('/?error=Username does not exist. Please try again.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.cookie('userName', user.name, { maxAge: 3600000, path: '/' });
      res.cookie('userEmail', user.email, { maxAge: 3600000, path: '/' });
      res.redirect('/homepage');
    } else {
      res.redirect('/?error=Incorrect password. Please try again.');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.redirect('/?error=Internal Server Error. Please try again later.');
  }
});

app.get('/homepage', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/receipts', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname,'views', 'receipts.html'));
});

// Attendance and Student Routes
app.post('/api/upload-attendance', authenticate, async (req, res) => {
  try {
    const { students, hours } = req.body;

    if (!students || !Array.isArray(students) || isNaN(hours)) {
      return res.status(400).send('Invalid data received.');
    }

    for (let rollNumber of students) {
      await Student.updateOne(
        { rollNumber: rollNumber.trim() },
        { $inc: { hoursWorked: hours } },
        { upsert: true }
      );
    }

    res.status(200).send('Attendance marked successfully!');
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).send('Failed to mark attendance.');
  }
});

app.get('/excel', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'excel.html'));
});

app.get('/download-attendance', authenticate, async (req, res) => {
  try {
    const students = await Student.find({});
    const data = students.map(student => ({
      'Roll Number': student.rollNumber,
      'Name': student.name,
      'Department': student.department,
      'Year': student.year,
      'Hours Worked': student.hoursWorked,
    }));

    const worksheet = xlsx.utils.sheet_to_json(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error downloading attendance:', error);
    res.status(500).send('Failed to download attendance.');
  }
});

app.get('/attendance', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'add_attendance.html'));
});

app.get('/scanner', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'scanner.html'));
});

app.get('/details', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'student_details.html'));
});

app.get('/api/students', authenticate, async (req, res) => {
  try {
    const students = await Student.find({});
    console.log('Students fetched from studentsv2:', students);
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Failed to fetch student details.');
  }
});

// Send OD List to Student Welfare
app.post('/api/send-od-list', authenticate, upload.single('excelFile'), async (req, res) => {
  try {
    const { eventName, eventDate, eventTime } = req.body;
    if (!req.file) return res.status(400).send('No Excel file provided.');

    const mailOptions = {
      from: 'nsscertificiate@gmail.com',
      to: 'keshavs100605@gmail.com',
      subject: `OD List for Event: ${eventName}`,
      text: `Dear Student Welfare Team,\n\nThis email contains the OD list for the event "${eventName}" held on ${eventDate} at ${eventTime}.\n\nPlease find the Excel file attached for your reference.\n\nBest regards,\nNSS Amrita Unit 3`,
      attachments: [
        {
          filename: 'OD_List.xlsx',
          content: req.file.buffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`OD list email sent successfully to keshavs100605@gmail.com for event ${eventName}`);
    res.status(200).send('OD list sent successfully to Student Welfare!');
  } catch (error) {
    console.error('Error sending OD list email:', error);
    res.status(500).send('Failed to send OD list email.');
  }
});

// Send Certificate Route
app.post('/api/send-certificate', authenticate, async (req, res) => {
  const { email, name, hours } = req.body;

  console.log('Request body:', req.body);

  if (!email || !name || !hours || email === 'undefined') {
    console.error('Invalid or missing required fields:', { email, name, hours });
    return res.status(400).send('Invalid or missing required fields: email, name, or hours.');
  }

  const mailOptions = {
    from: 'nsscertificiate@gmail.com',
    to: email,
    subject: `Certificate of Participation for ${name}`,
    text: `Dear ${name},\n\nCongratulations! You have successfully completed ${hours} hours of service.\n\nBest regards,\nNSS Amrita Unit 3`,
    attachments: [
      {
        filename: 'certificate.pdf',
        path: path.join(__dirname, 'cert', 'certificate.pdf')
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Certificate email sent successfully to ${email}`);
    res.status(200).send('Certificate sent successfully!');
  } catch (error) {
    console.error('Error sending certificate email:', error);
    res.status(500).send('Failed to send certificate email.');
  }
});

// Leaderboard Routes
app.get('/leaders', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'leaderboard.html'));
});

app.get('/api/leaderboard', authenticate, async (req, res) => {
  try {
    const topStudents = await Student.find({})
      .sort({ hoursWorked: -1 })
      .limit(5);
    res.status(200).json(topStudents);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).send('Failed to fetch leaderboard data.');
  }
});

// Chatbot Endpoint with Rate Limiting
app.post('/api/chatbot', authenticate, chatbotLimiter, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Enhanced system prompt for better responses
    const systemPrompt = `You are an expert NSS (National Service Scheme) assistant with deep knowledge of:
    
    1. Event Planning & Management:
       - Tree plantation drives, blood donation camps, cleanliness campaigns
       - Community awareness programs, health camps, literacy drives
       - Disaster relief activities, environmental conservation projects
    
    2. Administrative Support:
       - Student registration and attendance tracking
       - Certificate generation and distribution
       - Progress monitoring and reporting
    
    3. Best Practices:
       - Volunteer coordination and motivation
       - Community engagement strategies
       - Safety protocols and risk management
    
    Provide practical, actionable advice with specific steps, timelines, and resource requirements. 
    Keep responses concise but comprehensive, focusing on implementation details.`;

    // Combine the system prompt and user message
    const prompt = `${systemPrompt}\n\nUser: ${message}`;

    // Make a request to the Gemini API
    const result = await model.generateContent(prompt, {
      maxOutputTokens: 300, // Increased for more detailed responses
      temperature: 0.7, // Control creativity
    });

    // Extract the response text
    let reply = result.response.text();

    // Process the response for better formatting
    // 1. Replace **text** with <strong>text</strong> for bold
    reply = reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 2. Replace double newlines with <br><br> for paragraph spacing
    reply = reply.replace(/\n\n/g, '<br><br>');

    // 3. Replace single newlines with <br> for line breaks
    reply = reply.replace(/\n/g, '<br>');

    // 4. Replace hyphens at the start of a line with a bullet point (e.g., "- Item" becomes "• Item")
    reply = reply.replace(/(^|\n)- /g, '$1• ');
    
    // 5. Format numbered lists
    reply = reply.replace(/(\d+)\.\s/g, '<strong>$1.</strong> ');

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error with Gemini API:', error.message);
    res.status(500).json({ error: 'Failed to get response from chatbot' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0'
  });
});

// System info endpoint (admin only)
app.get('/api/system-info', authenticate, async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const userCount = await User.countDocuments();
    
    res.json({
      database: {
        students: studentCount,
        users: userCount,
        connected: mongoose.connection.readyState === 1
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching system info:', error);
    res.status(500).json({ error: 'Failed to fetch system information' });
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

// Mongoose Schemas and Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const studentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: Number, required: true },
  hoursWorked: { type: Number, default: 0 },
  email: { type: String },
});

const User = mongoose.model('User', userSchema);
const Student = mongoose.model('Student', studentSchema, 'studentsv2');