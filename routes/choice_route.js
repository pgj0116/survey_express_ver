const express = require("express");
const router = express.Router();
const {
  createChoice,
  readAllChoice,
  readOneChoice,
  updateChoice,
  deleteChoice,
} = require("../controllers/choice_controller");
router.use(express.json());

router.post("/create", createChoice);
router.get("/all/:survey_id/:question_num", readAllChoice);
router.get("/one/:survey_id/:question_num/:choice_num", readOneChoice);
router.patch("/update", updateChoice);
router.delete("/delete/:survey_id/:question_num/:choice_num", deleteChoice);

module.exports = router;
