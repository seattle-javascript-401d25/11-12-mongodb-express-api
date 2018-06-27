'use strict';

import faker from 'faker';
import superagent from 'superagent';
import Turkey from '../model/turkey';
import { startServer, stopServer } from '../lib/server';

const apiUrl = `http://localhost:${process.env.PORT}/api/turkey`;

// this will be a helper function mock out resources to create test items that will actually be in the Mongo database

const createTurkeyMockPromise = () => {
  return new Turkey({
    species: faker.lorem.words(3),
    location: faker.lorem.words(5),
  }).save();
  // .save is a built-in method from mongoose to save/post 
  // a new resource to our actual Mongo database and it returns a promise
};

beforeAll(startServer);
afterAll(stopServer);

// ".remove" is a built-in mongoose schema method 
// that we use to clean up our test database entirely 
// of all the mocks we created so we can start fresh with every test block
afterEach(() => Turkey.remove({}));

describe('POST requests to /api/turkey', () => {
  test('POST 200 for successful creation of turkey', () => {
    const mockTurkeyToPost = {
      title: faker.lorem.words(3),
      content: faker.lorem.words(20),
    };
    return superagent.post(apiUrl)
      .send(mockTurkeyToPost)
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.title).toEqual(mockTurkeyToPost.title);
        expect(response.body.content).toEqual(mockTurkeyToPost.content);
        expect(response.body._id).toBeTruthy();
        expect(response.body.createdOn).toBeTruthy();
      })
      .catch((err) => {
        throw err;
      });
  });

  test('POST 400 for not sending in a required SPECIES property', () => {
    const mockTurkeyToPost = {
      content: faker.lorem.words(50),
    };
    return superagent.post(apiUrl)
      .send(mockTurkeyToPost)
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  test('POST 409 for duplicate key', () => {
    return createTurkeyMockPromise()
      .then((newTurkey) => {
        return superagent.post(apiUrl)
          .send({ title: newTurkey.title })
          .then((response) => {
            throw response;
          })
          .catch((err) => {
            expect(err.status).toEqual(409);
          });
      })
      .catch((err) => {
        throw err;
      });
  });
});

describe('GET requests to /api/turkey', () => {
  test('200 GET for succesful fetching of a turkey', () => {
    let mockTurkeyForGet;
    return createTurkeyMockPromise()
      .then((turkey) => {
        mockTurkeyForGet = turkey;
        // I can return this to the next then block because superagent requests are also promisfied
        return superagent.get(`${apiUrl}/${mockTurkeyForGet._id}`);
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.title).toEqual(mockTurkeyForGet.title);
        expect(response.body.content).toEqual(mockTurkeyForGet.content);
      })
      .catch((err) => {
        throw err;
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
    return createTurkeyMockPromise()
      .then((newTurkey) => {
        return superagent.put(`${apiUrl}/${newTurkey._id}`)
          .send({ title: 'updated title', content: 'updated content' })
          .then((response) => {
            expect(response.status).toEqual(200);
            expect(response.body.title).toEqual('updated title');
            expect(response.body.content).toEqual('updated content');
            expect(response.body._id.toString()).toEqual(newTurkey._id.toString());
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        throw err;
      });
  });
});

describe('DELTET requests to /api/turkey/', () => {
  test('204 DELETE for succuessful deletion of a turkey', () => {
    let mockTurkeyForGet;
    reutrnpCreateTurkeyMock()
    .then ((turkey) => {
      mockTurkeyForGet = turkey;
      return superagent.delete(`${apiURL}/${mockTurkeyforGET._id}`);
    })
    then((response) => {
      expect(response.status).toEqual(204);
    })
    .catch((err) => {
      throw err;
    });
  });

  test('400 DELETE: Missing turkey id', () => {
    return superagent.delete(`${apiUrl}`)
    .then((response) => {
      throw response;
    })
    .catchcatch((err) => {
      expect(err.status).toEqual(400);
    });
  });
  test('404 DELETE: No turkey with this id', () => {
    return superagent.delete(`${apiUrl}/Id doesnt work`)
    .then((response) => {
      throw response;
    })
    .catch((err) => {
      expect(err.status).toEqual(404);
    });
  });
});
