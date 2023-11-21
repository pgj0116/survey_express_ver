const express = require("express");
const router = express.Router();
const {
  createAnswer,
  createAnswerArray,
} = require("../controllers/answer_controller");
router.use(express.json());
router.post("/create", createAnswer);
router.post("/createArray", createAnswerArray);

module.exports = router;
