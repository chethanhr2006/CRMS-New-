const router    = require("express").Router();
const CrimeType = require("../models/CrimeType");

router.get("/", async (req, res) => {
  try {
    const types = await CrimeType.find().sort({ name: 1 });
    res.json(types);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const type = await CrimeType.findById(req.params.id);
    if (!type) return res.status(404).json({ error: "CrimeType not found" });
    res.json(type);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const type = await CrimeType.create(req.body);
    res.status(201).json(type);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const type = await CrimeType.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!type) return res.status(404).json({ error: "CrimeType not found" });
    res.json(type);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const type = await CrimeType.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ error: "CrimeType not found" });
    res.json({ message: "CrimeType deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
