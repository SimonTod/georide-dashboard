const axios = require('axios')
const _ = require('lodash')
const querystring = require('querystring');
const config = require('../config')


module.exports = {
  login: async function(email,password){
    var login={}
    const headers_login =
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    await axios.post(config.api_url+'/user/login',querystring.stringify({
      email:email,
      password:password
    }),headers_login)
    .then(function (response) {
      login.status = response.status
      login.data = response.data
    })
    .catch(function (error) {
      login.status = error.response.status
      login.error = error.response.data.error
    });
    return login
  },
  logout: async function(user){
    var login={}
    const headers_login =
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer '+user.authToken
      }
    }
    await axios.post(config.api_url+'/user/logout',querystring.stringify({}),headers_login)
    .then(function (response) {
      console.log(response);
      // login.status = response.status
      // login.data = response.data
      logout = response.status
    })
    .catch(function (error) {
      console.log(error);
      // login.status = error.response.status
      // login.error = error.response.data.error
      logout = 'KO'
    });
    return logout
  },
  getUserInfos: async function(user){
    const headers =
    {
      headers: {
        'Authorization': 'Bearer '+user.authToken
      }
    }
    await axios.get(config.api_url+'/user',headers)
    .then(function (response) {
      user = response.data
    })
    .catch(function (error) {
      user = 'KO'
    });
    return user
  },
  getTrackers: async function(user){
    const headers =
    {
      headers: {
        'Authorization': 'Bearer '+user.authToken
      }
    }
    await axios.get(config.api_url+'/user/trackers/',headers)
    .then(function (response) {
      trackers = response.data
    })
    .catch(function (error) {
      trackers = 'KO'
    });
    return trackers
  },
  getTrackerInfo: async function(user,trackerId){
    const headers =
    {
      headers: {
        'Authorization': 'Bearer '+user.authToken
      }
    }
    await axios.get(config.api_url+'/user/trackers/',headers)
    .then(function (response) {
      trackers = response.data
    })
    .catch(function (error) {
      trackers = 'KO'
    });
    if (trackers != 'KO') {
      _.forEach(trackers, function(tracker) {
        if (tracker.trackerId == trackerId) {
          myTracker = tracker
        }
      });
    }else {
      myTracker = trackers
    }

    return myTracker
  },
  getTrips: async function(user,trakerId,from,to){
    const headers =
    {
      headers: {
        'Authorization': 'Bearer '+user.authToken
      }
    }
    await axios.get(config.api_url+'/tracker/'+trakerId+'/trips?from='+from+'&to='+to,headers)
    .then(function (response) {
      trips = response.data
    })
    .catch(function (error) {
      trips = 'KO'
    });
    return trips
  },
  getPositions: async function(user,trakerId,from,to){
    const headers =
    {
      headers: {
        'Authorization': 'Bearer '+user.authToken
      }
    }
    await axios.get(config.api_url+'/tracker/'+trakerId+'/trips/positions?from='+from+'&to='+to,headers)
    .then(function (response) {
      positions = response.data
    })
    .catch(function (error) {
      positions = 'KO'
    });
    return positions
  },
  lock: async function(user,trakerId){
    const headers =
    {
      headers: {
        'Authorization': 'Bearer '+user.authToken
      }
    }
    await axios.post(config.api_url+'/tracker/'+trakerId+'/lock',{trakerId:trakerId},headers)
    .then(function (response) {
      lock = response.status
    })
    .catch(function (error) {
      lock = 'KO'
    });
    return lock
  },
  unlock: async function(user,trakerId){
    const headers =
    {
      headers: {
        'Authorization': 'Bearer '+user.authToken
      }
    }
    await axios.post(config.api_url+'/tracker/'+trakerId+'/unlock',{trakerId:trakerId},headers)
    .then(function (response) {
      lock = response.status
    })
    .catch(function (error) {
      lock = 'KO'
    });
    return lock
  },
  createSharableTripLink: async function(user,trackerId,tripId){
    const headers = {
      headers: {
        'Authorization': 'Bearer '+user.authToken
      }
    }
    return await axios.post(config.api_url+'/tracker/'+trackerId+'/share/trip',{trackerId:trackerId,tripId:tripId},headers)
    .then(function (response) {
      return response.data.url
    })
    .catch(function (error) {
      throw new Error(error);
    });
  }
}
