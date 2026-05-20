const router = require("express").Router();
const Victim = require("../models/Victim");

router.get("/", async (req, res) => {
  try {
    const victims = await Victim.find().sort({ createdAt: -1 });
    res.json(victims);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const victim = await Victim.findById(req.params.id);
    if (!victim) return res.status(404).json({ error: "Victim not found" });
    res.json(victim);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const victim = await Victim.create(req.body);
    res.status(201).json(victim);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const victim = await Victim.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!victim) return res.status(404).json({ error: "Victim not found" });
    res.json(victim);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const victim = await Victim.findByIdAndDelete(req.params.id);
    if (!victim) return res.status(404).json({ error: "Victim not found" });
    res.json({ message: "Victim deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
