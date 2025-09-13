const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/generator", async (req, res) => {
  try {
    if (req.user.role !== "generator") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const {
      name = null,
      gmail = null,
      phone = null,
      address = null,
      status = "new",
      assignedToAgentId = null,
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO leads (name, gmail, phone, address, status, assignedToAgentId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, gmail, phone, address, status, assignedToAgentId]
    );

    res.json({
      id: result.insertId,
      name,
      gmail,
      phone,
      address,
      status,
      assignedToAgentId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/assign", async (req, res) => {
  try {
    if (req.user.role !== "assigner") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { leadId, agentId } = req.body;

    if (!leadId || !agentId) {
      return res
        .status(400)
        .json({ message: "leadId and agentId are required" });
    }

    const [result] = await db.query(
      "UPDATE leads SET assignedToAgentId = ?, status = ? WHERE id = ?",
      [agentId, "assigned", leadId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `Lead ${leadId} not found` });
    }

    res.json({
      message: `Lead ${leadId} assigned to agent ${agentId} and status updated to assigned`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    if (req.user.role === "agent") {
      const [rows] = await db.query(
        "SELECT * FROM leads WHERE assignedToAgentId = ?",
        [req.user.id]
      );
      return res.json(rows);
    }

    if (req.user.role === "assigner" || req.user.role === "generator") {
      const [rows] = await db.query("SELECT * FROM leads");
      return res.json(rows);
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// New route to fetch agents for assigner role
router.get("/agents", async (req, res) => {
  try {
    if (req.user.role !== "assigner") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const [agents] = await db.query(
      "SELECT id, name, email FROM users WHERE role = ?",
      ["agent"]
    );

    res.json(agents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
