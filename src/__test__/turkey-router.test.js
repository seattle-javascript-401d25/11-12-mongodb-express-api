'use strict';

import faker from 'faker';
import superagent from 'superagent';
import Turkey from '../model/turkey';
import { startServer, stopServer } from '../lib/server';

const apiUrl = `http://localhost:${process.env.PORT}/api/turkey`;


const CreateTurkeyMock = () => {
  return new Turkey({
    species: faker.lorem.words(3),
    location: faker.lorem.words(5),
  }).save();
};

beforeAll(startServer);
afterAll(stopServer);


afterEach(() => Turkey.remove({}));

describe('POST requests to /api/turkey', () => {
  test('POST 200 for successful creation of turkey', () => {
    const mockTurkeyToPost = {
      species: faker.lorem.words(3),
      location: faker.lorem.words(20),
    };
    return superagent.post(apiUrl)
      .send(mockTurkeyToPost)
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.species).toEqual(mockTurkeyToPost.species);
        expect(response.body.location).toEqual(mockTurkeyToPost.location);
        expect(response.body._id).toBeTruthy();
      })
      .catch((err) => {
        throw err;
      });
  });
});


describe('GET requests to /api/turkey', () => {
  test('200 GET for succesful fetching of a turkey', () => {
    let mockTurkey;
    return CreateTurkeyMock()
      .then((turkey) => {
        mockTurkey = turkey;
        return superagent.get(`${apiUrl}/${mockTurkey._id}`);
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.species).toEqual(mockTurkey.species);
        expect(response.body.location).toEqual(mockTurkey.location);
      });
  });

  test('404 GET: no turkey with this id', () => {
    return superagent.get(`${apiUrl}/Id doesn't work`)
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(404);
      });
  });
});

describe('PUT request to /api/turkey', () => {
  test('200 PUT for successful update of a resource', () => {
    return CreateTurkeyMock()
      .then((newTurkey) => {
        return superagent.put(`${apiUrl}/${newTurkey._id}`)
          .send({ species: 'updated species', location: 'updated location' })
          .then((response) => {
            expect(response.status).toEqual(200);
            expect(response.body.species).toEqual('updated species');
            expect(response.body.location).toEqual('updated location');
            expect(response.body._id.toString()).toEqual(newTurkey._id.toString());
          });
      })
      .catch((err) => {
        throw err;
      });
  });
});

describe('DELETE requests to /api/turkey/', () => {
  test('204 DELETE for succuessful deletion of a turkey', () => {
    let mockTurkeyForGet;
    return CreateTurkeyMock()
      .then((turkey) => {
        mockTurkeyForGet = turkey;
        return superagent.delete(`${apiUrl}/${mockTurkeyForGet._id}`);
      })
      .then((response) => {
        expect(response.status).toEqual(204);
      })
      .catch((err) => {
        throw err;
      });
  });
});
