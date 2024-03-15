import jwt from "jsonwebtoken";
import { db } from "../db.js";

export const getAttendees = (req, res) => {
  const q = "SELECT * FROM attendees WHERE event_id = ?";

  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data);
  });
};

export const addAttendee = (req, res) => {
  const { user_id, event_id } = req.body;

  if (!user_id || !event_id) {
    return res.status(400).json({ message: "Missing user_id or event_id" });
  }

  // Check if the user is already attending the event
  const checkQuery =
    "SELECT * FROM attendees WHERE user_id = ? AND event_id = ?";
  db.query(checkQuery, [user_id, event_id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking attendee:", checkErr);
      return res
        .status(500)
        .json({ message: "An error occurred while checking attendee" });
    }

    if (checkResult.length > 0) {
      return res
        .status(400)
        .json({ message: "User is already attending the event" });
    }

    // If the user is not already attending the event
    const insertQuery =
      "INSERT INTO attendees (user_id, event_id) VALUES (?, ?)";
    db.query(insertQuery, [user_id, event_id], (err, result) => {
      if (err) {
        console.error("Error adding user to event:", err);
        return res
          .status(500)
          .json({ message: "An error occurred while adding user to event" });
      }

      return res
        .status(201)
        .json({ message: "User added to event successfully" });
    });
  });
};

export const getComments = (req, res) => {
  const q = "SELECT * FROM comments WHERE event_id = ?";

  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data);
  });
};

export const addComment = (req, res) => {
  const { user_id, event_id, cmt_text } = req.body;

  if (!user_id || !event_id || !cmt_text) {
    return res
      .status(400)
      .json({ message: "Missing user_id or event_id or cmt_text" });
  }

  const q =
    "INSERT INTO comments (user_id, event_id, cmt_text) VALUES (?, ?, ?)";
  db.query(q, [user_id, event_id, cmt_text], (err, result) => {
    if (err) {
      console.error("Error adding data to comment:", err);
      return res
        .status(500)
        .json({ message: "An error occurred while adding the comment" });
    }

    return res.status(201).json({ message: "Comment added successfully" });
  });
};
