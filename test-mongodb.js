const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Test bağlantısı başlatılıyor...', { uri: MONGODB_URI });

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı!');
    console.log('Veritabanı adı:', mongoose.connection.db.databaseName);
    return mongoose;
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
}

testConnection()
  .then(mongoose => {
    console.log('Test tamamlandı, bağlantı kapatılıyor...');
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('Bağlantı başarıyla kapatıldı.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Beklenmeyen hata:', err);
    process.exit(1);
  }); 