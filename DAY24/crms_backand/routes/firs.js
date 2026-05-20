const router = require("express").Router();
const FIR    = require("../models/FIR");

router.get("/", async (req, res) => {
  try {
    const firs = await FIR.find()
      .populate("crime_id",   "name ipc severity")
      .populate("officer_id", "name rank badge")
      .populate("station_id", "name location")
      .populate("victim_id",  "name contact")
      .sort({ createdAt: -1 });
    res.json(firs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const fir = await FIR.findById(req.params.id)
      .populate("crime_id officer_id station_id victim_id");
    if (!fir) return res.status(404).json({ error: "FIR not found" });
    res.json(fir);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const fir = await FIR.create(req.body);
    res.status(201).json(fir);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const fir = await FIR.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!fir) return res.status(404).json({ error: "FIR not found" });
    res.json(fir);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const fir = await FIR.findByIdAndDelete(req.params.id);
    if (!fir) return res.status(404).json({ error: "FIR not found" });
    res.json({ message: "FIR deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
