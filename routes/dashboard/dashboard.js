const axios = require('axios')
const moment = require('moment')
const _ = require('lodash')
const config = require('../../config')
const api = require('../../api/georide')


module.exports = {
  home: async function(req, res){
    user = req.session.user
    user.tripsCount = 0
    user.tripsDistance = 0
    user.tripsDuration = 0
    trackers = await api.getTrackers(user)

    for (var i = 0, len = trackers.length; i < len; i++) {
      trackers[i].trips = await api.getTrips(user,trackers[i].trackerId,user.createdAt,moment().toDate().toJSON())
      trackers[i].tripsCount = trackers[i].trips.length
      user.tripsCount += trackers[i].tripsCount
      _.forEach(trackers[i].trips, function(trip) {
        user.tripsDistance += trip.distance
        user.tripsDuration += trip.duration
      });
    }

    user.tripsDistance = user.tripsDistance/1000
    user.tripsDuration = Math.round(user.tripsDuration / (1000 * 60 * 60))

    res.render('dashboard/home', { title: 'Dashboard - Home',link:"dashboard",sublink:"dashboard",user,trackers });
  },
  profil: async function(req, res){
    user = req.session.user

    res.render('dashboard/monCompte', { title: 'Dashboard - Home',link:"dashboard",sublink:"profil",user });
  },
  vehicules: async function(req, res){
    user = req.session.user
    trackers = await api.getTrackers(user);

    res.render('dashboard/listeTrackers', { title: 'Dashboard - Home',link:"dashboard",sublink:"vehicules",trackers,user });
  },
  traker: async function(req, res){
    user = req.session.user
    var trakerId = req.params.id,myTracker,trackerDistance=0

    myTracker = await api.getTrackerInfo(user,trakerId);

    myTracker.distance = 0
    myTracker.maxSpeed = 0
    myTracker.averageSpeed = 0
    myTracker.duration = 0

    if (myTracker.canSeeStatistics) {
      trips = await api.getTrips(user,trakerId,myTracker.activationDate,moment().toDate().toJSON())

      trips = _.reverse(trips)
      _.forEach(trips, function(trip,key) {
        trip.maxSpeed = trip.maxSpeed*1.852
        trip.averageSpeed =  trip.averageSpeed*1.852
        if (trip.maxSpeed > myTracker.maxSpeed) {
          myTracker.maxSpeed = trip.maxSpeed
        }
        myTracker.distance += trip.distance
        myTracker.averageSpeed += trip.averageSpeed
        myTracker.duration += trip.duration
        if (trip.startAddress) {
          splitAddress = _.split(trip.startAddress, ',');
          trips[key].startAddress = splitAddress[1]
        }
        if (trip.endAddress) {
          splitAddress = _.split(trip.endAddress, ',');
          trips[key].endAddress = splitAddress[1]
        }
        trips[key].distance = trip.distance/1000
        trips[key].duration = Math.round(trip.duration / (1000 * 60))
      });
      myTracker.averageSpeed = myTracker.averageSpeed/trips.length
    }else {
      trips = []
    }

    myTracker.distance = myTracker.distance/1000
    myTracker.speed = myTracker.speed*1.852
    myTracker.odometer = myTracker.odometer/1000

    myTracker.duration = Math.round(myTracker.duration / (1000 * 60 * 60))

    res.render('dashboard/tracker', { title: 'Dashboard - Home',link:"dashboard",sublink:"vehicules",sublink2:myTracker.trackerName,myTracker,trips,user,trackerDistance });
  },
  trajet: async function(req, res){
    user = req.session.user
    var trakerId = req.params.id
    var from = req.params.from
    var to = req.params.to

    myTracker = await api.getTrackerInfo(user,trakerId);

    trip = await api.getTrips(user,trakerId,from,to)
    trip = trip[0]
    trip.maxSpeed = trip.maxSpeed*1.852
    trip.averageSpeed = trip.averageSpeed*1.852
    trip.distance = trip.distance/1000
    trip.duration = Math.round(trip.duration / (1000 * 60))
    if (trip.startAddress) {
      splitAddress = _.split(trip.startAddress, ',');
      trip.startAddress = splitAddress[1]
    }
    if (trip.endAddress) {
      splitAddress = _.split(trip.endAddress, ',');
      trip.endAddress = splitAddress[1]
    }

    positions = await api.getPositions(user,trakerId,from,to)
    start = positions[0]
    end = positions[positions.length-1]

    res.render('dashboard/trajet', { title: 'Dashboard - Home', link: "dashboard", sublink: "vehicules", sublink2: myTracker.trackerName, sublink3: start, positions, user, end, start, trip, trakerId });
  },
  lock: async function(req, res){
    user = req.session.user
    var trakerId = req.params.id

    lock = await api.lock(user,trakerId)
    if (req.query.page == 'detail') {
      res.redirect('/dashboard/vehicules/'+trakerId)
    }else {
      res.redirect('/dashboard/vehicules')
    }
  },
  unlock: async function(req, res){
    user = req.session.user
    var trakerId = req.params.id

    unlock = await api.unlock(user,trakerId)
    if (req.query.page == 'detail') {
      res.redirect('/dashboard/vehicules/'+trakerId)
    }else {
      res.redirect('/dashboard/vehicules')
    }
  },
  averageTripDuration: async function(req, res) {
    const user = req.session.user
    const trackerId = req.params.id
    let body = req.body;
    body.startLat = parseFloat(body.startLat);
    body.startLon = parseFloat(body.startLon);
    body.endLat = parseFloat(body.endLat);
    body.endLon = parseFloat(body.endLon);

    const approximation = 0.0005;

    const trips = await api.getTrips(user, trackerId, user.createdAt,moment().toDate().toJSON());
    const tripsConcerned = trips.filter(trip => {
      trip.startLat = parseFloat(trip.startLat);
      trip.startLon = parseFloat(trip.startLon);
      trip.endLat = parseFloat(trip.endLat);
      trip.endLon = parseFloat(trip.endLon);

      if (!((body.startLat - approximation) < trip.startLat && trip.startLat < (body.startLat + approximation))) {
        // console.debug(`startLat: !(${body.startLat - approximation} < ${trip.startLat} && ${trip.startLat} < ${body.startLat + approximation})`);
        return false;
      }
      if (!((body.startLon - approximation) < trip.startLon && trip.startLon < (body.startLon + approximation))) {
        // console.debug(`startLon: !(${body.startLon - approximation} < ${trip.startLon} && ${trip.startLon} < ${body.startLon + approximation})`);
        return false;
      }
      if (!((body.endLat - approximation) < trip.endLat && trip.endLat < (body.endLat + approximation))) {
        // console.debug(`endLat: !(${body.endLat - approximation} < ${trip.endLat} && ${trip.endLat} < ${body.endLat + approximation})`);
        return false;
      }
      if (!((body.endLon - approximation) < trip.endLon && trip.endLon < (body.endLon + approximation))) {
        // console.debug(`endLon: !(${body.endLon - approximation} < ${trip.endLon} && ${trip.endLon} < ${body.endLon + approximation})`);
        return false;
      }

      // console.debug(`startLat: (${body.startLat - approximation} < ${trip.startLat} && ${trip.startLat} < ${body.startLat + approximation})`);
      // console.debug(`startLon: (${body.startLon - approximation} < ${trip.startLon} && ${trip.startLon} < ${body.startLon + approximation})`);
      // console.debug(`endLat: (${body.endLat - approximation} < ${trip.endLat} && ${trip.endLat} < ${body.endLat + approximation})`);
      // console.debug(`endLon: (${body.endLon - approximation} < ${trip.endLon} && ${trip.endLon} < ${body.endLon + approximation})`);

      return true;
    });

    console.log(tripsConcerned.length);
    
    const durations = tripsConcerned.map(trip => trip.duration);
    const average = durations.reduce((a, b) => a + b, 0) / durations.length;

    // 1- Convert to seconds:
    let seconds = Math.round(average / 1000);
    // 2- Extract hours:
    const hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    const minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;

    res.json(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  }
}
