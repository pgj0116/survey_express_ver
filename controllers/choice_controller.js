const pool = require("../config/mysql");
const logger = require("../winston/logger");

module.exports = {
  createChoice: async (req, res) => {
    try {
      const {
        survey_id,
        question_num,
        choice_num,
        choice_content,
        choice_point,
      } = req.body;
      if (!survey_id || !question_num || !choice_num || !choice_content) {
        logger.info({
          ERROR: "[createChoice]Some component(s) is(are) missing",
        });
        return res.send({
          ERROR: "[createChoice]Some component(s) is(are) missing",
        });
      }
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [chk1] = await con.query(
          `SELECT * FROM Survey WHERE survey_id = ?`,
          [survey_id]
        );
        if (chk1.length === 0) {
          logger.info({
            ERROR: "[createChoice]The survey doesn't exist",
          });
          return res.send({ ERROR: "[createChoice]The survey doesn't exist" });
        }
        const [chk2] = await con.query(
          `SELECT * FROM Question WHERE survey_id = ? AND question_num = ?`,
          [survey_id, question_num]
        );
        if (chk2.length === 0) {
          logger.info({
            ERROR: "[createChoice]The question doesn't exist",
          });
          return res.send({
            ERROR: "[createChoice]The question doesn't exist",
          });
        }
        const [chk3] = await con.query(
          `SELECT * FROM Choice WHERE survey_id = ? AND question_num = ? AND choice_num = ?`,
          [survey_id, question_num, choice_num]
        );
        if (chk3.length !== 0) {
          logger.info({
            ERROR: "[createChoice]The choice already exist",
          });
          return res.send({ ERROR: "[createChoice]The choice already exist" });
        }
        await con.beginTransaction();
        await con.query(
          `INSERT INTO Choice( survey_id,
                                question_num,
                                choice_num,
                                choice_content,
                                choice_point)
                VALUES (?, ?, ?, ? ,? )`,
          [
            survey_id,
            question_num,
            choice_num,
            choice_content,
            choice_point || 0,
          ]
        );
        await con.commit();
        return res.send({ SUCCESS: "A survey is successfully created" });
      } catch (err) {
        logger.info({
          ERROR: "[createChoice] " + err.message,
        });
        await con.rollback();
        return res.send({ ERROR: "[createChoice] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[createChoice] " + err.message,
      });
      return res.send({ ERROR: "[createChoice] " + err.message });
    }
  },
  readAllChoice: async (req, res) => {
    try {
      const survey_id = req.params.survey_id;
      const question_num = req.params.question_num;
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [choice_data] = await con.query(
          `SELECT * FROM Choice WHERE survey_id = ? AND question_num = ?`,
          [survey_id, question_num]
        );
        return res.send({ DATA: choice_data });
      } catch (err) {
        logger.info({
          ERROR: "[readAllChoice] " + err.message,
        });
        return res.send({ ERROR: "[readAllChoice] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[readAllChoice] " + err.message,
      });
      return res.send({ ERROR: "[readAllChoice] " + err.message });
    }
  },
  readOneChoice: async (req, res) => {
    try {
      const survey_id = req.params.survey_id;
      const question_num = req.params.question_num;
      const choice_num = req.params.choice_num;
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [choice_data] = await con.query(
          `SELECT * FROM Choice WHERE survey_id = ? AND questino_num = ? AND choice_num = ?`,
          [survey_id, question_num, choice_num]
        );
        return res.send({ DATA: choice_data });
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
  updateChoice: async (req, res) => {
    try {
      const {
        survey_id,
        question_num,
        choice_num,
        choice_content,
        choice_point,
      } = req.body;
      if (!survey_id || !question_num || !choice_num || !choice_content) {
        logger.info({
          ERROR: "[updateChoice] " + "Some component(s) is(are) missing",
        });
        return res.send({ ERROR: "Some component(s) is(are) missing" });
      }
      const con = await pool.getConnection(async (conn) => conn);
      try {
        //초이스가 이미 존재하는지 체크

        await con.beginTransaction();
        await con.query(
          `UPDATE Choice SET choice_content = ?, choice_point = ? WHERE survey_id = ? AND question_num = ? AND choice_num = ?`,
          [choice_content, choice_point, survey_id, question_num, choice_num]
        );
        await con.commit();

        return res.send({ SUCCESS: "The choice is successfully updated" });
      } catch (err) {
        await con.rollback();
        logger.info({
          ERROR: "[updateChoice]" + err.message,
        });
        return res.send({ ERROR: "[updateChoice] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[updateChoice]" + err.message,
      });
      return res.send({ ERROR: "[updateChoice] " + err.message });
    }
  },
  deleteChoice: async (req, res) => {
    try {
      const survey_id = req.params.survey_id;
      const question_num = req.params.question_num;
      const choice_num = req.params.choice_num;
      const con = await pool.getConnection(async (conn) => conn);
      try {
        await con.beginTransaction();
        await con.query(
          `DELETE FROM Choice WHERE survey_id = ? AND question_num = ? AND choice_num = ?;
        `,
          [survey_id, question_num, choice_num]
        );
        await con.commit();

        return res.send({ SUCCESS: "The survey is successfully deleted" });
      } catch (err) {
        await con.rollback();
        logger.info({
          ERROR: "[deleteSurvey]" + err.message,
        });
        return res.send({ ERROR: "[deleteSurvey] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[deleteSurvey]" + err.message,
      });
      return res.send({ ERROR: "[deleteSurvey] " + err.message });
    }
  },
};
