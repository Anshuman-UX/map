const Route = require('../models/Route');

// ── In-memory fallback when MongoDB is not available ──────────────────────────

let inMemoryRoutes = [];
let nextMemId = 1;

function isDbConnected() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/routes
 * Returns all saved routes, sorted newest first
 */
const getAllRoutes = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const routes = await Route.find().sort({ createdAt: -1 }).lean();
      return res.json(routes);
    }
    // In-memory fallback
    return res.json([...inMemoryRoutes].reverse());
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/routes/:id
 */
const getRouteById = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const route = await Route.findById(req.params.id).lean();
      if (!route) return res.status(404).json({ error: 'Route not found' });
      return res.json(route);
    }
    const route = inMemoryRoutes.find((r) => r._id === req.params.id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    return res.json(route);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/routes
 * Create a new route
 */
const createRoute = async (req, res, next) => {
  try {
    const { routeName, waypoints, totalDistance, description } = req.body;

    if (!routeName) return res.status(400).json({ error: 'routeName is required' });
    if (!waypoints || waypoints.length < 2)
      return res.status(400).json({ error: 'At least 2 waypoints required' });

    if (isDbConnected()) {
      const route = await Route.create({ routeName, waypoints, totalDistance, description });
      return res.status(201).json(route);
    }

    // In-memory fallback
    const now = new Date().toISOString();
    const route = {
      _id: String(nextMemId++),
      routeName,
      waypoints,
      totalDistance: totalDistance || 0,
      description: description || '',
      createdAt: now,
      updatedAt: now,
    };
    inMemoryRoutes.push(route);
    return res.status(201).json(route);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/routes/:id
 * Update route
 */
const updateRoute = async (req, res, next) => {
  try {
    const { routeName, waypoints, totalDistance, description } = req.body;

    if (isDbConnected()) {
      const route = await Route.findByIdAndUpdate(
        req.params.id,
        { routeName, waypoints, totalDistance, description },
        { new: true, runValidators: true }
      );
      if (!route) return res.status(404).json({ error: 'Route not found' });
      return res.json(route);
    }

    const idx = inMemoryRoutes.findIndex((r) => r._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Route not found' });
    inMemoryRoutes[idx] = {
      ...inMemoryRoutes[idx],
      routeName: routeName || inMemoryRoutes[idx].routeName,
      waypoints: waypoints || inMemoryRoutes[idx].waypoints,
      totalDistance: totalDistance ?? inMemoryRoutes[idx].totalDistance,
      description: description || inMemoryRoutes[idx].description,
      updatedAt: new Date().toISOString(),
    };
    return res.json(inMemoryRoutes[idx]);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/routes/:id
 */
const deleteRoute = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const route = await Route.findByIdAndDelete(req.params.id);
      if (!route) return res.status(404).json({ error: 'Route not found' });
      return res.json({ message: 'Route deleted' });
    }

    const idx = inMemoryRoutes.findIndex((r) => r._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Route not found' });
    inMemoryRoutes.splice(idx, 1);
    return res.json({ message: 'Route deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/routes
 * Clear all routes
 */
const clearAllRoutes = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      await Route.deleteMany({});
      return res.json({ message: 'All routes cleared' });
    }
    inMemoryRoutes = [];
    return res.json({ message: 'All routes cleared' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
  clearAllRoutes,
};
