'use strict';

import faker from 'faker';
import superagent from 'superagent';
import Car from '../model/car';
import { startServer, stopServer } from '../lib/server';

const apiUrl = `http://localhost:${process.env.PORT}/api/cars`;

const pCreateCarMock = () => {
  return new Car({
    make: faker.lorem.words(1),
    model: faker.lorem.words(1),
    trim: faker.lorem.words(1),
    addOns: faker.lorem.words(6),
  }).save();
};

beforeAll(startServer);
afterAll(stopServer);

afterEach(() => Car.remove({}));

describe('POST req to /api/cars', () => {
  test('POST 200 for successful create of a car', () => {
    const CarMockPost = {
      make: faker.lorem.words(1),
      model: faker.lorem.words(1),
      // trim: faker.lorem.words(1),
      // addOns: faker.lorem.words(6),
    };
    return superagent.post(apiUrl)
      .send(CarMockPost)
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.make).toEqual(CarMockPost.make);
        expect(response.body.model).toEqual(CarMockPost.model);
        expect(response.body._id).toBeTruthy();
        expect(response.body.createdOn).toBeTruthy();            
      })
      .catch((err) => {
        throw err;
      });
  });

  test('POST 400 for not sending the required MAKE property', () => {
    const CarMockPost = {
      model: faker.lorem.words(1),
      trim: faker.lorem.words(1),
      addOns: faker.lorem.words(6),
    };
    return superagent.post(apiUrl)
      .send(CarMockPost)
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  test('POST 409 for duplicate data', () => {
    return pCreateCarMock()
      .then((newCar) => {
        return superagent.post(apiUrl)
          .send({ make: newCar.make })
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

describe('GET req to /api/cars', () => {
  test('200 GET for successful fetching of a Car', () => {
    let mockCarforGET;
    return pCreateCarMock()
      .then((car) => {
        console.log(pCreateCarMock);
        mockCarforGET = car;
        return superagent.get(`${apiUrl}/${mockCarforGET._id}`);
      })
      .then((response) => {
        expect(response.status).toEqual(200);
        expect(response.body.make).toEqual(mockCarforGET.make);
        expect(response.body.model).toEqual(mockCarforGET.model);
      })
      .catch((err) => {
        throw err;
      });
  });

  test('404 GET : No car with this ID', () => {
    return superagent.get(`${apiUrl}/notgonnawork`)
      .then((response) => {
        throw response;
      })
      .catch((err) => {
        expect(err.status).toEqual(404);
      });
  });
});

describe('PUT request to /api/cars', () => {
  test('200 PUT for successful update to a resource', () => {
    return pCreateCarMock()
      .then((newCar) => {
        return superagent.put(`${apiUrl}/${newCar._id}`)
          .send({ make: 'updated make', model: 'updated model' })
          .then((response) => {
            expect(response.status).toEqual(200);
            expect(response.body.make).toEqual('updated make');
            expect(response.body.model).toEqual('updated model');  
            expect(response.body._id.toString()).toEqual(newCar._id.toString());              
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

describe('DELETE requests to /api/cars/', () => {
  test('204 DELETE for successful deletion of a car', () => {
    let mockCarforGET;
    return pCreateCarMock()
      .then((car) => {
        mockCarforGET = car;
        return superagent.delete(`${apiUrl}/${mockCarforGET._id}`);
      })
      .then((res) => {
        expect(res.status).toEqual(204);
      })
      .catch((err) => {
        throw err;
      });
  });

  test('400 DELETE: missing car id', () => {
    return superagent.delete(`${apiUrl}`)
      .then((res) => {
        throw res;
      })
      .catch((err) => {
        expect(err.status).toEqual(400);
      });
  });

  test('404 DELETE: no car with this id', () => {
    return superagent.delete(`${apiUrl}/notgonnawork`)
      .then((res) => {
        throw res;
      })
      .catch((err) => {
        expect(err.status).toEqual(404);
      });
  });
});
