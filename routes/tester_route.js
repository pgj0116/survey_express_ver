const express = require("express");
const router = express.Router();
const {
  createTester,
  readOneTester,
  readScoreByTester,
  updateTesterStatus,
} = require("../controllers/tester_controller");

router.post("/create", createTester);
router.get("/one/:survey_id/:tester_id", readOneTester);
router.get("/score/:survey_id/:tester_id", readScoreByTester);
router.patch("/update", updateTesterStatus);
module.exports = router;
