const pool = require("../db/index");

const getScoreCourse = async (section_id) => {
  const client = await pool.connect();
  try {
    const getNoOfVotes = await client.query(
      "select S.Section_no_of_votes, S.Section_total_students from Sections as S where S.Section_id  = ($1)",
      [section_id]
    );
    let participation_rate = (
      (getNoOfVotes.rows[0].section_no_of_votes /
        getNoOfVotes.rows[0].section_total_students) *
      100
    ).toFixed(2);
    const total_score = await client.query(
      "Select S.Section_Teacher_sum_of_rates from teaches as S where S.Section_id = ($1)",
      [section_id]
    );

    const score = (
      total_score.rows[0].section_teacher_sum_of_rates /
      getNoOfVotes.rows[0].section_no_of_votes
    ).toFixed(2);
    const ans = {
      score: score,
      rate: participation_rate,
    };
    return ans;
  } catch (error) {
    return error;
  } finally {
    client.release();
  }
};

module.exports = { getScoreCourse };
