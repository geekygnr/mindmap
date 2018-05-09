'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Node_Type = require('../models/node_type');

const Node_Types = module.context.collection('Node_Types');
const keySchema = joi.string().required()
.description('The key of the node_Type');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.tag('node_Type');


router.get(function (req, res) {
  res.send(Node_Types.all());
}, 'list')
.response([Node_Type], 'A list of Node_Types.')
.summary('List all Node_Types')
.description(dd`
  Retrieves a list of all Node_Types.
`);


router.post(function (req, res) {
  const node_Type = req.body;
  let meta;
  try {
    meta = Node_Types.save(node_Type);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(node_Type, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: node_Type._key})
  ));
  res.send(node_Type);
}, 'create')
.body(Node_Type, 'The node_Type to create.')
.response(201, Node_Type, 'The created node_Type.')
.error(HTTP_CONFLICT, 'The node_Type already exists.')
.summary('Create a new node_Type')
.description(dd`
  Creates a new node_Type from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let node_Type
  try {
    node_Type = Node_Types.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(node_Type);
}, 'detail')
.pathParam('key', keySchema)
.response(Node_Type, 'The node_Type.')
.summary('Fetch a node_Type')
.description(dd`
  Retrieves a node_Type by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const node_Type = req.body;
  let meta;
  try {
    meta = Node_Types.replace(key, node_Type);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(node_Type, meta);
  res.send(node_Type);
}, 'replace')
.pathParam('key', keySchema)
.body(Node_Type, 'The data to replace the node_Type with.')
.response(Node_Type, 'The new node_Type.')
.summary('Replace a node_Type')
.description(dd`
  Replaces an existing node_Type with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let node_Type;
  try {
    Node_Types.update(key, patchData);
    node_Type = Node_Types.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(node_Type);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the node_Type with.'))
.response(Node_Type, 'The updated node_Type.')
.summary('Update a node_Type')
.description(dd`
  Patches a node_Type with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    Node_Types.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a node_Type')
.description(dd`
  Deletes a node_Type from the database.
`);
