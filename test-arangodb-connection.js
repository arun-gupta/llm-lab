const { Database } = require('arangojs');

async function testConnection() {
  try {
    console.log('Testing ArangoDB connection...');
    
    const db = new Database({
      url: 'http://localhost:8529',
      databaseName: 'graphrag',
      auth: {
        username: 'root',
        password: 'postmanlabs123',
      },
    });
    
    console.log('Database object created');
    
    const version = await db.version();
    console.log('✅ Connection successful!');
    console.log('Version:', version);
    
    // Test creating a collection
    const collection = db.collection('test');
    await collection.create();
    console.log('✅ Collection creation successful!');
    
    // Clean up
    await collection.drop();
    console.log('✅ Collection cleanup successful!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
