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
router.get("/all/:id", readAllQuestion);
router.get("/one/:id/:num", readOneQuestion);
router.patch("/update", updateQuestion);
router.delete("/:id/:num", deleteQuestion);

module.exports = router;
