require('dotenv').config()
const mongo = process.env.MONGODB_URI;

module.exports = {
    url: mongo + "mongodb+srv://vatsalpatel1841103:Ram%4013579@vpcluster.hexdv.mongodb.net/sample_mflix"
};
