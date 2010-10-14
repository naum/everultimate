MAN = {};

MAN.SKILLCHART = [ 'P', 'R', 'X' ];

MAN.SKILLMARKS = {
    'P': [ 'i', '', 'P', '@' ],
    'R': [ 'd', '', 'R', '#' ],
    'X': [ 'p', '', 'X', '%' ]
};

MAN.displaySkillLabel = function(m) {
    var sklab = '';
    $.each(MAN.SKILLMARKS, function(sk, ml) {
        sklab += ml[m.skill[sk]];
    });
    return sklab;
};

MAN.randSkill = function() {
  var sum = 0;
  for (var i = 0; i < 3; i++) {
    if (RNG.rollDie() >= 5) { sum += 1; }
  }
  return sum;
};

MAN.spawn = function(p) {
  var skillchart = {};
  $.each(MAN.SKILLCHART, function(i, v) {
    skillchart[v] = MAN.randSkill();
  });
  return { 
    name: NAMEPOOL.draw(),
    skill: skillchart
  };
};

MAN.worth = function(m) {
  var sum = 0;
  $.each(m.skill, function(i, v) {
    sum += v;
  });
  return sum;
}

NAMEPOOL = {};

NAMEPOOL.draw = function() {
  if (NAMEPOOL.pool.length == 0) { NAMEPOOL.replenish(); }
  return $.capitalize(NAMEPOOL.pool.pop());
};

NAMEPOOL.replenish = function() {
  $.ajax({
    async: false,
    url: '/words12.txt',
    success: function(data) {
      var wordlist = data.split('\n');
      $.shuffle(wordlist);
      NAMEPOOL.pool = wordlist.slice(0, 1000);
    }
  });
}

NAMEPOOL.pool = [];

RNG = {};

RNG.rollDie = function() {
  return Math.floor(Math.random() * 6) + 1;
};

TEAM = {};

TEAM.ROSTERCHART = {
  slots: 3
};

TEAM.spawn = function(i) {
  return {
    city: TEAMPOOL.pool[i],
    roster: []
  }
};

TEAM.winPercentage = function(t) {
  return t.w / (t.w + t.l);
};

TEAMPOOL = {};

TEAMPOOL.CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Philadelphia', 'Dallas', 'Miami',
  'Washington', 'Houston', 'Detroit', 'Boston', 'Atlanta', 'San Francisco',
  'Riverside', 'Phoenix', 'Seattle', 'Minneapolis', 'San Diego', 'St. Louis',
  'Baltimore', 'Pittsburgh', 'Tampa', 'Denver', 'Cleveland', 'Cincinnati',
  'Portland', 'Kansas City', 'Sacramento', 'San Jose', 'San Antonio', 'Orlando',
  'Columbus', 'Providence', 'Virginia Beach', 'Indianapolis', 'Milwaukee', 'Las Vegas',
  'Charlotte', 'New Orleans', 'Nashville', 'Austin', 'Memphis', 'Buffalo',
  'Louisville', 'Hartford', 'Jacksonville', 'Richmond', 'Oklahoma City', 'Birmingham'
];

TEAMPOOL.pool = [];

TEAMPOOL.draw = function() {
  return TEAMPOOL.pool.pop();
};

UUA = {};

UUA.data = {
  manstats: {},
  freeagents: [],
  n: null,
  schedule: [],
  standings: {},
  teams: [],
  title: null
};

UUA.assignFreeagents = function() {
  $.each(TEAM.POSCHART, function(p, r) {
    var candidates = $.grep(UUA.data.freeagents, function(fa) {
      return (fa.pos == p);
    })
    $.shuffle(candidates);
    $.each(UUA.data.teams, function(tx) {
      for (var i = 0; i < TEAM.POSCHART[p].slots; i += 1) {
        UUA.data.teams[tx].roster.push(candidates.pop());
      }
    });
  });
  UUA.data.freeagents = [];
}

UUA.genesis = function(tt) {
  UUA.data.n = tt || 8;
  UUA.data.title = 'UUA';
  UUA.data.teams = [];
  TEAMPOOL.pool = TEAMPOOL.CITIES;
  $.shuffle(TEAMPOOL.pool);
  for (var i = 0; i < UUA.data.n; i += 1) {
    UUA.data.teams.push(TEAM.spawn(i));
  }
  UUA.data.freeagents = [];
  for (var i = 0; i < tt; i += 1) {
    $.each(TEAM.POSCHART, function(k, v) {
      for (var i = 0; i < v.slots; i += 1) {
        UUA.data.freeagents.push(MAN.spawn(k));
      }
    });
  }
  UUA.assignFreeagents();
  UUA.initStandings();
};

UUA.initStandings = function() {
  UUA.data.standings = {};
  $.each(UUA.data.teams, function(i, t) {
    var c = t.city;
    UUA.data.standings[c] = { 
      w: 0, l: 0, pf: 0, pa: 0
    }
  });
};

