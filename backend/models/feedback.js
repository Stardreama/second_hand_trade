const config = require("../config/config");
const db = config.db;

const Feedback = {
  create: (feedback, callback) => {
    const query =
      "INSERT INTO feedback (user_id, issue_type, description, images, contact) VALUES (?, ?, ?, ?, ?)";
    db.query(
      query,
      [
        feedback.user_id,
        feedback.issue_type,
        feedback.description,
        feedback.images,
        feedback.contact,
      ],
      callback
    );
  },
};

module.exports = Feedback;
