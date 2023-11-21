const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "My API",
    description: "Description",
  },
  host: "127.0.0.1:4000",
  schemes: ["http"],
  autoHeaders: true,
  securityDefinitions: {
    bearerAuth: {
      name: "Authorization",
      in: "header",
      type: "apiKey",
      description: "JWT Authorization header",
    },
  },
  security: [{ bearerAuth: [] }],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./server.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
