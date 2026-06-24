import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.port || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected Successfully!");
})
.catch(err => {
    console.log("Database connection error:", err);
});

// ======================
// Student Schema
// ======================

const studentSchema = new mongoose.Schema({
    rollNo: String,
    name: String
});

const Student = mongoose.model(
    "Student",
    studentSchema
);

// ======================
// Attendance Schema
// ======================

const attendanceSchema = new mongoose.Schema({

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },

    date: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["P", "A"],
        required: true
    }

});


const Attendance = mongoose.model(
    "Attendance",
    attendanceSchema
);




// ======================
// Home Route
// ======================

app.get("/", (req, res) => {
    res.send("Server Has Started Successfully");
});

// ======================
// Student Routes
// ======================

// Get All Students

app.get("/students", async (req, res) => {

    try {

        const students =
            await Student.find();

        res.status(200)
           .json(students);

    }
    catch (err) {

        res.status(500)
           .json({
                error: err.message
           });

    }

});

// Add Student

app.post("/students", async (req, res) => {

    try {

        const newStudent =
            await Student.create({

                rollNo: req.body.rollNo,

                name: req.body.name

            });

        res.status(201)
           .json(newStudent);

    }
    catch (err) {

        res.status(500)
           .json({
                error: err.message
           });

    }

});

// ======================
// Attendance Routes
// ======================

// Save Attendance

//This functions puts attendance and updates attendance
app.post("/attendance", async (req, res) => {
    try {
      const { studentId, date, status } = req.body;
  
      const attendance = await Attendance.findOneAndUpdate(
        { studentId: studentId, date: date }, 
        { status: status },                   
        { new: true, upsert: true }           
      );
  
      res.status(200).json(attendance);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });



// Get All Attendance
app.get("/attendance", async (req, res) => {

    try {

        const attendance =
            await Attendance.find()
            .populate("studentId");

        res.status(200)
           .json(attendance);

    }
    catch (err) {

        res.status(500)
           .json({
                error: err.message
           });

    }

});

// Get Today's Attendance

app.get("/attendance/today", async (req, res) => {

    try {
 //2026-06-22T02:25:18.000Z
        const today =
            new Date()
            .toISOString()
            .split("T")[0];

        const attendance =
            await Attendance.find({
                date: today
            })
            .populate("studentId");

        res.status(200)
           .json(attendance);

    }
    catch (err) {

        res.status(500)
           .json({
                error: err.message
           });

    }

});

// ======================
// Delete Today's Attendance
// ======================

app.delete("/attendance/today", async (req, res) => {
    try {
      // Get today's date in the same format you used for saving
      const today = new Date().toISOString().split("T")[0];
  
      // Wipe all records that match today's date
      const result = await Attendance.deleteMany({ date: today });
  
      res.status(200).json({ 
        message: "Today's attendance has been completely reset.",
        deletedCount: result.deletedCount // Useful for debugging
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });



app.listen(PORT, () => {

    console.log(
        `Server is running on port ${PORT}`
    );

});