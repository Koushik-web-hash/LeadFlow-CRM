const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const Lead = require("./lead");

const app = express();

/* MIDDLEWARE */

app.use(cors());

app.use(express.json());

/* DATABASE */

mongoose.connect(
  "mongodb://127.0.0.1:27017/leadflowcrm"
)

.then(() => {

  console.log("MongoDB Connected");

})

.catch((error) => {

  console.log(error);

});

/* GET LEADS */

app.get("/leads", async (req, res) => {

  try {

    const leads = await Lead.find();

    res.json(leads);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error"
    });

  }

});

/* ADD LEAD */

app.post("/leads", async (req, res) => {

  try {

    const newLead = new Lead({

      name: req.body.name,

      email: req.body.email,

      message: req.body.message,

      status: "New"

    });

    const savedLead = await newLead.save();

    res.json(savedLead);

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Unable To Save"
    });

  }

});

/* SERVER */

app.listen(5000, () => {

  console.log("Server Running On Port 5000");

});