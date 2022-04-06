import express from "express";
const app = express();
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is listening at port ${PORT}...`);
  console.log(`[app]: http://localhost:${PORT}`);
});
