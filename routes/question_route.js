const express = require("express");
const router = express.Router();
const {
  createQuestion,
  readAllQuestion,
  readOneQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/question_controller");

router.post("/create", createQuestion);
router.get("/all/:survey_id", readAllQuestion);
router.get("/one/:survey_id/:question_num", readOneQuestion);
router.patch("/update", updateQuestion);
router.delete("/:survey_id/:question_num", deleteQuestion);

module.exports = router;
