import express from "express";
import {
  getCitiesWithInState,
  getCityInfoFromSlug,
  getLocationsWithInCity,
  getSimilarCities,
  getSimilarLocations,
  getSimilarStates,
  getStateInfoFromSlug,
  sendMail,
} from "../controllers/userController.js";

const router = express.Router();

router.route("/send-email").post(sendMail);
router.route("/state/:stateSlug").get(getStateInfoFromSlug);
router.route("/state/:stateSlug/city/:citySlug").get(getCityInfoFromSlug);
router.route("/cities/similar/:stateId/:cityId").get(getSimilarCities);
router.route("/locations/similar/:cityId/:locationId").get(getSimilarLocations);
router.route("/states/similar/:stateId").get(getSimilarStates);
router.route("/cities/:stateId").get(getCitiesWithInState);
router.route("/locations/:cityId").get(getLocationsWithInCity);

export default router;
