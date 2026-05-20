const router  = require("express").Router();
const Officer = require("../models/Officer");

router.get("/", async (req, res) => {
  try {
    const officers = await Officer.find().populate("station_id", "name").sort({ createdAt: -1 });
    res.json(officers);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id).populate("station_id", "name");
    if (!officer) return res.status(404).json({ error: "Officer not found" });
    res.json(officer);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const officer = await Officer.create(req.body);
    res.status(201).json(officer);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const officer = await Officer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!officer) return res.status(404).json({ error: "Officer not found" });
    res.json(officer);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const officer = await Officer.findByIdAndDelete(req.params.id);
    if (!officer) return res.status(404).json({ error: "Officer not found" });
    res.json({ message: "Officer deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
