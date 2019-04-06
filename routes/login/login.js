const axios = require('axios')
const querystring = require('querystring');
const api = require('../../api/georide')
const config = require('../../config')

module.exports = {
  home: function(req, res){
    res.redirect('/dashboard')
  },
  login: async function(req, res){
    res.render('login/login', { title: 'Dashboard - Home',link:"dashboard",sublink:"accueil" });
  },
  logout: async function(req, res){
    user = req.session.user
    logout = await api.logout(user)
    if (logout == 204) {
      req.session.destroy();
      res.redirect('/dashboard')
    }else {
      res.redirect('/dashboard')
    }
  },
  handleLogin: async function(req, res){
    const body = req.body
    var user = {},login={},errors = []

    if (body.email) {
      user.email = body.email;
    }else {
      errors.push('Email manquant');
    }
    if (body.password) {
      user.password = body.password;
    }else {
      errors.push('Mot de passe manquant');
    }

    if (errors.length==0) {

      login = await api.login(user.email,user.password)

      if (login.status == 200) {
        req.session.user = {
            'id': login.data.id,
            'email' : login.data.email,
            'authToken' : login.data.authToken,
            'isAdmin' : login.data.isAdmin
          };
        req.session.authenticated = true;

        user = await api.getUserInfos(req.session.user)

        req.session.user.firstName = user.firstName
        req.session.user.dateOfBirth = user.dateOfBirth
        req.session.user.createdAt = user.createdAt
        req.session.user.phoneNumber = user.phoneNumber

        res.redirect('/dashboard')

      }else if (login.status = 403) {
        errors.push('Email ou mot de passe incorect');

        res.render('login/login', { title: 'Dashboard - Connexion',errors });
      }


    }else {
      res.render('login/login', { title: 'Dashboard - Connexion',errors,user });
    }
  },
  register: async function(req, res){
    res.render('login/register', { title: 'Dashboard - Home',link:"dashboard",sublink:"accueil" });
  },
  cgv: async function(req, res){
    res.render('login/cgv', { title: 'Dashboard - Home',link:"dashboard",sublink:"accueil" });
  }
}
