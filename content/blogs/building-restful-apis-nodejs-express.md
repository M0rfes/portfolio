---
title: "Building RESTful APIs with Node.js and Express"
coverImage: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1200&h=630&fit=crop"
excerpt: "Learn how to build robust and scalable RESTful APIs using Node.js and Express. From basic setup to advanced middleware and error handling."
date: "2024-01-10"
keywords:
  - nodejs
  - express
  - api
  - rest
  - backend
  - javascript
  - webdevelopment
  - server
  - middleware
---

Building RESTful APIs is a fundamental skill for backend developers. In this tutorial, we'll create a complete REST API using Node.js and Express, following best practices and industry standards.

## What is a RESTful API?

REST (Representational State Transfer) is an architectural style for designing networked applications. RESTful APIs use HTTP methods to perform CRUD operations:

- **GET**: Retrieve data
- **POST**: Create new data
- **PUT/PATCH**: Update existing data
- **DELETE**: Remove data

## Setting Up the Project

First, let's initialize a new Node.js project:

```bash
mkdir my-api
cd my-api
npm init -y
npm install express dotenv
npm install --save-dev nodemon typescript @types/node @types/express
```

Create a basic Express server:

```javascript
// src/index.js
const express = require('express');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Creating Routes

Let's create a simple CRUD API for managing users:

```javascript
// src/routes/users.js
const express = require('express');
const router = express.Router();

// In-memory storage (use a database in production)
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
];

// GET all users
router.get('/', (req, res) => {
  res.json(users);
});

// GET user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

// POST create new user
router.post('/', (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT update user
router.put('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  res.json(user);
});

// DELETE user
router.delete('/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  users.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
```

Mount the routes in your main app:

```javascript
// src/index.js
const userRoutes = require('./routes/users');

app.use('/api/users', userRoutes);
```

## Middleware

Middleware functions have access to the request and response objects. Let's create some useful middleware:

### Logger Middleware

```javascript
// src/middleware/logger.js
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
};

module.exports = logger;
```

### Authentication Middleware

```javascript
// src/middleware/auth.js
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Verify token (simplified example)
  if (token !== 'valid-token') {
    return res.status(403).json({ message: 'Invalid token' });
  }
  
  next();
};

module.exports = authenticate;
```

Apply middleware:

```javascript
const logger = require('./middleware/logger');
const authenticate = require('./middleware/auth');

app.use(logger);
app.use('/api', authenticate); // Protect all /api routes
```

## Error Handling

Implement centralized error handling:

```javascript
// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

Use it in your app:

```javascript
// This should be the last middleware
app.use(errorHandler);
```

## Input Validation

Validate incoming data using express-validator:

```bash
npm install express-validator
```

```javascript
const { body, validationResult } = require('express-validator');

router.post('/',
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Create user logic here
  }
);
```

## Database Integration

Connect to MongoDB using Mongoose:

```bash
npm install mongoose
```

```javascript
// src/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

Define a model:

```javascript
// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

## Best Practices

1. **Use Environment Variables**: Store sensitive data in `.env` files
2. **Implement Rate Limiting**: Prevent abuse with rate limiting
3. **Use CORS**: Configure CORS for cross-origin requests
4. **Add Compression**: Use gzip compression for responses
5. **Implement Logging**: Use proper logging libraries like Winston
6. **API Versioning**: Version your API endpoints (e.g., `/api/v1/users`)
7. **Documentation**: Use Swagger/OpenAPI for API documentation
8. **Security**: Use Helmet.js to set security headers

## Testing

Test your API using Jest and Supertest:

```bash
npm install --save-dev jest supertest
```

```javascript
// src/__tests__/users.test.js
const request = require('supertest');
const app = require('../index');

describe('User API', () => {
  it('should get all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBeTruthy();
  });
  
  it('should create a new user', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com'
    };
    
    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(newUser.name);
  });
});
```

## Conclusion

Building RESTful APIs with Node.js and Express is straightforward when following best practices. Remember to:

- Structure your code properly
- Implement proper error handling
- Validate all inputs
- Secure your API
- Write tests
- Document your endpoints

With these fundamentals, you're ready to build production-ready APIs!
