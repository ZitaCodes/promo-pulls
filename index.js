import microCors from 'micro-cors';
import mongoose from 'mongoose';
import { send, json } from 'micro';
import Pull from './models/Pull.js';
import connectDB from './utils/connectDB.js';

const cors = microCors({ allowMethods: ['GET', 'POST', 'OPTIONS'] });

export default cors(async function handler(req, res) {
  const method = req.method;
  let email = "";

  if (method === "GET") {
    email = decodeURIComponent(req.query.email || "").toLowerCase().trim();
  } else if (method === "POST") {
    const body = await json(req);
    email = (body.email || "").toLowerCase().trim();
  }

  if (!email) return send(res, 400, { error: "Email is required" });

  await connectDB();

  try {
    if (method === "GET") {
      let record = await Pull.findOne({ email });
      if (!record) {
        record = await Pull.create({ email });
      }
      return send(res, 200, {
        email: record.email,
        pulls_used: record.pulls_used,
        pull_limit: record.pull_limit,
        last_reset: record.last_reset
      });
    } else if (method === "POST") {
      const updated = await Pull.findOneAndUpdate(
        { email },
        { $inc: { pulls_used: 1 } },
        { new: true, upsert: true }
      );
      return send(res, 200, {
        success: true,
        pulls_used: updated.pulls_used,
        pull_limit: updated.pull_limit
      });
    } else {
      return send(res, 405, { error: "Method not allowed" });
    }
  } catch (err) {
    console.error("MongoDB error:", err);
    return send(res, 500, { error: "Internal server error" });
  }
});
