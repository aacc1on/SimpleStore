// test-api.js
const axios = require('axios');

// API base URL
const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpassword123'
};

const testProduct = {
  name: 'Test Product',
  description: 'This is a test product',
  price: 29.99,
  category: 'Test Category',
  stock: 100
};

let authToken = '';
let createdProductId = null;

// Helper function to log test results
function logTest(testName, success, data = null) {
  const status = success ? '✅ PASSED' : '❌ FAILED';
  console.log(`${status}: ${testName}`);
  if (data) {
    console.log('Response:', JSON.stringify(data, null, 2));
  }
  console.log('---');
}

// Test functions
async function testHealthCheck() {
  try {
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/`);
    logTest('Health Check', response.status === 200, response.data);
    return true;
  } catch (error) {
    logTest('Health Check', false, error.message);
    return false;
  }
}

async function testUserRegistration() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    logTest('User Registration', response.status === 201, response.data);
    return true;
  } catch (error) {
    if (error.response?.status === 409) {
      logTest('User Registration', true, 'User already exists - this is expected');
      return true;
    }
    logTest('User Registration', false, error.response?.data || error.message);
    return false;
  }
}

async function testUserLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: testUser.username,
      password: testUser.password
    });
    
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      logTest('User Login', true, response.data);
      return true;
    }
    
    logTest('User Login', false, 'No token received');
    return false;
  } catch (error) {
    logTest('User Login', false, error.response?.data || error.message);
    return false;
  }
}

async function testAdminLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      logTest('Admin Login', true, response.data);
      return true;
    }
    
    logTest('Admin Login', false, 'No token received');
    return false;
  } catch (error) {
    logTest('Admin Login', false, error.response?.data || error.message);
    return false;
  }
}

async function testGetAllProducts() {
  try {
    const response = await axios.get(`${BASE_URL}/products`);
    logTest('Get All Products', response.status === 200, {
      count: response.data.count,
      products: response.data.products?.length ? 'Products found' : 'No products'
    });
    return true;
  } catch (error) {
    logTest('Get All Products', false, error.response?.data || error.message);
    return false;
  }
}

async function testCreateProduct() {
  try {
    const response = await axios.post(`${BASE_URL}/products`, testProduct, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.status === 201) {
      createdProductId = response.data.product.id;
      logTest('Create Product', true, response.data);
      return true;
    }
    
    logTest('Create Product', false, 'Product not created');
    return false;
  } catch (error) {
    logTest('Create Product', false, error.response?.data || error.message);
    return false;
  }
}

async function testGetProductById() {
  if (!createdProductId) {
    logTest('Get Product by ID', false, 'No product ID available');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/products/${createdProductId}`);
    logTest('Get Product by ID', response.status === 200, response.data);
    return true;
  } catch (error) {
    logTest('Get Product by ID', false, error.response?.data || error.message);
    return false;
  }
}

async function testUpdateProduct() {
  if (!createdProductId) {
    logTest('Update Product', false, 'No product ID available');
    return false;
  }
  
  try {
    const updatedProduct = {
      ...testProduct,
      name: 'Updated Test Product',
      price: 39.99
    };
    
    const response = await axios.put(`${BASE_URL}/products/${createdProductId}`, updatedProduct, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logTest('Update Product', response.status === 200, response.data);
    return true;
  } catch (error) {
    logTest('Update Product', false, error.response?.data || error.message);
    return false;
  }
}

async function testGetUserProfile() {
  try {
    const response = await axios.get(`${BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logTest('Get User Profile', response.status === 200, response.data);
    return true;
  } catch (error) {
    logTest('Get User Profile', false, error.response?.data || error.message);
    return false;
  }
}

async function testGetAllUsers() {
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logTest('Get All Users (Admin)', response.status === 200, {
      count: response.data.count,
      users: response.data.users?.length ? 'Users found' : 'No users'
    });
    return true;
  } catch (error) {
    logTest('Get All Users (Admin)', false, error.response?.data || error.message);
    return false;
  }
}

async function testUnauthorizedAccess() {
  try {
    const response = await axios.post(`${BASE_URL}/products`, testProduct);
    logTest('Unauthorized Access Test', false, 'Should have been blocked');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Unauthorized Access Test', true, 'Access properly denied');
      return true;
    }
    logTest('Unauthorized Access Test', false, error.response?.data || error.message);
    return false;
  }
}

async function testDeleteProduct() {
  if (!createdProductId) {
    logTest('Delete Product', false, 'No product ID available');
    return false;
  }
  
  try {
    const response = await axios.delete(`${BASE_URL}/products/${createdProductId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logTest('Delete Product', response.status === 200, response.data);
    return true;
  } catch (error) {
    logTest('Delete Product', false, error.response?.data || error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting SimpleStore API Tests\n');
  console.log('Make sure your server is running on http://localhost:3000\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Get All Products', fn: testGetAllProducts },
    { name: 'Unauthorized Access Test', fn: testUnauthorizedAccess },
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Get User Profile', fn: testGetUserProfile },
    { name: 'Get All Users', fn: testGetAllUsers },
    { name: 'Create Product', fn: testCreateProduct },
    { name: 'Get Product by ID', fn: testGetProductById },
    { name: 'Update Product', fn: testUpdateProduct },
    { name: 'Delete Product', fn: testDeleteProduct }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`Running: ${test.name}`);
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testHealthCheck,
  testUserRegistration,
  testUserLogin,
  testAdminLogin,
  testGetAllProducts,
  testCreateProduct,
  testGetProductById,
  testUpdateProduct,
  testDeleteProduct,
  testGetUserProfile,
  testGetAllUsers,
  testUnauthorizedAccess
};