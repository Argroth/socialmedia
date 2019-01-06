var express = require('express');
var router = express.Router();
var async = require('async');
var request = require('request');
var passport = require('passport');

var Post = require('./models/posts.js');
var Wall = require('./models/wall.js');
var User = require('./models/wall.js');


router.get('/', mainPage, function(req, res){
});




/*--------------------------------logowanie-----------------------------------*/

router.get('/dashboard', isLoggedIn, function(req, res){
  res.redirect('/profile')
});

router.get('/profile', isLoggedIn, function(req, res) {
    User.find({_id: req.user.id}, function(err, users){
    Wall.find({autor: req.params.users_id}, function(err, walls){
            res.render('user.ejs', {
        user: req.user,
        walls: walls
      });
    });
    console.log(users);
  });
});

router.get('/login', function(req, res){
  res.render('login.ejs', { message: req.flash('loginMessage') });
});



router.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile',
        failureRedirect : '/login', 
        failureFlash : true
}));

router.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile',
        failureRedirect : '/signup',
        failureFlash : true 
    }));
 
router.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


/*------------------------------------gra/profilgry-----------------------------*/

router.get('/s', function(req, res){
var var1 = req.query.realm;
var var2 = req.query.summoner;
var var3 = req.query.funkcja;
res.redirect('/'+var3+'/'+var1+'/'+var2);
console.log(var1 + var2 + var3)
});


//router.get('/:var3/:var1/:var2', tryb, function(req, res){
//});

/*-----------------------------FUNKCJE-------------------------------------*/

function isLoggedIn(req, res, next){
  if(req.isAuthenticated())
    return next();
  res.redirect('/login');
};

function tryb(req, res){
  var xx = req.params.var3;
  if(xx === "gra"){
    var data = {};
    var klucz = 'e0a65366-9e07-4f9d-8fc7-03e65ac1498f';
    var nick = req.params.var2.toLowerCase().replace(/\s+/g, '');
    var serw = req.params.var1;
    var serw2 = serw.replace('EUNE', 'EUN1').replace('EUW', 'EUW1');
    var URL = 'https://'+ serw +'.api.pvp.net/api/lol/'+ serw +'/v1.4/summoner/by-name/' + nick +'?api_key=' + klucz;
    async.waterfall([
      function(callback){
        request(URL, function(err, response, body){
          if(!err && response.statusCode == 200){
            var json = JSON.parse(body);
            data.id = json[nick].id;
            callback(null, data);
          }else if(response.statusCode != 200){
            callback(null, data);
          }
        });
      },

      function(data, callback){
          var URL = 'https://eune.api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/'+ serw2 +'/'+ data.id + '?api_key=' + klucz;
          var s = [];
          request(URL, function(err, response, body){
            if(!err && response.statusCode == 200){
              var json = JSON.parse(body);
              for (var i = 0; i< json['bannedChampions'].length; i++){
                s.push(json['bannedChampions'][i].championId);
              };
              data.bnid = s;
              callback(null, data);
            }else if(response.statusCode == 404){
              data.bnid = [];
              data.errors = response.statusCode;
              callback(null, data);
            }
          });
        },

      function(data, callback) { 
      var s = []
      if(data.bnid.length == 0){
        data.error = 1;
        callback(null, data);
      }else{
      for (var r=0, dataRx=0; r<data.bnid.length; r++){
        var URL = 'https://global.api.pvp.net/api/lol/static-data/eune/v1.2/champion/'+ data.bnid[r] +'?locale=en_GB&champData=info&api_key=' + klucz;
          request(URL,function(err, response, body) {
                if(response.statusCode == 200){
                var json = JSON.parse(body);
                s.push(json.name.replace(/\s+/g, '').replace('LeBlanc', 'Leblanc').replace('Fiddlesticks', 'FiddleSticks').replace("Rek'Sai", 'RekSai').replace("Kog'Maw", 'KogMaw').replace("Kha'Zix", 'Khazix'));
                data.bnd = s;
            }else if(err){
            callback(null, data); 
          }  
            dataRx++;
            if(dataRx === data.bnid.length) callback(null, data);
        });
    }}

},

    function(data, callback){
      var s = [];
      var s1 = [];
      var s2 = [];
      var d = [];
      var URL = 'https://'+ serw +'.api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/'+ serw2 +'/'+ data.id +'?api_key=' + klucz;
      request(URL, function(err, response, body){
        if(!err && response.statusCode == 200){
          var json = JSON.parse(body);
          for(var i=0; i<json['participants'].length; i++){
            s.push(json['participants'][i].summonerName);
            d.push(json['participants'][i].championId);
            s1.push(json['participants'][i].spell1Id);
            s2.push(json['participants'][i].spell2Id);
          }
          data.part = s;
          data.chid = d;
          data.platforma = serw2;
          data.s1 = s1;
          data.s2 = s2;
          callback(null, data);
        }else if(response.statusCode == 404){
          data.ng = response.statusCode;
          callback(null, data);
          
        }
      });
    },
function(data, callback) { 
      var s = [];
      if (data.ng == 404){
        callback(null, data);
      } else {
       for (var r=0, dataRx=0; r<data.chid.length; r++){
        var URL = 'https://global.api.pvp.net/api/lol/static-data/eune/v1.2/champion/'+ data.chid[r] +'?locale=en_GB&champData=info&api_key=' + klucz;
          console.log(URL);
          request(URL,function(err, response, body) {
                if(response.statusCode == 200){
                var json = JSON.parse(body);
                s.push(json.name.replace(/\s+/g, '').replace('LeBlanc', 'Leblanc').replace('Fiddlesticks', 'FiddleSticks').replace("Rek'Sai", 'RekSai').replace("Kog'Maw", 'KogMaw').replace("Kha'Zix", "Khazix"));
                data.champ = s;
            }else if(err){
          
          }
            dataRx++;
            if(dataRx == data.chid.length) callback(null, data);
            console.log(data.champ);
        });
    };
}
},

      ],
          function(err, data){
      if(err){
          return; 
      }
      res.render('gra.ejs',{
        info: data

      });
    }
      )

  }else{
  var data = {};
  var y = [];
  var klucz = 'e0a65366-9e07-4f9d-8fc7-03e65ac1498f';
  var nick = req.params.var2.toLowerCase().replace(/\s+/g, '');
  var serw = req.params.var1;
  var serw2 = serw.replace('EUNE', 'EUN1').replace('EUW', 'EUW1');
  var URL = 'https://'+ serw +'.api.pvp.net/api/lol/'+ serw +'/v1.4/summoner/by-name/' + nick +'?api_key=' + klucz;
    async.waterfall([
      function(callback){
        request(URL, function(err, response, body){
          if(!err && response.statusCode == 200){
          var json = JSON.parse(body);
          data.id = json[nick].id;
          data.lvl = json[nick].summonerLevel;
          data.nazwa = json[nick].name;
          data.ikona = json[nick].profileIconId;
          data.platforma = serw.toUpperCase();
          callback(null, data);
        } else if(response.statusCode != 200){
          data.error = response.statusCode;
          callback(null, data);
        }

        });
      },

  function(data, callback){
    var s = {};
    var serw3 = serw.toLowerCase();
    var URL = 'https://'+ serw3 +'.api.pvp.net/api/lol/'+ serw3 +'/v2.5/league/by-summoner/'+ data.id +'/entry?api_key=' + klucz;
      console.log(URL);
      request(URL, function(err, response, body){
      if(!err && response.statusCode == 200){
        var json = JSON.parse(body);
        
        for (var m = 0; m < json[data.id].length; m++) {
            s[json[data.id][m].queue] = {     
            name: json[data.id][m].name,
            tier: json[data.id][m].tier,
            division: json[data.id][m].entries[0].division,
            points: json[data.id][m].entries[0].leaguePoints,
            wins: json[data.id][m].entries[0].wins,
            losses: json[data.id][m].entries[0].losses
      };
}
  if(s["RANKED_FLEX_TT"] == null){
    data.flex = 0;
  }else{
    data.flex = s["RANKED_FLEX_TT"];
  }  
  if(s["RANKED_SOLO_5x5"] == null){
    data.solo5 = 0;
  }else{
    data.solo5 = s["RANKED_SOLO_5x5"];
  }  
  if(s["RANKED_TEAM_5x5"] == null){
    data.team5 = 0;
  }else{
    data.team5 = s["RANKED_TEAM_5x5"];
  }  
  if(s["RANKED_SOLO_3x3"] == null){
    data.solo3 = 0;
  }else{
    data.solo3 = s["RANKED_SOLO_3x3"];
  }  
  if(s["RANKED_TEAM_3x3"] == null){
    data.team3 = 0;
  }else{
    data.team3 = s["RANKED_TEAM_3x3"];
  }


        callback(null, data);
      }else if (response.statusCode == 404){
        data.err = 1;
        callback(null, data);
      }
    });
  },

      function(data, callback){
        var URL = 'https://'+ serw +'.api.pvp.net/championmastery/location/'+ serw2 +'/player/'+ data.id +'/topchampions?count=1&api_key='+ klucz;
          request(URL, function(err, response, body){
          if(!err && response.statusCode == 200){
            var json = JSON.parse(body);
            data.masid = json[0].championId;
            data.maspts = json[0].championPoints;
            data.maslvl = json[0].championLevel;
            data.mastoken = json[0].tokensEarned; 
            callback(null,data);
          }else{
            callback(null, data);
          }
    });
 
},

  function(data, callback){
    var URL = 'https://global.api.pvp.net/api/lol/static-data/eune/v1.2/champion/'+ data.masid +'?locale=en_GB&champData=info&api_key=' + klucz;
    request(URL, function(err, response, body){
      if(!err && response.statusCode == 200){
        var json = JSON.parse(body);
        data.masnazwa = json.name;
        callback(null, data);
      }else{
        callback(null, data);
      }
    });
  },

  function(data, callback){
    var s = {};
    var URL = 'https://eune.api.pvp.net/api/lol/'+ serw +'/v1.3/stats/by-summoner/'+ data.id +'/summary?season=SEASON2016&api_key=' + klucz;
    request(URL, function(err, response, body){
      if(!err && response.statusCode == 200){
        var json = JSON.parse(body);
        for (var m = 0; m < json['playerStatSummaries'].length; m++) {
            s[json['playerStatSummaries'][m].playerStatSummaryType] = {     
            wins: json['playerStatSummaries'][m].wins,
            losses: json['playerStatSummaries'][m].losses
      };
}
        data.nw = s["Unranked"].wins;
        data.rs5 = s["RankedSolo5x5"].wins;
        data.rs5l = s["RankedSolo5x5"].losses;
        data.rt5 = s["RankedTeam5x5"].wins;
        data.rt5l = s["RankedTeam5x5"].losses;
        data.rt3 = s["RankedTeam3x3"].wins;
        data.rt3l = s["RankedTeam3x3"].losses;

        callback(null, data);
      }else{
        callback(null, data);
      }
    });
  }

],

  function(err, data){
      if(err){
          return; 
      }
      res.render('profil.ejs',{
        info: data

      });
    });
};
};

function mainPage (req, res){
  var data = {};
  var klucz = 'e0a65366-9e07-4f9d-8fc7-03e65ac1498f';
  var free = [];
  var x = [];
  

  async.waterfall([
    function(callback){
      var URL = 'https://na.api.pvp.net/api/lol/na/v1.2/champion?freeToPlay=true&api_key='+ klucz;
            request(URL, function(err, response, body) {
                if(response.statusCode == 200){
                    var json = JSON.parse(body);
                    var chid = [];
                       for(var i = 0; i < json['champions'].length; i++){
                        chid.push(json['champions'][i].id);
             }
            data.rotacja = chid;
            free = chid;
            callback(null, data);
                } else if(response.statusCode == 404 || response.statusCode == 400 || response.statusCode == 401 || response.statusCode == 429 || response.statusCode == 500 || response.statusCode == 503){
            data.blad = response.statusCode + "Nie znaleziono";
            callback(null, data);
          
                  }
        
      });
    },

    function(data, callback) { 
       for (var r=0, dataRx=0; r<20; r++){
        var URL = 'https://global.api.pvp.net/api/lol/static-data/eune/v1.2/champion/'+ free[r] +'?locale=en_GB&champData=info&api_key=' + klucz;
          request(URL,function(err, response, body) {
                if(response.statusCode == 200){
                var json = JSON.parse(body);
                x.push(json.name.replace(/\s+/g, '').replace('LeBlanc', 'Leblanc').replace('Fiddlesticks', 'FiddleSticks').replace("Rek'Sai", 'RekSai').replace("Kog'Maw", 'KogMaw').replace("Kha'Zix", 'Khazix').replace("Wukong", 'MonkeyKing'));
                x.sort();
                data.rot = x;
            }else if(response.statusCode == 404 || response.statusCode == 400 || response.statusCode == 401 || response.statusCode == 429 || response.statusCode == 500 || response.statusCode == 503){
            data.blad = response.statusCode + "Nie znaleziono";
            
          }
                
            dataRx++;
            if(dataRx === 20) callback(null, data);
        });
    }

},
],
    function (err, data) {
      Post.find({}, function(err, posts){
        res.render('index.ejs',{
          info: data,
          posts
          });
        });
   });
};


module.exports = router