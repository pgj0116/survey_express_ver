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
        const [tester_chk] = await con.query(
          `SELECT is_finished FROM Tester WHERE tester_id = ?`,
          [tester_id]
        );
        if (tester_chk[0].is_finished === 1) {
          logger.info({
            ERROR: "[createAnswer]The tester already finished the survey",
          });
          return res.send({
            ERROR: "[createAnswer]he tester already finished the survey",
          });
        }
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
          logger.info({
            ERROR:
              "[createAnswer]The question is multiple choice question and selected answer is not an option",
          });
          return res.send({
            ERROR:
              "[createAnswer]The question is multiple choice question and selected answer is not an option",
          });
        }
        let [chk5] = await con.query(
          `SELECT COUNT(a.sel_choice) AS ans_num_cnt,
                (SELECT ans_num_allowed FROM Question q
                  WHERE q.survey_id = a.survey_id AND q.question_num = a.question_num) ans_num_allowed FROM Answer a
            WHERE a.survey_id = ? AND a.tester_id = ? AND a.question_num = ?
            GROUP BY a.survey_id, a.question_num;
            `,
          [survey_id, tester_id, question_num]
        );
        if (
          chk5.length !== 0 &&
          chk5[0].ans_num_cnt >= chk5[0].ans_num_allowed
        ) {
          return res.send({ ERROR: "The question is already answered" });
        }
        await con.beginTransaction();

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
    // try {
    //   const { tester_id, survey_id, ans_obj_array } = req.body;
    //   if (!tester_id || !survey_id || ans_obj_array.length === 0) {
    //     logger.info({
    //       ERROR: "[createAnswerArray]Some component(s) is(are) missing",
    //     });
    //     return res.send({
    //       ERROR: "[createAnswerArray]Some component(s) is(are) missing",
    //     });
    //   }
    //   const con = await pool.getConnection(async (conn) => conn);
    //   try {
    //     const [tester_chk] = await con.query(
    //       `SELECT is_finished FROM Tester WHERE tester_id = ?`,
    //       [tester_id]
    //     );
    //     if (tester_chk[0].is_finished === 1) {
    //       logger.info({
    //         ERROR: "[createAnswerArray]The tester already finished the survey",
    //       });
    //       return res.send({
    //         ERROR: "[createAnswerArray]he tester already finished the survey",
    //       });
    //     }
    //     const [chk1] = await con.query(
    //       `SELECT * FROM Survey WHERE survey_id = ?`,
    //       [survey_id]
    //     );
    //     if (chk1.length === 0) {
    //       logger.info({
    //         ERROR: "[createAnswerArray]The survey doesn't exist",
    //       });
    //       return res.send({
    //         ERROR: "[createAnswerArray]The survey doesn't exist",
    //       });
    //     }
    //     const [chk2] = await con.query(
    //       `SELECT * FROM Tester WHERE tester_id = ?`,
    //       [tester_id]
    //     );
    //     if (chk2.length === 0) {
    //       logger.info({
    //         ERROR: "[createAnswerArray]The tester doesn't exist",
    //       });
    //       return res.send({
    //         ERROR: "[createAnswerArray]The tester doesn't exist",
    //       });
    //     }
    //     const [chk3] = await con.query(
    //       `SELECT is_finished FROM Tester WHERE tester_id = ?`,
    //       [tester_id]
    //     );
    //     if (chk3[0].is_finished === 1) {
    //       logger.info({
    //         ERROR:
    //           "[createAnswerArray]The tester has finished the survey and cannot change anymore",
    //       });
    //       return res.send({
    //         ERROR:
    //           "[createAnswerArray]The tester has finished the survey and cannot change anymore",
    //       });
    //     }
    //     const answers = ans_obj_array.map((answer) => [
    //       tester_id,
    //       survey_id,
    //       answer.question_num,
    //       answer.sel_choice,
    //     ]);
    //     await con.beginTransaction();
    //     for (const el of ans_obj_array) {
    //       const [chk4] = await con.query(
    //         `SELECT q.question_num, c.choice_num, q.is_multiple FROM Question q
    //  LEFT JOIN Choice c
    //  ON q.survey_id = c.survey_id
    //  AND q.question_num = c.question_num
    //  WHERE q.survey_id = ? AND q.question_num = ?
    //  ORDER BY q.question_num , c.choice_num;
    // `,
    //         [survey_id, el.question_num]
    //       );
    //       const choices = chk4.map((el) => el.choice_num);
    //       if (chk4[0].is_multiple === 1 && !choices.includes(el.sel_choice)) {
    //         await con.rollback();
    //         logger.info({
    //           ERROR:
    //             "[createAnswerArray]The question is a multiple-choice question, and the selected answer is not an option",
    //         });
    //         return res.send({
    //           ERROR:
    //             "[createAnswerArray]The question is a multiple-choice question, and the selected answer is not an option",
    //         });
    //       }
    //       const [chk5] = await con.query(
    //         `SELECT COUNT(a.sel_choice) AS ans_num_cnt,
    //     (SELECT ans_num_allowed FROM Question q
    //       WHERE q.survey_id = a.survey_id AND q.question_num = a.question_num) ans_num_allowed FROM Answer a
    // WHERE a.survey_id = ? AND a.tester_id = ? AND a.question_num = ?
    // GROUP BY a.survey_id, a.question_num;
    // `,
    //         [survey_id, tester_id, el.question_num]
    //       );
    //       console.log("chk5", chk5, el);
    //       if (
    //         chk5.length !== 0 &&
    //         chk5[0].ans_num_cnt >= chk5[0].ans_num_allowed
    //       ) {
    //         logger.info({
    //           ERROR: "[createAnswerArray]Some questions are already answered",
    //         });
    //         return res.send({
    //           ERROR: "[createAnswerArray]Some questions are already answered",
    //         });
    //       }
    //     }
    //     await con.query(
    //       `INSERT INTO Answer(tester_id, survey_id, question_num, sel_choice) VALUES ?`,
    //       [answers.map((answer) => [...answer])]
    //     );
    //     await con.commit();
    //     return res.send({ SUCCESS: "A answer is successfully created" });
    //   } catch (err) {
    //     await con.rollback();
    //     logger.info({
    //       ERROR: "[createAnswerArray]" + err.message,
    //     });
    //     return res.send({ ERROR: "[createAnswerArray]" + err.message });
    //   } finally {
    //     await con.release();
    //   }
    // } catch (err) {
    //   logger.info({
    //     ERROR: "[createAnswerArray]" + err.message,
    //   });
    //   return res.send({ ERROR: "[createAnswerArray]" + err.message });
    // }
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
          ERROR: "[readAllAnswer]" + err.message,
        });
        return res.send({ ERROR: "[readAllAnswer]" + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[readAllAnswer]" + err.message,
      });
      return res.send({ ERROR: "[readAllAnswer]" + err.message });
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
          ERROR: "[readOneSurvey]" + err.message,
        });
        return res.send({ ERROR: "[readOneSurvey]" + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[readOneSurvey]" + err.message,
      });
      return res.send({ ERROR: "[readOneSurvey]" + err.message });
    }
  },
  updateAnswer: async (req, res) => {
    try {
      const { survey_id, tester_id, question_num, sel_ans } = req.body;
      if (!survey_id || !tester_id || !question_num || !sel_ans) {
        logger.info({
          ERROR: "[updateAnswer]Some component(s) is(are) missing",
        });
        return res.send({
          ERROR: "[updateAnswer]Some component(s) is(are) missing",
        });
      }
      const con = await pool.getConnection(async (conn) => conn);
      try {
        const [tester_chk] = await con.query(
          `SELECT is_finished FROM Tester WHERE tester_id = ?`,
          [tester_id]
        );
        if (tester_chk[0].is_finished === 1) {
          logger.info({
            ERROR: "[createAnswer]The tester already finished the survey",
          });
          return res.send({
            ERROR: "[createAnswer]The tester already finished the survey",
          });
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
          ERROR: "[updateAnswer]" + err.message,
        });
        return res.send({ ERROR: "[updateAnswer]" + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[updateAnswer]" + err.message,
      });
      return res.send({ ERROR: "[updateAnswer]" + err.message });
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
          ERROR: "[deleteSurvey]" + err.message,
        });
        return res.send({ ERROR: "[deleteSurvey]" + err.message });
      } finally {
        await con.release();
      }
    } catch (err) {
      logger.info({
        ERROR: "[deleteSurvey]" + err.message,
      });
      return res.send({ ERROR: "[deleteSurvey]" + err.message });
    }
  },
};
