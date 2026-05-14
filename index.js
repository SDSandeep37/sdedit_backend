import app from "./src/app.js";

import { disconnectDatabase } from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//handle unhandled promis rejections (e.g database connection errors)
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(1);
  });
});

//Handle uncaught exceptions
process.on("uncaughtException", async (error) => {
  console.log("Uncaught Exception:", error);
  await disconnectDatabase();
  process.exit(1);
});

//Gracefull shutdown - when error related to Signal
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDatabase();
    process.exit(1);
  });
});
