import { findMatches } from '.';

describe('NLP findMatches', () => {
  it('should match possible tokens against available choices of words', () => {
    const query =
      'get me users with count of events they have done by prop.city';
    const choices = [
      'user_id',
      'user',
      'timestamp',
      'event_name',
      'properties.$city',
      'citizen',
      'citizenship',
      'properties.utm_source[0]',
      'properties.utm_source[1]',
      'mean',
    ];

    const chosen = findMatches(query, choices);

    expect(chosen).toEqual([
      {
        word: 'users',
        choices: [
          {
            choice: 'user',
            updated: 'user',
          },
          {
            choice: 'user_id',
            updated: 'user_id',
          },
        ],
      },
      {
        word: 'events',
        choices: [
          {
            choice: 'event_name',
            updated: 'event_name',
          },
        ],
      },
      {
        word: 'prop.city',
        choices: [
          {
            choice: 'properties.$city',
            updated: '$city',
          },
        ],
      },
    ]);
  });
});
