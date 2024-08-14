var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User = require('./models/User.js');
var config = require('./config.js');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
  return jwt.sign(user, config.secretKey,
    { expiresIn: 86400  });
};


// bắt buộc phải dùng promise không dùng được callback
exports.jwtPassport = passport.use(
  new JwtStrategy(
      {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: config.secretKey,
      },
      (jwt_payload, done) => {
          User.findOne({ _id: jwt_payload._id })
              .then(user => {
                  if (user) {
                      return done(null, user);
                  } else {
                      return done(null, false);
                  }
              })
              .catch(err => done(err, false));
      }
  )
);
exports.verifyToken = function(req, res, next) {
    const token = req.body.token || req.query.token || req.headers.authorization.split(' ')[1];
  
    if (!token) {
      return res.status(403).json({ success: false, message: 'Token is required.' });
    }
  
    jwt.verify(token, config.secretKey, function(err, decoded) {
      if (err) {
        return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
      }
  
      req.decoded = decoded;
      next();
    });
  };


exports.verifyUser = passport.authenticate('jwt', { session: false });