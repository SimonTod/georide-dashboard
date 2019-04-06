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
    var tempTime = moment.duration(user.tripsDuration);
    user.tripsDuration = tempTime.hours()

    res.render('dashboard/home', { title: 'Dashboard - Home',link:"dashboard",sublink:"accueil",user,trackers });
  },
  profil: async function(req, res){
    user = req.session.user

    res.render('dashboard/monCompte', { title: 'Dashboard - Home',link:"dashboard",sublink:"accueil",user });
  },
  vehicules: async function(req, res){
    user = req.session.user
    trackers = await api.getTrackers(user);

    res.render('dashboard/listeTrackers', { title: 'Dashboard - Home',link:"dashboard",sublink:"vehicules",trackers,user });
  },
  traker: async function(req, res){
    user = req.session.user
    var trakerId = req.params.id,myTracker,trackerDistance=0

    trips = await api.getTrips(user,trakerId,user.createdAt,moment().toDate().toJSON())

    trackers = await api.getTrackers(user);

    _.forEach(trackers, function(tracker) {
      if (tracker.trackerId == trakerId) {
        myTracker = tracker
      }
    });

    console.log(myTracker);

    myTracker.distance = 0
    myTracker.maxSpeed = 0
    myTracker.averageSpeed = 0
    myTracker.duration = 0
    trips = _.reverse(trips)
    _.forEach(trips, function(trip,key) {
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
      var tempTime = moment.duration(trip.duration)
      trips[key].duration = tempTime.minutes()
    });
    myTracker.distance = myTracker.distance/1000
    myTracker.odometer = myTracker.odometer/1000
    myTracker.averageSpeed = myTracker.averageSpeed/trips.length
    var tempTime = moment.duration(myTracker.duration);
    myTracker.duration = tempTime.hours()

    res.render('dashboard/tracker', { title: 'Dashboard - Home',link:"dashboard",sublink:myTracker.trackerName,myTracker,trips,user,trackerDistance });
  },
  trajet: async function(req, res){
    user = req.session.user
    var trakerId = req.params.id
    var from = req.params.from
    var to = req.params.to

    positions = await api.getPositions(user,trakerId,from,to)
    start = positions[0]
    end = positions[positions.length-1]

    res.render('dashboard/trajet', { title: 'Dashboard - Home',link:"dashboard",sublink:"vehicules",positions,user,end,start });
  },
  lock: async function(req, res){
    user = req.session.user
    var trakerId = req.params.id

    lock = await api.lock(user,trakerId)
    res.redirect('/dashboard/vehicules')
  },
  unlock: async function(req, res){
    user = req.session.user
    var trakerId = req.params.id

    unlock = await api.unlock(user,trakerId)
    res.redirect('/dashboard/vehicules')
  }
}
