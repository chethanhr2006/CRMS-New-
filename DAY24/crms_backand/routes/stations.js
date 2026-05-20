const router  = require("express").Router();
const Station = require("../models/Station");

// GET all
router.get("/", async (req, res) => {
  try {
    const stations = await Station.find().sort({ createdAt: -1 });
    res.json(stations);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET one
router.get("/:id", async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) return res.status(404).json({ error: "Station not found" });
    res.json(station);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST create
router.post("/", async (req, res) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json(station);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// PUT update
router.put("/:id", async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!station) return res.status(404).json({ error: "Station not found" });
    res.json(station);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ error: "Station not found" });
    res.json({ message: "Station deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
