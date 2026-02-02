const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/database');
const swaggerSpec = require('./swagger');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const commentRoutes = require('./routes/commentRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const dbRoutes = require('./routes/dbRoutes');


const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/swagger.json', (req, res) => res.status(200).json(swaggerSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/weather', weatherRoutes);


app.use('/db', dbRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'EventPlanner Pro API is running' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
