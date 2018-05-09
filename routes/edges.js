'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Edge = require('../models/edge');

const Edges = module.context.collection('Edges');
const keySchema = joi.string().required()
.description('The key of the edge');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.tag('edge');


const NewEdge = Object.assign({}, Edge, {
  schema: Object.assign({}, Edge.schema, {
    _from: joi.string(),
    _to: joi.string()
  })
});


router.get(function (req, res) {
  res.send(Edges.all());
}, 'list')
.response([Edge], 'A list of Edges.')
.summary('List all Edges')
.description(dd`
  Retrieves a list of all Edges.
`);


router.post(function (req, res) {
  const edge = req.body;
  let meta;
  try {
    meta = Edges.save(edge._from, edge._to, edge);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(edge, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: edge._key})
  ));
  res.send(edge);
}, 'create')
.body(NewEdge, 'The edge to create.')
.response(201, Edge, 'The created edge.')
.error(HTTP_CONFLICT, 'The edge already exists.')
.summary('Create a new edge')
.description(dd`
  Creates a new edge from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let edge
  try {
    edge = Edges.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(edge);
}, 'detail')
.pathParam('key', keySchema)
.response(Edge, 'The edge.')
.summary('Fetch a edge')
.description(dd`
  Retrieves a edge by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const edge = req.body;
  let meta;
  try {
    meta = Edges.replace(key, edge);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(edge, meta);
  res.send(edge);
}, 'replace')
.pathParam('key', keySchema)
.body(Edge, 'The data to replace the edge with.')
.response(Edge, 'The new edge.')
.summary('Replace a edge')
.description(dd`
  Replaces an existing edge with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let edge;
  try {
    Edges.update(key, patchData);
    edge = Edges.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(edge);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the edge with.'))
.response(Edge, 'The updated edge.')
.summary('Update a edge')
.description(dd`
  Patches a edge with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    Edges.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a edge')
.description(dd`
  Deletes a edge from the database.
`);
