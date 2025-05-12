const dotenv = require("dotenv");
const app = require("./app");

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(8000, '0.0.0.0', () => {
  console.log('Server started at http://0.0.0.0:8000');
});