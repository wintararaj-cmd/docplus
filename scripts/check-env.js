// Script to check if environment variables are properly set
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

console.log('🔍 Checking environment setup...\n');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    console.log('📝 Please create .env.local file by copying .env.example:');
    console.log('   copy .env.example .env.local\n');
    process.exit(1);
}

console.log('✅ .env.local file exists\n');

// Load environment variables
require('dotenv').config({ path: envPath });

// Check required variables
const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
];

let allPresent = true;

console.log('Checking required environment variables:\n');

requiredVars.forEach(varName => {
    if (process.env[varName]) {
        console.log(`✅ ${varName}: Set`);

        // Show partial value for verification (hide sensitive parts)
        if (varName === 'DATABASE_URL') {
            const url = process.env[varName];
            const maskedUrl = url.replace(/:[^:@]+@/, ':****@');
            console.log(`   ${maskedUrl}\n`);
        } else if (varName === 'NEXTAUTH_SECRET') {
            console.log(`   ${process.env[varName].substring(0, 10)}...\n`);
        } else {
            console.log(`   ${process.env[varName]}\n`);
        }
    } else {
        console.log(`❌ ${varName}: Not set\n`);
        allPresent = false;
    }
});

if (allPresent) {
    console.log('✅ All required environment variables are set!');
    console.log('\n🚀 You can now run: npm run db:push');
} else {
    console.log('❌ Some required environment variables are missing!');
    console.log('\n📝 Please update your .env.local file');
    process.exit(1);
}
