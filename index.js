const app = require("./app");
const connectDB = require("./db/connect");
const port = process.env.PORT || 8080;
require("dotenv").config();

//server test route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
  });

connectDB(process.env.MONGO_URI);
app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});
