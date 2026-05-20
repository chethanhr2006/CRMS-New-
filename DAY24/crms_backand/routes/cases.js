const router = require("express").Router();
const Case   = require("../models/Case");

router.get("/", async (req, res) => {
  try {
    const cases = await Case.find()
      .populate("fir_id",      "date status")
      .populate("criminal_id", "name status")
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const c = await Case.findById(req.params.id).populate("fir_id criminal_id");
    if (!c) return res.status(404).json({ error: "Case not found" });
    res.json(c);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post("/", async (req, res) => {
  try {
    const c = await Case.create(req.body);
    res.status(201).json(c);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const c = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!c) return res.status(404).json({ error: "Case not found" });
    res.json(c);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const c = await Case.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ error: "Case not found" });
    res.json({ message: "Case deleted" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
