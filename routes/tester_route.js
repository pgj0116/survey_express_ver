const express = require("express");
const router = express.Router();
const {
  createTester,
  readOneTester,
  readScoreByTester,
} = require("../controllers/tester_controller");

router.post("/create", createTester);
router.get("/one/:tester_id", readOneTester);
router.get("/score/:survey_id/:tester_id", readOneTester);

module.exports = router;
