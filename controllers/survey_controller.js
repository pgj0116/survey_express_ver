const pool = require("../config/mysql");
const logger = require("../winston/logger");

module.exports = {
  createSurvey: async (req, res) => {
    try {
      const { survey_title } = req.body;
      if (!susrvey_title) {
        logger.info({
          ERROR: "[createSurvey]Some component(s) is(are) missing",
        });
        return res.send({
          ERROR: "[createSurvey]Some component(s) is(are) missing",
        });
      }
      const con = await pool.getConnection(async (conn) => conn);
      try {
        await con.beginTransaction();
        await con.query(
          `INSERT INTO Survey(survey_title) VALUES (?)`,
          survey_title
        );
        await con.commit();
        return res.send({ SUCCESS: "A survey is successfully created" });
      } catch (err) {
        await con.rollback();
        logger.info({
          ERROR: "[createSurvey]" + err.message,
        });
        return res.send({ ERROR: "[createSurvey]" + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[createSurvey]" + err.message,
      });
      return res.send({ ERROR: "[createSurvey]" + err.message });
    }
  },
  readAllSurvey: async (req, res) => {
    try {
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [survey_data] = await con.query(`SELECT * FROM Survey`);
        return res.send({ DATA: survey_data });
      } catch (err) {
        logger.info({
          ERROR: "[readAllSurvey]" + err.message,
        });
        return res.send({ ERROR: "[readAllSurvey] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[readAllSurvey]" + err.message,
      });
      return res.send({ ERROR: "[readAllSurvey] " + err.message });
    }
  },
  readOneSurvey: async (req, res) => {
    try {
      const survey_id = req.params.survey_id;
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [survey_data] = await con.query(
          `SELECT * FROM Survey WHERE survey_id = ?`,
          survey_id
        );
        return res.send({ DATA: survey_data });
      } catch (err) {
        logger.info({
          ERROR: "[readOneSurvey]" + err.message,
        });
        return res.send({ ERROR: "[readOneSurvey] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[readOneSurvey]" + err.message,
      });
      return res.send({ ERROR: "[readOneSurvey] " + err.message });
    }
  },
  updateSurvey: async (req, res) => {
    try {
      const { survey_id, survey_title } = req.body;
      if (!survey_id || !susrvey_title) {
        logger.info({
          ERROR: "[updateSurvey]" + "Some component(s) is(are) missing",
        });
        return res.send({ ERROR: "Some component(s) is(are) missing" });
      }
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [chk1] = await con.query(
          `SELECT * FROM Survey WHERE survey_id = ?`,
          [survey_id]
        );
        if (chk1.length === 0) {
          logger.info({
            ERROR: "[updateSurvey]The survey doesn't exist",
          });
          return res.send({ ERROR: "[updateSurvey]The survey doesn't exist" });
        }
        await con.beginTransaction();
        await con.query(
          `UPDATE Survey SET survey_title = ? WHERE survey_id = ?`,
          [survey_title, survey_id]
        );
        await con.commit();

        return res.send({ SUCCESS: "The survey is successfully updated" });
      } catch (err) {
        await con.rollback();
        logger.info({
          ERROR: "[updateSurvey]" + err.messages,
        });
        return res.send({ ERROR: "[updateSurvey]" + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[updateSurvey] " + err.message,
      });
      return res.send({ ERROR: "[updateSurvey] " + err.message });
    }
  },
  deleteSurvey: async (req, res) => {
    try {
      const survey_id = req.params.survey_id;
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [chk1] = await con.query(
          `SELECT * FROM Survey WHERE survey_id = ?`,
          [survey_id]
        );
        if (chk1.length === 0) {
          logger.info({
            ERROR: "[deleteSurvey]The survey doesn't exist",
          });
          return res.send({ ERROR: "[deleteSurvey]The survey doesn't exist" });
        }
        await con.beginTransaction();
        await con.query(
          `DELETE FROM Survey WHERE survey_id = ?;
          DELETE FROM Question WHERE survey_id = ?;
        `,
          [survey_id, survey_id]
        );
        await con.commit();

        return res.send({ SUCCESS: "The survey is successfully deleted" });
      } catch (err) {
        await con.rollback();
        logger.info({
          ERROR: "[deleteSurvey] " + err.messages,
        });
        return res.send({ ERROR: "[deleteSurvey] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[deleteSurvey] " + err.messages,
      });
      return res.send({ ERROR: "[deleteSurvey] " + err.message });
    }
  },
};
