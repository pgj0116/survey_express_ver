const express = require("express");
const router = express.Router();
const {
  createSurvey,
  readAllSurvey,
  readOneSurvey,
  updateSurvey,
  deleteSurvey,
} = require("../controllers/survey_controller");

router.post("/create", createSurvey);
router.get("/all", readAllSurvey);
router.get("/:survey_id", readOneSurvey);
router.patch("/update", updateSurvey);
router.delete("/:survey_id", deleteSurvey);

module.exports = router;
