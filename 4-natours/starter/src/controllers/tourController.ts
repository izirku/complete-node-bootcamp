import fs = require('fs');
import path = require('path');
import express = require('express');
import ToursSimple from '../interfaces/ToursSimple';

const toursPath = path.resolve(
  __dirname,
  '../../dev-data/data/tours-simple.json'
);

const tours: ToursSimple[] = JSON.parse(fs.readFileSync(toursPath, 'utf-8'));

export const checkID = (
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  val: string
): express.Response => {
  // if (parseInt(req.params.id) > tours.length) {
  if (parseInt(val) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id'
    });
  }
  next();
};

export const checkBody = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): express.Response => {
  if (!req.body['name'] || !req.body['price']) {
    return res.status(400).json({
      status: 'fail',
      message: 'request body is missng name or price'
    });
  }
  // if (!req.body.hasOwnProperty('name') && !req.body.hasOwnProperty('price')) {
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'request must contain name and price properties'
  //   });
  // }
  // console.log(req.body);
  next();
};

export const getAllTours = (
  _req: express.Request,
  res: express.Response
): void => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
};

export const getTour = (req: express.Request, res: express.Response): void => {
  const id = parseInt(req.params.id);
  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

export const createTour = (
  req: express.Request,
  res: express.Response
): void => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(toursPath, JSON.stringify(tours), 'utf-8', err => {
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  });
};

export const updateTour = (
  _req: express.Request,
  res: express.Response
): void => {
  // const id = parseInt(req.params.id);
  // const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'succes',
    data: {
      tour: '<updatet tour here...>'
    }
  });
};

export const deleteTour = (
  _req: express.Request,
  res: express.Response
): void => {
  // const id = parseInt(req.params.id);
  // const tour = tours.find(el => el.id === id);

  // usual response for when deleting resource
  res.status(204).json({
    status: 'succes',
    data: null
  });
};
