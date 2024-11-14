import express from "express";
import {
  getCitiesWithInState,
  getCityInfoFromSlug,
  getLocationsWithInCity,
  getSimilarCities,
  getSimilarLocations,
  getSimilarStates,
  getStateInfoFromSlug,
  getTrendingCities,
  getTrendingStates,
  sendMail,
} from "../controllers/userController.js";
import { getAllStates } from "../controllers/stateController.js";
import { getAllCity } from "../controllers/cityController.js";

const router = express.Router();

router.route("/send-email").post(sendMail);
router.route("/state/:stateSlug").get(getStateInfoFromSlug);
router.route("/state/:stateSlug/city/:citySlug").get(getCityInfoFromSlug);
router.route("/cities/similar/:stateId/:cityId").get(getSimilarCities);
router.route("/locations/similar/:cityId/:locationId").get(getSimilarLocations);
router.route("/states/similar/:stateId").get(getSimilarStates);
router.route("/cities/:stateId").get(getCitiesWithInState);
router.route("/locations/:cityId").get(getLocationsWithInCity);
router.route("/states").get(getAllStates);
router.route("/cities").get(getAllCity);
router.route("/trending/cities").get(getTrendingCities);
router.route("/trending/states").get(getTrendingStates);

export default router;
