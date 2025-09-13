const express = require("express");
const bodyParser = require("body-parser");
const authMiddleware = require("./auth");
const cors = require("cors");
const leadsRoutes = require("./components/leeds.route");

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use("/leads", authMiddleware, leadsRoutes);

app.get("/", (req, res) => {
  res.send("Lead Platform API running");
});

const authRoutes = require("./components/login.route");
app.use("/auth", authRoutes);

// const PORT = process.env.PORT || 3000;
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
