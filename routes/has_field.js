'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Has_Field = require('../models/has_field');

const Has_FieldItems = module.context.collection('Has_Field');
const keySchema = joi.string().required()
.description('The key of the has_Field');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.tag('has_Field');


const NewHas_Field = Object.assign({}, Has_Field, {
  schema: Object.assign({}, Has_Field.schema, {
    _from: joi.string(),
    _to: joi.string()
  })
});


router.get(function (req, res) {
  res.send(Has_FieldItems.all());
}, 'list')
.response([Has_Field], 'A list of Has_FieldItems.')
.summary('List all Has_FieldItems')
.description(dd`
  Retrieves a list of all Has_FieldItems.
`);


router.post(function (req, res) {
  const has_Field = req.body;
  let meta;
  try {
    meta = Has_FieldItems.save(has_Field._from, has_Field._to, has_Field);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(has_Field, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: has_Field._key})
  ));
  res.send(has_Field);
}, 'create')
.body(NewHas_Field, 'The has_Field to create.')
.response(201, Has_Field, 'The created has_Field.')
.error(HTTP_CONFLICT, 'The has_Field already exists.')
.summary('Create a new has_Field')
.description(dd`
  Creates a new has_Field from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let has_Field
  try {
    has_Field = Has_FieldItems.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(has_Field);
}, 'detail')
.pathParam('key', keySchema)
.response(Has_Field, 'The has_Field.')
.summary('Fetch a has_Field')
.description(dd`
  Retrieves a has_Field by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const has_Field = req.body;
  let meta;
  try {
    meta = Has_FieldItems.replace(key, has_Field);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(has_Field, meta);
  res.send(has_Field);
}, 'replace')
.pathParam('key', keySchema)
.body(Has_Field, 'The data to replace the has_Field with.')
.response(Has_Field, 'The new has_Field.')
.summary('Replace a has_Field')
.description(dd`
  Replaces an existing has_Field with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let has_Field;
  try {
    Has_FieldItems.update(key, patchData);
    has_Field = Has_FieldItems.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(has_Field);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the has_Field with.'))
.response(Has_Field, 'The updated has_Field.')
.summary('Update a has_Field')
.description(dd`
  Patches a has_Field with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    Has_FieldItems.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a has_Field')
.description(dd`
  Deletes a has_Field from the database.
`);
