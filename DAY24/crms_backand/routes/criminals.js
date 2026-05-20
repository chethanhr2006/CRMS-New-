const router   = require("express").Router();
const Criminal = require("../models/Criminal");

router.get("/", async (req, res) => {
  try {
    const criminals = await Criminal.find().sort({ createdAt: -1 });
    res.json(criminals);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const criminal = await Criminal.findById(req.params.id);
    if (!criminal) return res.status(404).json({ error: "Criminal not found" });
    res.json(criminal);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const criminal = await Criminal.create(req.body);
    res.status(201).json(criminal);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const criminal = await Criminal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!criminal) return res.status(404).json({ error: "Criminal not found" });
    res.json(criminal);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const criminal = await Criminal.findByIdAndDelete(req.params.id);
    if (!criminal) return res.status(404).json({ error: "Criminal not found" });
    res.json({ message: "Criminal deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
