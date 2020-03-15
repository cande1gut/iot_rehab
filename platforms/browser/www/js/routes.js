
var routes = [
  {
    name: 'login',
    path: '/',
    url: './index.html',
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
    path: '/programs/',
    url: './pages/programs.html',
    options: {
      transition: 'f7-circle',
    },
  },
  {
    path: '/patientHistory/',
    url: './pages/patientHistory.html',
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
