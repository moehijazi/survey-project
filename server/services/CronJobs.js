const pool = require("../db/index");
const { Expo } = require("expo-server-sdk");
const schedule = require("node-schedule");

const initialSetup = async () => {
  const client = await pool.connect();
  let expo = new Expo();
  try {
    const getDeps = client.query(
      "SELECT branch_id, department_id, start_date from department_branch where start_date > DATE(NOW())"
    );
    let tokens, getTokens;
    for (const dep of getDeps.rows) {
      let { department_id, branch_id, start_date } = dep;
      await createCron(branch_id, department_id, start_date);
    }
  } catch (error) {
  } finally {
    client.release();
  }
};

const createCron = async (branch_id, department_id, start_date) => {
  const client = await pool.connect();
  let expo = new Expo();
  try {
    const getTokens = await client.query(
      'SELECT "Token" FROM students WHERE "Token" IS NOT NULL AND branch_id = ($1) and department_id = ($2)',
      [branch_id, department_id]
    );
    if (!getTokens.rowCount) {
      return;
    }
    const tokens = getTokens.rows;
    let messages = [];
    tokens.forEach((token) => {
      messages.push({
        to: token.token,
        sound: "default",
        body: "Your department has opened survey submissions",
      });
    });

    if (schedule.scheduledJobs[`${branch_id}_${department_id}`]) {
      schedule.scheduledJobs[`${branch_id}_${department_id}`].cancel();
    }

    let scheduleTask = schedule.scheduleJob(
      `${branch_id}_${department_id}`,
      start_date,
      function () {
        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];
        (async () => {
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
              tickets.push(...ticketChunk);
            } catch (error) {
              console.error(error);
            }
          }
        })();
      }
    );
  } catch (error) {
  } finally {
    client.release();
  }
};

module.exports = { schedule, initialSetup, createCron };
