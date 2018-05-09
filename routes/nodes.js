'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Node = require('../models/node');

const Nodes = module.context.collection('Nodes');
const keySchema = joi.string().required()
.description('The key of the node');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.tag('node');


router.get(function (req, res) {
  res.send(Nodes.all());
}, 'list')
.response([Node], 'A list of Nodes.')
.summary('List all Nodes')
.description(dd`
  Retrieves a list of all Nodes.
`);


router.post(function (req, res) {
  const node = req.body;
  let meta;
  try {
    meta = Nodes.save(node);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(node, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: node._key})
  ));
  res.send(node);
}, 'create')
.body(Node, 'The node to create.')
.response(201, Node, 'The created node.')
.error(HTTP_CONFLICT, 'The node already exists.')
.summary('Create a new node')
.description(dd`
  Creates a new node from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let node
  try {
    node = Nodes.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(node);
}, 'detail')
.pathParam('key', keySchema)
.response(Node, 'The node.')
.summary('Fetch a node')
.description(dd`
  Retrieves a node by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const node = req.body;
  let meta;
  try {
    meta = Nodes.replace(key, node);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(node, meta);
  res.send(node);
}, 'replace')
.pathParam('key', keySchema)
.body(Node, 'The data to replace the node with.')
.response(Node, 'The new node.')
.summary('Replace a node')
.description(dd`
  Replaces an existing node with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let node;
  try {
    Nodes.update(key, patchData);
    node = Nodes.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(node);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the node with.'))
.response(Node, 'The updated node.')
.summary('Update a node')
.description(dd`
  Patches a node with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    Nodes.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a node')
.description(dd`
  Deletes a node from the database.
`);
