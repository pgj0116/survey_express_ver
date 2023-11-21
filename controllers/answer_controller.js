const pool = require("../config/mysql");
const logger = require("../winston/logger");

module.exports = {
  createAnswer: async (req, res) => {
    try {
      const { tester_id, survey_id, question_num, sel_choice } = req.body;
      if (!tester_id || !survey_id || !question_num || !sel_choice) {
        logger.info({
          ERROR: "[createAnswer] " + "Some component(s) is(are) missing",
        });
        return res.send({
          ERROR: "[createAnswer]Some component(s) is(are) missing",
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
            ERROR: "[createAnswer]The survey doesn't exist",
          });
          return res.send({ ERROR: "[createAnswer]The survey doesn't exist" });
        }
        const [chk2] = await con.query(
          `SELECT * FROM Tester WHERE tester_id = ?`,
          [tester_id]
        );
        if (chk2.length === 0) {
          logger.info({
            ERROR: "[createAnswer]The tester doesn't exist",
          });
          return res.send({ ERROR: "[createAnswer]The tester doesn't exist" });
        }
        const [chk3] = await con.query(
          `SELECT is_finished FROM Tester WHERE tester_id = ?`,
          [tester_id]
        );
        if (chk3[0].is_finished === 1) {
          logger.info({
            ERROR:
              "[createAnswer]The tester has finished the survey and cannot change anymore",
          });
          return res.send({
            ERROR:
              "[createAnswer]The tester has finished the survey and cannot change anymore",
          });
        }
        await con.beginTransaction();
        let [chk4] = await con.query(
          `SELECT q.is_multiple,
                    MAX(CASE WHEN c.choice_num = ? THEN 1 ELSE 0 END) is_choice_exist
             FROM Question q
             LEFT JOIN Choice c
             ON q.survey_id = c.survey_id AND q.question_num = c.question_num
             WHERE q.survey_id = ? AND q.question_num = ?
            GROUP BY q.survey_id, q.question_num`,
          [sel_choice, survey_id, question_num]
        );
        if (chk4[0].is_multiple === 1 && chk4[0].is_choice_eixst === 0) {
          await con.rollback();
          logger.info({
            ERROR:
              "[createAnswer]The question is multiple choice question and selected answer is not an option",
          });
          return res.send({
            ERROR:
              "[createAnswer]The question is multiple choice question and selected answer is not an option",
          });
        }
        await con.query(
          `INSERT INTO Answer(tester_id, survey_id, question_num, sel_choice) VALUES(?,?,?,?)`,
          [tester_id, survey_id, question_num, sel_choice]
        );

        await con.commit();
        return res.send({ SUCCESS: "A answer is successfully created" });
      } catch (err) {
        await con.rollback();
        logger.info({
          ERROR: "[createAnswer] " + err.message,
        });
        return res.send({ ERROR: "[createAnswer] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[createAnswer] " + err.message,
      });
      return res.send({ ERROR: "[createAnswer] " + err.message });
    }
  },
  createAnswerArray: async (req, res) => {
    try {
      const { tester_id, survey_id, ans_obj_array } = req.body;
      if (!tester_id || !survey_id || ans_obj_array.length === 0) {
        logger.info({
          ERROR: "[createAnswerArray]Some component(s) is(are) missing",
        });
        return res.send({
          ERROR: "[createAnswerArray]Some component(s) is(are) missing",
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
            ERROR: "[createAnswerArray]The survey doesn't exist",
          });
          return res.send({
            ERROR: "[createAnswerArray]The survey doesn't exist",
          });
        }
        const [chk2] = await con.query(
          `SELECT * FROM Tester WHERE tester_id = ?`,
          [tester_id]
        );
        if (chk2.length === 0) {
          logger.info({
            ERROR: "[createAnswerArray]The tester doesn't exist",
          });
          return res.send({
            ERROR: "[createAnswerArray]The tester doesn't exist",
          });
        }

        const [chk3] = await con.query(
          `SELECT is_finished FROM Tester WHERE tester_id = ?`,
          [tester_id]
        );
        if (chk3[0].is_finished === 1) {
          logger.info({
            ERROR:
              "[createAnswerArray]The tester has finished the survey and cannot change anymore",
          });
          return res.send({
            ERROR:
              "[createAnswerArray]The tester has finished the survey and cannot change anymore",
          });
        }
        let ex_question_nums = await con.query(
          `SELECT question_num FROM Answer WHERE survey_id = ? AND tester_id = ?`,
          [survey_id, tester_id]
        );
        const ans_question_nums = ans_obj_array.map((el) => el.question_num);
        ex_question_nums = ex_question_nums[0].map((el) => el.question_num);
        const is_question_num_exist = ans_question_nums.filter((el) =>
          ex_question_nums.includes(el)
        );
        if (is_question_num_exist.length !== 0) {
          logger.info({
            ERROR: "[createAnswerArray]Some questions are already answered",
          });
          return res.send({
            ERROR: "[createAnswerArray]Some questions are already answered",
          });
        }
        const answers = ans_obj_array.map((answer) => [
          tester_id,
          survey_id,
          answer.question_num,
          answer.sel_choice,
        ]);

        await con.beginTransaction();
        for (let el of ans_obj_array) {
          let [chk4] = await con.query(
            `SELECT q.question_num, c.choice_num, q.is_multiple FROM Question q
           LEFT JOIN  Choice c
           ON q.survey_id = c.survey_id
           AND q.question_num = c.question_num
           WHERE q.survey_id = ? AND q.question_num = ? 
           ORDER BY q.question_num , c.choice_num; 
          `,
            [survey_id, el.question_num]
          );
          let choices = chk4.map((el) => el.choice_num);
          if (chk4[0].is_multiple === 1 && !choices.includes(el.choice_num)) {
            await con.rollback();
            logger.info({
              ERROR:
                "[createAnswerArray]The question is multiple choice question and selected answer is not an option",
            });
            return res.send({
              ERROR:
                "[createAnswerArray]The question is multiple choice question and selected answer is not an option",
            });
          }
        }

        await con.query(
          `INSERT INTO Answer(tester_id, survey_id, question_num, sel_choice) VALUES ?`,
          [answers.map((answer) => [...answer])]
        );

        await con.commit();
        return res.send({ SUCCESS: "A answer is successfully created" });
      } catch (err) {
        await con.rollback();
        logger.info({
          ERROR: "[createAnswerArray] " + err.message,
        });
        return res.send({ ERROR: "[createAnswerArray] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[createAnswerArray] " + err.message,
      });
      return res.send({ ERROR: "[createAnswerArray] " + err.message });
    }
  },
  readAllAnswer: async (req, res) => {
    try {
      const survey_id = req.params.survey_id;
      const tester_id = req.params.tester_id;

      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [answer_data] = await con.query(
          `SELECT question_num, ans_num FROM Answer WHERE survey_id = ? AND tester_id = ? ORDER BY question_num`,
          [survey_id, tester_id]
        );
        return res.send({ DATA: answer_data });
      } catch (err) {
        logger.info({
          ERROR: "[readAllAnswer] " + err.message,
        });
        return res.send({ ERROR: "[readAllAnswer] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[readAllAnswer] " + err.message,
      });
      return res.send({ ERROR: "[readAllAnswer] " + err.message });
    }
  },
  readOneSurvey: async (req, res) => {
    try {
      const survey_id = req.params.id;
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [survey_data] = await con.query(
          `SELECT * FROM Survey WHERE survey_id = ?`,
          survey_id
        );
        return res.send({ DATA: survey_data });
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
  updateSurvey: async (req, res) => {
    try {
      const { survey_id, survey_title } = req.body;
      if (!survey_id || !susrvey_title) {
        logger.info({
          ERROR: "[updateSurvey]Some component(s) is(are) missing",
        });
        return res.send({
          ERROR: "[updateSurvey]Some component(s) is(are) missing",
        });
      }
      const con = await pool.getConnection(async (conn) => conn);
      try {
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
          ERROR: "[updateSurvey] " + err.message,
        });
        return res.send({ ERROR: "[updateSurvey] " + err.message });
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
      const survey_id = req.params.id;
      const con = await pool.getConnection(async (conn) => conn);
      try {
        await con.beginTransaction();
        await con.query(
          `DELETE FROM Survey WHERE survey_id = ?;
          DELETE FROM Question WHERE survey_id = ?
          DELETE FROM Choice WHERE survey_id = ?;
        `,
          [survey_id, survey_id]
        );
        await con.commit();

        return res.send({ SUCCESS: "The survey is successfully deleted" });
      } catch (err) {
        await con.rollback();
        logger.info({
          ERROR: "[deleteSurvey] " + err.message,
        });
        return res.send({ ERROR: "[deleteSurvey] " + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[deleteSurvey] " + err.message,
      });
      return res.send({ ERROR: "[deleteSurvey] " + err.message });
    }
  },
};
