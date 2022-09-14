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
        var tempTime = moment.duration(trip.duration)
        trips[key].duration = tempTime.minutes()
      });
      myTracker.averageSpeed = myTracker.averageSpeed/trips.length
    }else {
      trips = []
    }

    myTracker.distance = myTracker.distance/1000
    myTracker.speed = myTracker.speed*1.852
    myTracker.odometer = myTracker.odometer/1000

    var tempTime = moment.duration(myTracker.duration);
    myTracker.duration = tempTime.hours()

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
    var tempTime = moment.duration(trip.duration);
    trip.duration = tempTime.minutes()
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

    res.render('dashboard/trajet', { title: 'Dashboard - Home',link:"dashboard",sublink:"vehicules",sublink2:myTracker.trackerName,sublink3:start,positions,user,end,start,trip,trakerId });
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
  shareTrip: async function(req, res){
    user = req.session.user
    var trackerId = req.params.id
    var tripId = req.params.tripid
  
    try {
      url = await api.createSharableTripLink(user, trackerId, tripId)
      res.redirect(url);
    } catch (error) {
      res.redirect('/');
    }
  }
}
