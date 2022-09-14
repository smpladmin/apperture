export const filtersSchema = {
  filterTypes: [
    {
      label: 'Device',
      id: 'device',
      isCategory: true,
      subSections: [
        {
          label: 'Device Type',
          id: 'deviceType',
        },
        {
          label: 'OS',
          id: 'os',
        },
      ],
    },
    {
      label: 'Geography',
      id: 'geography',
      isCategory: true,
      subSections: [
        {
          label: 'City',
          id: 'city',
        },
        {
          label: 'Country',
          id: 'country',
        },
      ],
    },
    {
      label: 'UTM',
      id: 'utm',
      isCategory: true,
      subSections: [
        {
          label: 'Source',
          id: 'utmSource',
        },
        {
          label: 'Campaign',
          id: 'utmCampaign',
        },
        {
          label: 'Medium',
          id: 'utmMedium',
        },
      ],
    },
  ],
  filterOptions: {
    deviceType: [
      {
        label: 'XYZ',
        id: 'XYZ',
      },
    ],
    os: [
      {
        label: 'Android',
        id: 'android',
      },
      {
        label: 'iOS',
        id: 'ios',
      },
      {
        label: 'Windows',
        id: 'windows',
      },
      {
        label: 'macOS',
        id: 'macOs',
      },
      {
        label: 'Linux',
        id: 'linux',
      },
    ],
    city: [
      {
        label: 'Mumbai',
        id: 'Mumbai',
      },
      {
        label: 'Kolkata',
        id: 'Kolkata',
      },
    ],
    country: [
      {
        label: 'IN',
        id: 'IN',
      },
    ],
    utmSource: [
      {
        label: 'google-play',
        id: 'google-play',
      },
      {
        label: 'google',
        id: 'google',
      },
    ],
    utmMedium: [
      {
        label: 'organic',
        id: 'organic',
      },
      {
        label: 'cpc',
        id: 'cpc',
      },
    ],
    utmCampaign: [
      {
        label: 'Campaign',
        id: 'Campaign',
      },
    ],
  },
};
