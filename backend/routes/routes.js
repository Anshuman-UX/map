const express = require('express');
const router = express.Router();
const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  clearAllRoutes,
} = require('../controllers/routeController');

// ── Route endpoints ───────────────────────────────────────────────────────────

router.get('/',        getAllRoutes);       // GET    /api/routes
router.get('/:id',     getRouteById);      // GET    /api/routes/:id
router.post('/',       createRoute);       // POST   /api/routes
router.put('/:id',     updateRoute);       // PUT    /api/routes/:id
router.delete('/all',  clearAllRoutes);    // DELETE /api/routes/all
router.delete('/:id',  deleteRoute);       // DELETE /api/routes/:id

module.exports = router;
