'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Taxonomy = require('../models/taxonomy');

const TaxonomyItems = module.context.collection('Taxonomy');
const keySchema = joi.string().required()
.description('The key of the taxonomy');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.tag('taxonomy');


router.get(function (req, res) {
  res.send(TaxonomyItems.all());
}, 'list')
.response([Taxonomy], 'A list of TaxonomyItems.')
.summary('List all TaxonomyItems')
.description(dd`
  Retrieves a list of all TaxonomyItems.
`);


router.post(function (req, res) {
  const taxonomy = req.body;
  let meta;
  try {
    meta = TaxonomyItems.save(taxonomy);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(taxonomy, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: taxonomy._key})
  ));
  res.send(taxonomy);
}, 'create')
.body(Taxonomy, 'The taxonomy to create.')
.response(201, Taxonomy, 'The created taxonomy.')
.error(HTTP_CONFLICT, 'The taxonomy already exists.')
.summary('Create a new taxonomy')
.description(dd`
  Creates a new taxonomy from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let taxonomy
  try {
    taxonomy = TaxonomyItems.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(taxonomy);
}, 'detail')
.pathParam('key', keySchema)
.response(Taxonomy, 'The taxonomy.')
.summary('Fetch a taxonomy')
.description(dd`
  Retrieves a taxonomy by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const taxonomy = req.body;
  let meta;
  try {
    meta = TaxonomyItems.replace(key, taxonomy);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(taxonomy, meta);
  res.send(taxonomy);
}, 'replace')
.pathParam('key', keySchema)
.body(Taxonomy, 'The data to replace the taxonomy with.')
.response(Taxonomy, 'The new taxonomy.')
.summary('Replace a taxonomy')
.description(dd`
  Replaces an existing taxonomy with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let taxonomy;
  try {
    TaxonomyItems.update(key, patchData);
    taxonomy = TaxonomyItems.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(taxonomy);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the taxonomy with.'))
.response(Taxonomy, 'The updated taxonomy.')
.summary('Update a taxonomy')
.description(dd`
  Patches a taxonomy with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    TaxonomyItems.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a taxonomy')
.description(dd`
  Deletes a taxonomy from the database.
`);
