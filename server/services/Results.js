const getScoreCourse = async (section_id, teacher_id, sumRates) =>{
    const getNoOfVotes = client.query("select S.Section_no_of_votes from Sections as S where S.Section_id  = ($1)", [section_id]);
        // CHECK HERE WE NEED MAX POSS SCORE SOMEHOW
        const max_score = 2;
        const score = (((sumRates / getNoOfVotes.rows[0].Section_no_of_votes)/ max_score) * 100).toFixed(2);
        return score;
}

module.exports = {getScoreCourse};