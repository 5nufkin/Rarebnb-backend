export default {
  // dbURL: 'mongodb://127.0.0.1:27017',
  dbURL: process.env.MONGO_URL || 'mongodb+srv://NirSultan:nir123@cluster0.miv6emm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  dbName: process.env.DB_NAME || 'stay_db'
}
