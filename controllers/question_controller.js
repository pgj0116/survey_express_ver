const pool = require("../config/mysql");
const logger = require("../winston/logger");

module.exports = {
  createQuestion: async (req, res) => {
    try {
      const {
        survey_id,
        question_num,
        question_content,
        is_multiple,
        ans_num_allowed,
      } = req.body;
      if (!survey_id || !question_num || !question_content) {
        logger.info({
          ERROR: "[createQuestion]" + "Some component(s) is(are) missing",
        });
        return res.send({
          ERROR: "[createQuestion]Some component(s) is(are) missing",
        });
      }
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [chk1] = await con.query(
          `SELECT * FROM Survey WHERE survey_id = ?`,
          [survey_id]
        );
        if (chk1.length === 0) {
          logger.info({ ERROR: "[createQuestion]The survey doesn't exist" });
          return res.send({
            ERROR: "[createQuestion]The survey doesn't exist",
          });
        }
        const [chk2] = await con.query(
          `SELECT * FROM Question WHERE survey_id = ? AND question_num = ?`,
          [survey_id, question_num]
        );
        if (chk2.length !== 0) {
          logger.info({
            ERROR: "[createQuestion]The question number is already in use",
          });
          return res.send({
            ERROR: "[createQuestion]The question number is already in use",
          });
        }
        await con.beginTransaction();
        await con.query(
          `INSERT INTO Question(survey_id, question_num, question_content, is_multiple,
        ans_num_allowed) VALUES (?,?,?,?,?)`,
          [
            survey_id,
            question_num,
            question_content,
            is_multiple || 1,
            ans_num_allowed || 1,
          ]
        );
        await con.commit();
        return res.send({ SUCCESS: "A Question is successfully created" });
      } catch (err) {
        await con.rollback();
        logger.info({
          ERROR: "[createQuestion] " + err.message,
        });

        return res.send({ ERROR: "[createQuestion] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[createQuestion] " + err.message,
      });
      return res.send({ ERROR: "[createQuestion] " + err.message });
    }
  },
  readAllQuestion: async (req, res) => {
    try {
      const survey_id = req.params.survey_id;
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [question_data] = await con.query(
          `SELECT * FROM Question WHERE survey_id = ? ORDER BY question_num`,
          [survey_id]
        );
        return res.send({ DATA: question_data });
      } catch (err) {
        logger.info({
          ERROR: "[readAllQuestion] " + err.message,
        });
        return res.send({ ERROR: "[readAllQuestion] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[readAllQuestion] " + err.message,
      });
      return res.send({ ERROR: "[readAllQuestion] " + err.message });
    }
  },

  readOneQuestion: async (req, res) => {
    try {
      const survey_id = req.params.survey_id;
      const question_num = req.params.question_num;
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [question_data] = await con.query(
          `SELECT * FROM Question WHERE survey_id = ? AND question_num = ?`,
          [survey_id, question_num]
        );
        return res.send({ DATA: question_data });
      } catch (err) {
        logger.info({
          ERROR: "[readOneQuestion] " + err.message,
        });
        return res.send({ ERROR: "[readOneQuestion] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[readOneQuestion] " + err.message,
      });
      return res.send({ ERROR: "[readOneQuestion] " + err.message });
    }
  },
  updateQuestion: async (req, res) => {
    try {
      const { survey_id, question_num, question_content } = req.body;
      if (!survey_id || !question_num || !question_content) {
        logger.info({
          ERROR: "[updateQuestion]Some component(s) is(are) missing",
        });
        return res.send({
          ERROR: "[updateQuestion]Some component(s) is(are) missing",
        });
      }
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [chk1] = await con.query(
          `SELECT * FROM Question WHERE survey_id = ? AND question_num = ?`,
          [survey_id, question_num]
        );
        if (chk1.length === 0) {
          logger.info({
            ERROR: "[updateQuestion]The question doesn't exist",
          });
          return res.send({
            ERROR: "[updateQuestion]The question doesn't exist",
          });
        }
        await con.beginTransaction();
        await con.query(
          `UPDATE Question SET question_content = ? WHERE survey_id = ? AND questino_num = ?`,
          [question_content, survey_id, question_num]
        );
        await con.commit();

        return res.send({ SUCCESS: "The question is successfully updated" });
      } catch (err) {
        await con.rollback();
        logger.info({
          ERROR: "[updateQuestion] " + err.message,
        });
        return res.send({ ERROR: "[updateQuestion] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[updateQuestion] " + err.message,
      });
      return res.send({ ERROR: "[updateQuestion] " + err.message });
    }
  },
  deleteQuestion: async (req, res) => {
    try {
      const survey_id = req.params.survey_id;
      const question_num = req.params.question_num;
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [chk1] = await con.query(
          `SELECT * FROM Question WHERE survey_id = ? AND question_num = ?`,
          [survey_id, question_num]
        );
        if (chk1.length === 0) {
          logger.info({
            ERROR: "[deleteQuestion]The question doesn't exist",
          });
          return res.send({
            ERROR: "[deleteQuestion]The question doesn't exist",
          });
        }
        await con.beginTransaction();
        await con.query(
          `DELETE FROM Question WHERE survey_id = ? AND question_num = ?;
        `,
          [survey_id, question_num]
        );
        await con.commit();

        return res.send({ SUCCESS: "The question is successfully deleted" });
      } catch (err) {
        await con.rollback();
        logger.info({
          ERROR: "[deleteQuestion] " + err.message,
        });
        return res.send({ ERROR: "[deleteQuestion] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[deleteQuestion] " + err.message,
      });
      return res.send({ ERROR: "[deleteQuestion] " + err.message });
    }
  },
};
