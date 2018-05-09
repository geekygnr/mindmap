'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Field = require('../models/field');

const Fields = module.context.collection('Fields');
const keySchema = joi.string().required()
.description('The key of the field');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.tag('field');


router.get(function (req, res) {
  res.send(Fields.all());
}, 'list')
.response([Field], 'A list of Fields.')
.summary('List all Fields')
.description(dd`
  Retrieves a list of all Fields.
`);


router.post(function (req, res) {
  const field = req.body;
  let meta;
  try {
    meta = Fields.save(field);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(field, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: field._key})
  ));
  res.send(field);
}, 'create')
.body(Field, 'The field to create.')
.response(201, Field, 'The created field.')
.error(HTTP_CONFLICT, 'The field already exists.')
.summary('Create a new field')
.description(dd`
  Creates a new field from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let field
  try {
    field = Fields.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(field);
}, 'detail')
.pathParam('key', keySchema)
.response(Field, 'The field.')
.summary('Fetch a field')
.description(dd`
  Retrieves a field by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const field = req.body;
  let meta;
  try {
    meta = Fields.replace(key, field);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(field, meta);
  res.send(field);
}, 'replace')
.pathParam('key', keySchema)
.body(Field, 'The data to replace the field with.')
.response(Field, 'The new field.')
.summary('Replace a field')
.description(dd`
  Replaces an existing field with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let field;
  try {
    Fields.update(key, patchData);
    field = Fields.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(field);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the field with.'))
.response(Field, 'The updated field.')
.summary('Update a field')
.description(dd`
  Patches a field with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    Fields.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a field')
.description(dd`
  Deletes a field from the database.
`);
