#!/usr/bin/env node
/**
 * Test script to verify GraphQL backend is working
 * Run with: node test-backend.mjs
 */

import axios from 'axios';

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

async function testBackend() {
  console.log('🧪 Testing GraphQL Backend...\n');

  try {
    console.log(`📡 Connecting to ${GRAPHQL_ENDPOINT}...\n`);

    // Test 1: Get available courses (without auth)
    console.log('Test 1: Query getAvailableCourses (without token)');
    const query1 = `
      query {
        getAvailableCourses {
          id
          name
          faculty
        }
      }
    `;

    const response1 = await axios.post(GRAPHQL_ENDPOINT, { query: query1 });
    
    if (response1.data.errors) {
      console.log('❌ Error:', response1.data.errors[0].message);
    } else {
      console.log('✅ Success! Available courses:');
      console.log(JSON.stringify(response1.data.data.getAvailableCourses, null, 2));
    }

    console.log('\n---\n');

    // Test 2: Get registered courses (without auth)
    console.log('Test 2: Query getRegisteredCourses (without token)');
    const query2 = `
      query {
        getRegisteredCourses {
          id
          name
          faculty
        }
      }
    `;

    const response2 = await axios.post(GRAPHQL_ENDPOINT, { query: query2 });
    
    if (response2.data.errors) {
      console.log('❌ Error:', response2.data.errors[0].message);
    } else {
      console.log('✅ Success! Registered courses:');
      console.log(JSON.stringify(response2.data.data.getRegisteredCourses, null, 2));
    }

  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.log('\n⚠️  Make sure the backend server is running on port 4000');
    console.log('   Run: npm run dev (in webserver folder)');
  }
}

testBackend();
