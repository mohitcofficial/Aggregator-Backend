import express from "express";
import {
  getCityInfoFromSlug,
  getSimilarCities,
  getSimilarLocations,
  getStateInfoFromSlug,
  sendMail,
} from "../controllers/userController.js";

const router = express.Router();

router.route("/send-email").post(sendMail);
router.route("/state/:stateSlug").get(getStateInfoFromSlug);
router.route("/state/:stateSlug/city/:citySlug").get(getCityInfoFromSlug);
router.route("/cities/similar/:stateId/:cityId").get(getSimilarCities);
router.route("/locations/similar/:cityId/:locationId").get(getSimilarLocations);

export default router;
