const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output");
const port = process.env.SERVER_PORT || 4000;

const surveyRoute = require("./routes/survey_route");
const questionRoute = require("./routes/question_route");
const answerRoute = require("./routes/answer_route");
const choiceRoute = require("./routes/choice_route");
const testerRoute = require("./routes/tester_route");

var options = {
  explorer: true,
  swaggerOptions: {
    securityDefinitions: {
      bearerAuth: {
        type: "apiKey",
        name: "x-auth-token",
        scheme: "bearer",
        in: "header",
      },
    },
  },
};

app.use(express.json());
app.use(cors());

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile, options));
app.use("/survey", surveyRoute);
app.use("/question", questionRoute);
app.use("/choice", choiceRoute);
app.use("/answer", answerRoute);
app.use("/tester", testerRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
