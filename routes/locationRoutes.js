import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { multipleUpload, singleUpload } from "../middleware/multer.js";
import {
  addMoreImageToLocation,
  addNewLocation,
  deleteLocation,
  deleteLocationImage,
  getAllLocations,
  getLocationInfo,
  updateLocation,
  updateLocationImage,
} from "../controllers/locationController.js";

const router = express.Router();

router.route("/location").post(isAuthenticated, multipleUpload, addNewLocation);
router
  .route("/location/:id")
  .put(isAuthenticated, singleUpload, updateLocation);
router
  .route("/location/image/:id")
  .post(isAuthenticated, singleUpload, addMoreImageToLocation);
router
  .route("/location/image/:id")
  .put(isAuthenticated, singleUpload, updateLocationImage);
router.route("/locations").get(isAuthenticated, getAllLocations);
router.route("/location/:id").get(isAuthenticated, getLocationInfo);
router.route("/location/:id").delete(isAuthenticated, deleteLocation);
router
  .route("/location/image/:id")
  .delete(isAuthenticated, deleteLocationImage);

export default router;
