
var routes = [
  {
    name: 'login',
    path: '/',
    url: './index.html',
    options: {
      transition: 'f7-cover-v',
    },
  },
  {
    name: 'register',
    path: '/register/',
    url: './pages/register.html',
    options: {
      transition: 'f7-flip',
    },
  },
  {
    name: 'calibration',
    path: '/calibration/',
    url: './pages/calibration.html',
    options: {
      transition: 'f7-cover-v',
    },
  },
  {
    name: 'assessment',
    path: '/assessment/',
    url: './pages/assessment.html',
    options: {
      transition: 'f7-push',
    },
  },
  {
    name: 'criteria',
    path: '/criteria/',
    url: './pages/criteria.html',
    options: {
      transition: 'f7-circle',
    },
  },
  {
    name: 'programs',
    path: '/programs/',
    url: './pages/programs.html',
    options: {
      transition: 'f7-circle',
    },
  },
  {
    name: 'stats',
    path: '/stats/',
    url: './pages/stats.html',
    options: {
      transition: 'f7-circle',
    },
  },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
