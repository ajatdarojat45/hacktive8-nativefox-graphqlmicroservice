const router = require("express").Router();
const MovieController = require("../controllers/movieController");

router.get("/movies", MovieController.find);
router.get("/movies/:id", MovieController.findById);
router.post("/movies", MovieController.create);
router.put("/movies/:id", MovieController.update);
router.delete("/movies/:id", MovieController.remove);

module.exports = router;
