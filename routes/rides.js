const { application } = require('express');
const express = require('express'); 
const router  = express.Router();

const rideController = require('../controllers/rides'); 

router.get('/create', rideController.renderNewRide);

router.post('/create', rideController.newRide);

router.get('/search', rideController.renderSearchRide);

router.post('/search', rideController.searchRide);

router.get('/book/:rideId', rideController.searchedRideInfo);

router.post('/book/:rideId', rideController.bookRide);

router.get('/pastrides/select', rideController.renderPastRidesSelect)

router.get('/pastrides/select/driver', rideController.renderPastRidesDriver);

router.get('/pastrides/select/passenger', rideController.renderPastRidesPassenger);

router.get ('/pastride/driver/:rideId', rideController.renderPastRideDriver);

router.get('/pastride/passenger/:rideId', rideController.renderPastRidePassenger);

router.get('/upcoming/select', rideController.renderUpcomingRidesSelect);

router.get ('/upcoming/select/driver', rideController.renderUpcomingRidesDriver);

router.get('/upcoming/select/passenger', rideController.renderUpcomingRidesPassenger);

router.get('/upcoming/driver/:rideId', rideController.renderUpcomingRideDriver);

router.get('/upcoming/passenger/:rideId', rideController.renderUpcomingRidePassenger);

router.get('/review/:rideId', rideController.renderReviewRide);

router.post('/review/:rideId', rideController.reviewRide);

router.get('/reviews/:userId', rideController.reviews);

router.get ('/ride/:rideid', rideController.ride);

router.get('/end/:rideId', rideController.endRidePOST);

router.get ('/start', rideController.start);

module.exports = router;