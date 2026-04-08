const express = require("express");
const cors = require("cors");

const generateRoute = require("./routes/generateRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("AI Code Assistant is running 🚀");
});

app.use("/generate", generateRoute);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});