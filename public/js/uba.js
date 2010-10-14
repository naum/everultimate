MAN = {};

MAN.SKILLCHART = [ 'W', 'K', 'P', 'R', 'F', 'T' ];

MAN.randSkill = function() {
  var r1, r2, r3, r4;
  r1 = RNG.rollDie();
  r2 = RNG.rollDie();
  r3 = RNG.rollDie();
  r4 = RNG.rollDie();
  var baseSkill = (r1 + r2 + r3 + r4) - Math.min(r1, r2, r3, r4);
  return Math.floor(baseSkill / 2) + MAN.randSkillBonus();
};

MAN.randSkillBonus = function() {
  var bd = RNG.rollDie();
  var bp = 0;
  if (bd == 1) {
    bp = -1;
    while (RNG.rollDie() == 1) { bp -= 1; }
  } else if (bd == 6) {
    bp = 1;
    while (RNG.rollDie() == 6) { bp += 1; }
  }
  return bp;
};

MAN.spawn = function(p) {
  var skillchart = {};
  $.each(MAN.SKILLCHART, function(i, v) {
    skillchart[v] = MAN.randSkill();
  });
  return { 
    name: NAMEPOOL.draw(),
    pos: p,
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

TEAM.POSCHART = {
  U: { slots: 1 },
  O: { slots: 3 },
  I: { slots: 4 },
  C: { slots: 1 },
  P: { slots: 4 }
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

UBA = {};

UBA.data = {
  batterstats: {},
  fielderstats: {},
  freeagents: [],
  n: null,
  pitcherstats: {},
  schedule: [],
  standings: {},
  teams: [],
  title: null
};

UBA.assignFreeagents = function() {
  $.each(TEAM.POSCHART, function(p, r) {
    var candidates = $.grep(UBA.data.freeagents, function(fa) {
      return (fa.pos == p);
    })
    $.shuffle(candidates);
    $.each(UBA.data.teams, function(tx) {
      for (var i = 0; i < TEAM.POSCHART[p].slots; i += 1) {
        UBA.data.teams[tx].roster.push(candidates.pop());
      }
    });
  });
  UBA.data.freeagents = [];
}

UBA.genesis = function(tt) {
  UBA.data.n = tt || 8;
  UBA.data.title = 'UBA';
  UBA.data.teams = [];
  TEAMPOOL.pool = TEAMPOOL.CITIES;
  $.shuffle(TEAMPOOL.pool);
  for (var i = 0; i < UBA.data.n; i += 1) {
    UBA.data.teams.push(TEAM.spawn(i));
  }
  UBA.data.freeagents = [];
  for (var i = 0; i < tt; i += 1) {
    $.each(TEAM.POSCHART, function(k, v) {
      for (var i = 0; i < v.slots; i += 1) {
        UBA.data.freeagents.push(MAN.spawn(k));
      }
    });
  }
  UBA.assignFreeagents();
  UBA.initStandings();
};

UBA.initStandings = function() {
  UBA.data.standings = {};
  $.each(UBA.data.teams, function(i, t) {
    var c = t.city;
    UBA.data.standings[c] = { 
      w: 0, l: 0, rf: 0, ra: 0
    }
  });
};

