const mongoose = require('mongoose');

const WaypointSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  name: { type: String, default: '' },
  altitude: { type: Number, default: null },
});

const RouteSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
      maxlength: [100, 'Route name too long'],
    },
    waypoints: {
      type: [WaypointSchema],
      validate: {
        validator: (arr) => arr.length >= 2,
        message: 'A route must have at least 2 waypoints',
      },
    },
    totalDistance: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index for efficient queries
RouteSchema.index({ createdAt: -1 });
RouteSchema.index({ routeName: 'text' });

module.exports = mongoose.model('Route', RouteSchema);
