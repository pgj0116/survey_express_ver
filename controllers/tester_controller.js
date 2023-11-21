const pool = require("../config/mysql");
const logger = require("../winston/logger");

module.exports = {
  createTester: async (req, res) => {
    try {
      const con = await pool.getConnection(async (conn) => conn);
      try {
        await con.beginTransaction();
        const [new_tester_id] = await con.query(
          `INSERT INTO Tester(is_finished) VALUES (false)`
        );
        await con.commit();
        return res.send({
          SUCCESS: "A tester is successfully created",
          new_tester_id: new_tester_id.insertId,
        });
      } catch (err) {
        await con.rollback();
        logger.info({
          ERROR: "[createTester] " + err.message,
        });
        return res.send({ ERROR: "[createTester] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[createTester] " + err.message,
      });
      return res.send({ ERROR: "[createTester] " + err.message });
    }
  },
  readOneTester: async (req, res) => {
    try {
      const tester_id = req.params.tester_id;
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [chk1] = await con.query(
          `SELECT * FROM Tester WHERE tester_id = ?`,
          [tester_id]
        );
        if (chk1.length === 0) {
          logger.info({
            ERROR: "[readOneTester]The tester doesn't exsit",
          });
          return res.send({ ERROR: "[readOneTester]The tester doesn't exsit" });
        }
        const [survey_data] = await con.query(
          `SELECT a.question_num, a.sel_choice, c.choice_point FROM Answer a
             LEFT JOIN Choice c
             ON c.survey_id = a.survey_id
             AND c.question_num = a.question_num
             AND c.choice_num = a.sel_choice  
                WHERE a.tester_id = ?`,
          tester_id
        );
        let points = 0;
        survey_data.forEach((el) => {
          if (el.choice_point) points += el.choice_point;
        });

        return res.send({ DATA: survey_data, TOTAL_POINT: points });
      } catch (err) {
        logger.info({
          ERROR: "[readOneSurvey] " + err.message,
        });
        return res.send({ ERROR: "[readOneSurvey] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[readOneSurvey] " + err.message,
      });
      return res.send({ ERROR: "[readOneSurvey] " + err.message });
    }
  },
  readScoreByTester: async (req, res) => {
    try {
      const tester_id = req.params.tester_id;
      const survey_id = req.params.survey_id;

      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [point_data] = await con.query(
          `SELECT * FROM Answer a 
            JOIN Choice c
            ON c.survey_id = a.survey_id
            AND c.question_num = a.question_num
            AND c.choice_num = a.sel_choice
            WHERE a.survey_id = ? AND a.tester_id = ?`,
          [survey_id, tester_id]
        );
        return res.send({ DATA: point_data[0] });
      } catch (err) {
        return res.send({ ERROR: "[readScoreByTester] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      return res.send({ ERROR: "[readScoreByTester] " + err.message });
    }
  },
  readCountByQuestion: async (req, res) => {
    try {
      const tester_id = req.params.tester_id;
      const survey_id = req.params.survey_id;

      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [point_data] = await con.query(
          `SELECT * FROM Answer a 
            JOIN Choice c
            ON c.survey_id = a.survey_id
            AND c.question_num = a.question_num
            AND c.choice_num = a.sel_choice
            WHERE a.survey_id = ? AND a.tester_id = ?`,
          [survey_id, tester_id]
        );
        return res.send({ DATA: point_data[0] });
      } catch (err) {
        return res.send({ ERROR: "[readScoreByTester] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      return res.send({ ERROR: "[readScoreByTester] " + err.message });
    }
  },
};
