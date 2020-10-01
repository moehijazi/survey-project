const pool = require("../db/index");

const getFreeText = async (req, res) => {
  try {
    let output = [];
    const getInfo = await pool.query("SELECT * FROM logs");
    for (const text of getInfo.rows) {
      output.push({
        text: text.free_text,
        reason: text.reason,
        id: text.log_id,
      });
    }
    return res.status(200).json(output);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const removeLog = async (req, res) => {
  const { id } = req.body;
  try {
    const removeLog = await pool.query("DELETE FROM logs where log_id = ($1)", [
      id,
    ]);
    return res.status(200).json("Success");
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = { getFreeText, removeLog };
