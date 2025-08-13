const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Database setup
const db = new sqlite3.Database('./data/users.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Hidden table with the flag - accessible via SQL injection
  // This table contains the challenge flag that can be extracted through SQL injection
  db.run(`CREATE TABLE IF NOT EXISTS secret_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flag_name TEXT NOT NULL,
    flag_value TEXT NOT NULL,
    description TEXT
  )`);

  // Insert the flag if it doesn't exist
  // The flag ninja{sql_injection_sucessful_} is hidden here for the challenge
  db.run(`INSERT OR IGNORE INTO secret_flags (flag_name, flag_value, description) VALUES ('sql_injection', 'ninja{sql_injection_sucessful_}', 'SQL Injection Challenge Flag')`);

  // Hidden table with the command injection flag
  db.run(`CREATE TABLE IF NOT EXISTS command_injection_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flag_name TEXT NOT NULL,
    flag_value TEXT NOT NULL,
    description TEXT
  )`);

  // Insert the command injection flag
  db.run(`INSERT OR IGNORE INTO command_injection_flags (flag_name, flag_value, description) VALUES ('command_injection', 'ninja{command_injection_successful_}', 'Command Injection Challenge Flag')`);

  // Hidden table with the XSS flag
  db.run(`CREATE TABLE IF NOT EXISTS xss_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flag_name TEXT NOT NULL,
    flag_value TEXT NOT NULL,
    description TEXT
  )`);

  // Insert the XSS flag
  db.run(`INSERT OR IGNORE INTO xss_flags (flag_name, flag_value, description) VALUES ('xss', 'ninja{xss_vulnerability_exploited_}', 'XSS Challenge Flag')`);

  // Hidden table with the file upload flag
  db.run(`CREATE TABLE IF NOT EXISTS file_upload_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flag_name TEXT NOT NULL,
    flag_value TEXT NOT NULL,
    description TEXT
  )`);

  // Insert the file upload flag
  db.run(`INSERT OR IGNORE INTO file_upload_flags (flag_name, flag_value, description) VALUES ('file_upload', 'ninja{file_upload_vulnerability_exploited_}', 'File Upload Challenge Flag')`);
  
  // Create default guest user
  bcrypt.hash('guest', 10).then(hashedPassword => {
    db.run(`INSERT OR IGNORE INTO users (username, email, password, created_at) VALUES ('guest', 'guest@example.com', ?, datetime('now'))`, [hashedPassword]);
  });
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
        res.json({ 
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, username, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  });
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  });
});

// Upload file
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, filename, size, path: filePath } = req.file;
    
    // VULNERABLE: No file type validation - allows any file type including executables
    // This allows file upload attacks - DO NOT USE IN PRODUCTION!
    
    db.run(
      'INSERT INTO files (user_id, filename, original_name, file_path, file_size) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, filename, originalname, filePath, size],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
          message: 'File uploaded successfully',
          file: {
            id: this.lastID,
            filename,
            original_name: originalname,
            file_size: size
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Vulnerable file processing endpoint - allows execution of uploaded files
// This endpoint is intentionally vulnerable to demonstrate file upload attacks
// The flag ninja{file_upload_vulnerability_exploited_} can be extracted from the file_upload_flags table
app.get('/api/process-file/:filename', authenticateToken, (req, res) => {
  const { filename } = req.params;
  
  db.get(
    'SELECT * FROM files WHERE filename = ? AND user_id = ?',
    [filename, req.user.id],
    (err, file) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      const filePath = path.join(__dirname, '..', file.file_path);

      // VULNERABLE: Direct file execution without proper validation
      // This allows execution of malicious uploaded files - DO NOT USE IN PRODUCTION!
      const { exec } = require('child_process');

      // Try to execute the file directly first. If that fails (permissions, shebang, etc),
      // attempt to run it via a shell to make exploitation easier for the exercise.
      exec(`"${filePath}"`, (error, stdout, stderr) => {
        if (error) {
          // Fallback: execute via POSIX shell. This increases exploitability by design.
          exec(`sh "${filePath}"`, (shErr, shStdout, shStderr) => {
            if (shErr) {
              return res.status(500).json({
                error: 'File execution failed',
                details: shErr.message,
                note: 'This endpoint is vulnerable to file upload attacks'
              });
            }
            return res.json({
              message: 'File processed successfully (via shell)',
              output: shStdout,
              error: shStderr,
              warning: 'This endpoint executed the uploaded file - SECURITY RISK!'
            });
          });
          return;
        }

        res.json({
          message: 'File processed successfully',
          output: stdout,
          error: stderr,
          warning: 'This endpoint executed the uploaded file - SECURITY RISK!'
        });
      });
    }
  );
});

// Get user files
app.get('/api/files', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, filename, original_name, file_size, upload_date FROM files WHERE user_id = ? ORDER BY upload_date DESC',
    [req.user.id],
    (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(files);
    }
  );
});

// Search files - VULNERABLE TO SQL INJECTION
// This endpoint is intentionally vulnerable to demonstrate SQL injection attacks
// The flag ninja{sql_injection_sucessful_} can be extracted from the secret_flags table
app.get('/api/search', authenticateToken, (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  // VULNERABLE: Direct string concatenation instead of parameterized query
  // This allows SQL injection attacks - DO NOT USE IN PRODUCTION!
  const sqlQuery = `SELECT id, filename, original_name, file_size, upload_date FROM files WHERE user_id = ${req.user.id} AND (original_name LIKE '%${query}%' OR filename LIKE '%${query}%') ORDER BY upload_date DESC`;
  
  db.all(sqlQuery, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(files);
  });
});

// Command Injection Vulnerability - VULNERABLE TO COMMAND INJECTION
// This endpoint is intentionally vulnerable to demonstrate command injection attacks
// The flag ninja{command_injection_successful_} can be extracted from the command_injection_flags table
app.get('/api/system-info', authenticateToken, (req, res) => {
  const { command } = req.query;
  
  if (!command) {
    return res.status(400).json({ error: 'Command parameter is required' });
  }

  // VULNERABLE: Direct command execution without sanitization
  // This allows command injection attacks - DO NOT USE IN PRODUCTION!
  const { exec } = require('child_process');
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Command execution failed', details: error.message });
    }
    
    res.json({
      command: command,
      output: stdout,
      error: stderr
    });
  });
});

// Download file
app.get('/api/download/:filename', authenticateToken, (req, res) => {
  const { filename } = req.params;
  
  db.get(
    'SELECT * FROM files WHERE filename = ? AND user_id = ?',
    [filename, req.user.id],
    (err, file) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      const filePath = path.join(__dirname, '..', file.file_path);
      res.download(filePath, file.original_name);
    }
  );
});

// Delete file
app.delete('/api/files/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(
    'SELECT * FROM files WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, file) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Delete file from filesystem
      const filePath = path.join(__dirname, '..', file.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from database
      db.run('DELETE FROM files WHERE id = ?', [id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ message: 'File deleted successfully' });
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
